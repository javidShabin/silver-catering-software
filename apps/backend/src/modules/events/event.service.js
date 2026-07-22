import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import invoiceService from "../billing/invoice.service.js";
import inventoryService from "../inventory/inventory.service.js";
import notificationService from "../notifications/notification.service.js";
import crypto from 'crypto';

class EventService {
  /**
   * Helper to check for booking conflicts
   */
  async checkBookingConflict(date, time, location, excludeId = null, tx = prisma) {
    const where = {
      date: new Date(date),
      time,
      location,
      status: { not: "cancelled" }
    };

    if (excludeId) {
      where.id = { not: excludeId };
    }

    const existingEvent = await tx.event.findFirst({ where });
    return existingEvent;
  }

  /**
   * Get all events with filtering and pagination
   */
  async getAllEvents(queryParams) {
    const { status, search, startDate, endDate, cursor, limit = 10} = queryParams;
    const MAX_LIMIT = 100;
    const limitNum = Math.min(Number(limit) || 10, MAX_LIMIT);

    const where = {  deletedAt: null };
    if (status && status !== "all") where.status = status;

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const query = {
      where,
      orderBy: [{ date: "desc" }, { id: "desc" }],
      take: limitNum + 1,
      include: {
        customer: {
          select: { id: true, name: true, email: true }
        }
      }
    };

    if (cursor) {
      query.cursor = { id: cursor };
      query.skip = 1;
    }

    const events = await prisma.event.findMany(query);

    let nextCursor = null;
    if (events.length > limitNum) {
      const nextItem = events.pop();
      nextCursor = nextItem.id;
    }

    return { events, nextCursor };
  }

  /**
   * Get count of overdue (past date, not completed/cancelled) events
   */
  async getOverdueCount() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const count = await prisma.event.count({
      where: {
        
        deletedAt: null,
        date: { lt: today },
        status: { notIn: ["completed", "cancelled"] }
      }
    });
    return count;
  }

  /**
   * Get a single event by ID
   */
  async getEventById(eventId) {
    const event = await prisma.event.findFirst({
      where: { id: eventId },
      include: {
        customer: {
          select: { id: true, name: true, email: true, phone: true }
        },
        menuItems: {
          select: { id: true, name: true, minPrice: true, maxPrice: true }
        },
        assignedStaff: {
          select: { id: true, name: true, email: true, role: true, phone: true, department: true }
        },
        inventoryItems: {
          select: { id: true, name: true, unit: true, quantity: true, rentPerDay: true }
        },
        dutyRoster: {
          select: { id: true, staffId: true, days: true }
        },
        extraBills: {
          select: { id: true, description: true, amount: true }
        },
        inventoryAllocations: {
          select: { id: true, inventoryId: true, name: true, quantity: true, unit: true, isDeducted: true }
        },
        invoices: {
          select: { id: true, invoiceNumber: true, subtotal: true, tax: true, taxRate: true, discountType: true, discountAmount: true, discountValue: true, totalAmount: true, advancePaid: true, balanceAmount: true, status: true }
        }
      }
    });

    if (!event) {
      throw new AppError("No event found with that ID", 404);
    }
    return event;
  }

  /**
   * Create a new event
   */
  async createEvent(eventData, userId) {
    const { date, time, location, customer, title, guestCount, assignedStaff, menuItems, type, inventoryAllocations, staffAllocations, dutyRoster, extraBills, ...rest } = eventData;

    // 1. Check for conflicts
    const conflict = await this.checkBookingConflict(date, time, location);
    if (conflict) {
      throw new AppError("Booking conflict: An event is already scheduled at this time and location.", 400);
    }

    // Use Prisma transaction
    const newEvent = await prisma.$transaction(async (tx) => {
      const data = {
        ...rest,
        
        date: new Date(date),
        time,
        location,
        title,
        guestCount,
        customerId: customer,
        customMenuPrices: eventData.customMenuPrices || {},
        customMenuSelections: eventData.customMenuSelections || {},
        staffAllocations: staffAllocations || []
      };

      if (assignedStaff && assignedStaff.length > 0) {
        data.assignedStaff = {
          connect: assignedStaff.map(id => ({ id }))
        };
      }

      if (menuItems && menuItems.length > 0) {
        data.menuItems = {
          connect: menuItems.map(id => ({ id }))
        };
      }

      if (inventoryAllocations && Array.isArray(inventoryAllocations)) {
        data.inventoryAllocations = {
          create: inventoryAllocations.map(a => ({
            
            inventoryId: a.inventoryId,
            name: a.name || "",
            quantity: Number(a.quantity) || 0,
            unit: a.unit || "unit",
            isDeducted: true // Instantly deducted on create
          }))
        };
      }

      if (dutyRoster && Array.isArray(dutyRoster)) {
        data.dutyRoster = {
          create: dutyRoster.map(dr => ({
            
            staffId: dr.staffId || dr.staff,
            days: Array.isArray(dr.days) ? dr.days : []
          }))
        };
      }

      if (extraBills && Array.isArray(extraBills)) {
        data.extraBills = {
          create: extraBills.map(eb => ({
            
            description: eb.description || "",
            amount: Number(eb.amount) || 0
          }))
        };
      }

      // 2. Create the event
      const createdEvent = await tx.event.create({
        data
      });

      // 3. Auto-calculate and synchronize invoice
      await invoiceService.syncEventInvoice(createdEvent.id, tx);

      // 4. Deduct inventory for new allocations (Pipelined parallel execution)
      if (inventoryAllocations && Array.isArray(inventoryAllocations)) {
        // Sort allocations by ID to enforce deterministic lock acquisition and prevent Postgres deadlocks
        const sortedAllocations = [...inventoryAllocations].sort((a, b) => a.inventoryId.localeCompare(b.inventoryId));

        for (const alloc of sortedAllocations.filter(alloc => Number(alloc.quantity) > 0)) {
          await inventoryService.adjustInventoryStock(
            alloc.inventoryId,
            Number(alloc.quantity),
            "subtract",
            `Event Allocation: Assigned to ${title}`,
            createdEvent.id,
            userId,
            tx
          );
        }
      }

      // 5. Create notification for admin
      if (userId) {
        await notificationService.sendNotification(
          userId,
          "New Event Created",
          `Event '${title}' has been scheduled for ${new Date(date).toLocaleDateString()}`,
          "info",
          "event",
          tx
        );
      }

      return createdEvent;
    });

    return newEvent;
  }

  /**
   * Update an event
   */
  async updateEvent(eventId, updateDataParams, userId) {
    const { date, time, location, assignedStaff, menuItems, inventoryItems, dutyRoster, extraBills, customer, type, taxRate, discountValue, staffAllocations, ...rest } = updateDataParams;
    let { inventoryAllocations } = updateDataParams;

    try {
      const updatedEvent = await prisma.$transaction(async (tx) => {
        // 1. If date/time/location updated, check for conflicts
        if (date || time || location) {
          const current = await tx.event.findFirst({ where: { id: eventId } });
          if (!current) throw new AppError("No event found with that ID", 404);

          const checkDate = date || current.date;
          const checkTime = time || current.time;
          const checkLoc = location || current.location;

          const conflict = await this.checkBookingConflict(checkDate, checkTime, checkLoc, eventId, tx);
          if (conflict) {
            throw new AppError("Booking conflict: Target time and location already occupied.", 400);
          }
        }

        const updateData = { ...rest };
        if (date) updateData.date = new Date(date);
        if (time) updateData.time = time;
        if (location) updateData.location = location;
        if (customer) updateData.customerId = customer;
        if (updateDataParams.customMenuPrices !== undefined) updateData.customMenuPrices = updateDataParams.customMenuPrices;
        if (updateDataParams.customMenuSelections !== undefined) updateData.customMenuSelections = updateDataParams.customMenuSelections;
        if (staffAllocations !== undefined) updateData.staffAllocations = staffAllocations;

        if (assignedStaff) {
          updateData.assignedStaff = {
            set: assignedStaff.map(id => ({ id }))
          };
        }

        if (menuItems) {
          updateData.menuItems = {
            set: menuItems.map(id => ({ id }))
          };
        }

        if (inventoryItems) {
          updateData.inventoryItems = {
            set: inventoryItems.map(id => ({ id }))
          };
        }

        const currentEventState = await tx.event.findFirst({
          where: { id: eventId },
          include: {
            inventoryAllocations: {
              include: { inventory: true }
            }
          }
        });

        if (!currentEventState) throw new AppError("No event found with that ID", 404);

        // Detect Cancellation Transition
        const isCancelling = updateData.status === 'cancelled' && currentEventState.status !== 'cancelled';
        const isCompleting = updateData.status === 'completed' && currentEventState.status !== 'completed';

        if (isCancelling) {
          const allocsToRestore = currentEventState.inventoryAllocations || [];
          const sortedAllocs = [...allocsToRestore].sort((a, b) => a.inventoryId.localeCompare(b.inventoryId));

          for (const alloc of sortedAllocs.filter(alloc => alloc.isDeducted && Number(alloc.quantity) > 0)) {
            await inventoryService.adjustInventoryStock(
              alloc.inventoryId,
              Number(alloc.quantity),
              "add",
              `Event Cancelled: Restoring allocation for event`,
              eventId,
              userId,
              tx
            );
          }

          // Mark as no longer deducted to prevent duplicate restorations in the future
          await tx.inventoryAllocation.updateMany({
            where: { eventId: eventId },
            data: { isDeducted: false }
          });

          // Skip any incoming allocation updates since the event is cancelled
          inventoryAllocations = undefined;
        } else if (isCompleting) {
          const allocsToRestore = currentEventState.inventoryAllocations || [];
          const sortedAllocs = [...allocsToRestore].sort((a, b) => a.inventoryId.localeCompare(b.inventoryId));
          for (const alloc of sortedAllocs.filter(alloc => alloc.isDeducted && Number(alloc.quantity) > 0 && alloc.inventory?.isConsumable === false)) {
            await inventoryService.adjustInventoryStock(
              alloc.inventoryId,
              Number(alloc.quantity),
              "add",
              `Event Completed: Restoring reusable equipment`,
              eventId,
              userId,
              tx
            );
            // Mark this specific allocation as no longer deducted
            await tx.inventoryAllocation.update({
              where: { id: alloc.id },
              data: { isDeducted: false }
            });
          }

          // Trigger Feedback Job if tenant has feature enabled
          const hasFeedbackFeature = true;
          if (hasFeedbackFeature) {
            // Process feedback link generation asynchronously without blocking the request
            setTimeout(async () => {
              try {
                const existingFeedback = await prisma.feedback.findFirst({
                  where: { eventId}
                });

                if (!existingFeedback) {
                  const token = crypto.randomBytes(32).toString('hex');
                  await prisma.feedback.create({
                    data: {
                      eventId,
                      
                      token,
                      status: 'pending'
                    }
                  });

                  const customer = await prisma.customer.findUnique({ where: { id: currentEventState.customerId } });

                  const feedbackUrl = `${process.env.FRONTEND_URL}/feedback/${token}`;
                  console.log(`\n================= NOTIFICATION =================`);
                  console.log(`To: ${customer?.name} (${customer?.email})`);
                  console.log(`Subject: How was your event?`);
                  console.log(`Message: Thank you for choosing us for '${currentEventState.title}'. Please share your feedback:`);
                  console.log(`Link: ${feedbackUrl}`);
                  console.log(`================================================\n`);
                }
              } catch (err) {
                console.error('[Feedback] Failed to generate feedback link:', err);
              }
            }, 5000);
          }
        }

        if (inventoryAllocations && Array.isArray(inventoryAllocations)) {
          const currentEvent = currentEventState;

          const oldAllocations = currentEvent.inventoryAllocations || [];
          const newAllocations = inventoryAllocations;

          const operations = [];

          // 1. Process deletions and updates (restore or adjust)
          for (const oldAlloc of oldAllocations) {
            const newAlloc = newAllocations.find(a => a.inventoryId === oldAlloc.inventoryId);

            if (!newAlloc) {
              // Deleted: Restore full quantity
              if (Number(oldAlloc.quantity) > 0) {
                operations.push({ id: oldAlloc.inventoryId, qty: Number(oldAlloc.quantity), type: "add", msg: `Event Allocation: Removed from ${currentEvent.title}` });
              }
            } else {
              // Edited: Check difference
              const oldQty = Number(oldAlloc.quantity);
              const newQty = Number(newAlloc.quantity || 0);

              if (oldQty !== newQty) {
                const diff = newQty - oldQty;
                if (diff > 0) {
                  operations.push({ id: oldAlloc.inventoryId, qty: diff, type: "subtract", msg: `Event Allocation: Increased for ${currentEvent.title}` });
                } else if (diff < 0) {
                  operations.push({ id: oldAlloc.inventoryId, qty: Math.abs(diff), type: "add", msg: `Event Allocation: Decreased for ${currentEvent.title}` });
                }
              }
              newAlloc.isDeducted = true;
            }
          }

          // 2. Process completely new additions
          for (const newAlloc of newAllocations) {
            const oldAlloc = oldAllocations.find(a => a.inventoryId === newAlloc.inventoryId);
            if (!oldAlloc) {
              // New: Deduct full quantity
              if (Number(newAlloc.quantity) > 0) {
                operations.push({ id: newAlloc.inventoryId, qty: Number(newAlloc.quantity), type: "subtract", msg: `Event Allocation: Assigned to event` });
              }
              newAlloc.isDeducted = true;
            }
          }

          // Execute adjustments sequentially to honor Prisma transaction state machine rules
          operations.sort((a, b) => a.id.localeCompare(b.id));
          for (const op of operations) {
            await inventoryService.adjustInventoryStock(op.id, op.qty, op.type, op.msg, eventId, userId, tx);
          }

          if (newAllocations.length === 0) {
            await tx.inventoryAllocation.deleteMany({
              where: { eventId: currentEvent.id }
            });
          } else {
            updateData.inventoryAllocations = {
              deleteMany: {},
              create: newAllocations.map(a => ({
                
                inventoryId: a.inventoryId,
                name: a.name || "",
                quantity: Number(a.quantity) || 0,
                unit: a.unit || "unit",
                isDeducted: a.isDeducted || false
              }))
            };
          }
        }

        if (dutyRoster && Array.isArray(dutyRoster)) {
          updateData.dutyRoster = {
            deleteMany: {},
            create: dutyRoster.map(dr => ({
              
              staffId: dr.staffId || dr.staff,
              days: Array.isArray(dr.days) ? dr.days : []
            }))
          };
        }

        // ExtraBills logic removed. Dedicated CRUD endpoints created for safe concurrent updates.

        await tx.event.update({
          where: { id: eventId },
          data: updateData});

        // Update Invoice Tax and Discount if provided
        if (taxRate !== undefined || discountValue !== undefined) {
          const draftInvoice = await tx.invoice.findFirst({ where: { eventId: eventId } });
          if (draftInvoice) {
            await tx.invoice.update({
              where: { id: draftInvoice.id },
              data: {
                ...(taxRate !== undefined && { taxRate: Number(taxRate) }),
                ...(discountValue !== undefined && { discountValue: Number(discountValue) }),
                ...(discountValue !== undefined && { discountType: "fixed" })}
            });
          }
        }

        // Auto-recalculate and sync billing details on update
        await invoiceService.syncEventInvoice(eventId, tx);

        const event = await tx.event.findFirst({
          where: { id: eventId},
          include: {
            customer: {
              select: { id: true, name: true, email: true, phone: true }
            },
            menuItems: {
              select: { id: true, name: true, minPrice: true, maxPrice: true }
            },
            assignedStaff: {
              select: { id: true, name: true, email: true, role: true, phone: true, department: true }
            },
            inventoryItems: {
              select: { id: true, name: true, unit: true, quantity: true, rentPerDay: true }
            },
            dutyRoster: {
              select: { id: true, staffId: true, days: true }
            },
            extraBills: {
              select: { id: true, description: true, amount: true }
            },
            inventoryAllocations: {
              select: { id: true, inventoryId: true, name: true, quantity: true, unit: true, isDeducted: true }
            },
            invoices: {
              select: { id: true, invoiceNumber: true, subtotal: true, tax: true, taxRate: true, discountType: true, discountAmount: true, discountValue: true, totalAmount: true, advancePaid: true, balanceAmount: true, status: true }
            }
          }
        });

        // 3. If staff assigned, notify them (simulated)
        if (assignedStaff && assignedStaff.length > 0) {
          await notificationService.sendNotification(
            assignedStaff[0],
            "New Assignment",
            `You have been assigned to event: ${event.title}`,
            "info",
            "event",
            tx
          );
        }

        return event;
      });

      return updatedEvent;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError("No event found with that ID", 404);
      }
      throw error;
    }
  }

  /**
   * Delete an event
   */
  async deleteEvent(eventId) {
    try {
      await prisma.$transaction(async (tx) => {
        // 1. Fetch event with financial relations
        const event = await tx.event.findFirst({
          where: { id: eventId },
          include: { invoices: { include: { paymentHistory: true } }, inventoryAllocations: true }
        });

        if (!event) throw new AppError("No event found with that ID", 404);

        // 2. We no longer prevent deletion if payments exist.
        // We allow soft-deletion of the event and cancellation of its invoices.
        // (The payments remain in the DB attached to the cancelled invoice for record-keeping)

        // 3. Restore inventory allocations (Pipelined parallel execution)
        if (event.inventoryAllocations && event.inventoryAllocations.length > 0) {
          const sortedAllocs = [...event.inventoryAllocations].sort((a, b) => a.inventoryId.localeCompare(b.inventoryId));

          for (const alloc of sortedAllocs.filter(alloc => alloc.isDeducted && Number(alloc.quantity) > 0)) {
            await inventoryService.adjustInventoryStock(
              alloc.inventoryId,
              Number(alloc.quantity),
              "add",
              `Event Cancelled: Restoring allocation for event`,
              event.id,
              null,
              tx
            );
          }
        }

        // 4. Cancel related invoices so they don't show as pending debt
        await tx.invoice.updateMany({
          where: { eventId: eventId },
          data: { status: "cancelled" }
        });

        // 5. Soft Delete the Event
        await tx.event.updateMany({
          where: { id: eventId },
          data: {
            deletedAt: new Date(),
            status: "cancelled"
          }
        });
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new AppError("No event found with that ID", 404);
      }
      throw error;
    }
  }
}

export default new EventService();
