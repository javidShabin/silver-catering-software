import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import {
  parsePaginationParams,
  buildPrismaPageArgs,
  buildPageResponse} from "../../utils/pagination.js";
import notificationService from "../notifications/notification.service.js";
import invoiceService from "../billing/invoice.service.js";

function generateQuotationNumber() {
  return `QT-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
}

// ─── List (paginated) ────────────────────────────────────────────────────────

export const getAllQuotations = async (req, res, next) => {
  try {
    const { limit, cursor, direction } = parsePaginationParams(req);
    

    // Optional filters
    const where = { };
    if (req.query.status) where.status = req.query.status;
    if (req.query.customerId) where.customerId = req.query.customerId;

    const pageArgs = buildPrismaPageArgs({ limit, cursor, direction }, where);

    const raw = await prisma.quotation.findMany({
      ...pageArgs,
      include: {
        customer: true,
        menuItems: true},
      orderBy: [{ createdAt: "desc" }, { id: "desc" }]});

    const { data: quotations, pagination } = buildPageResponse(raw, limit, direction);

    res.status(200).json({
      status: "success",
      pagination,
      results: quotations.length,
      data: { quotations }});
  } catch (error) {
    next(error);
  }
};

// ─── Single record ───────────────────────────────────────────────────────────

export const getQuotation = async (req, res, next) => {
  try {
    const quotation = await prisma.quotation.findFirst({
      where: { id: req.params.id},
      include: { customer: true, menuItems: true }});

    if (!quotation) {
      return next(new AppError("No quotation found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      data: { quotation }});
  } catch (error) {
    next(error);
  }
};

// ─── Create ──────────────────────────────────────────────────────────────────

export const createQuotation = async (req, res, next) => {
  try {
    const {
      menuItems,
      inventoryAllocations,
      customItems,
      customMenuPrices,
      cateringBoysCount,
      cateringBoyRate,
      guestCount,
      durationInDays,
      taxPercent, // Remove from rest to avoid Prisma error
      customMenuSelections,
      customer,
      customerId,
      ...rest
    } = req.body;

    
    const data = {
      ...rest,
      
      customerId: customerId || customer,
      quotationNumber: generateQuotationNumber(),
      guestCount: guestCount ? Number(guestCount) : 50,
      durationInDays: durationInDays ? Number(durationInDays) : 1,
      cateringBoysCount: cateringBoysCount ? Number(cateringBoysCount) : 0,
      cateringBoyRate: cateringBoyRate ? Number(cateringBoyRate) : 0,
      customMenuPrices: customMenuPrices || {},
      customMenuSelections: customMenuSelections || {},
      inventoryAllocations: inventoryAllocations || [],
      customItems: customItems || []
    };

    if (menuItems && Array.isArray(menuItems) && menuItems.length > 0) {
      data.menuItems = {
        connect: menuItems.map(id => ({ id }))
      };
    }

    const newQuotation = await prisma.quotation.create({
      data,
      include: { menuItems: true, customer: true }});

    res.status(201).json({
      status: "success",
      data: { quotation: newQuotation }});
  } catch (error) {
    next(error);
  }
};

// ─── Update ──────────────────────────────────────────────────────────────────

export const updateQuotation = async (req, res, next) => {
  try {
    
    const existing = await prisma.quotation.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      return next(new AppError("No quotation found with that ID", 404));
    }

    const {
      menuItems,
      inventoryAllocations,
      customItems,
      customMenuPrices,
      cateringBoysCount,
      cateringBoyRate,
      guestCount,
      durationInDays,
      taxPercent, // Remove from rest to avoid Prisma error
      customMenuSelections,
      customer,
      customerId,
      ...rest
    } = req.body;

    const updateData = { ...rest };
    if (customer || customerId) updateData.customerId = customerId || customer;

    if (guestCount !== undefined) updateData.guestCount = Number(guestCount);
    if (durationInDays !== undefined) updateData.durationInDays = Number(durationInDays);
    if (cateringBoysCount !== undefined) updateData.cateringBoysCount = Number(cateringBoysCount);
    if (cateringBoyRate !== undefined) updateData.cateringBoyRate = Number(cateringBoyRate);
    if (customMenuPrices !== undefined) updateData.customMenuPrices = customMenuPrices;
    if (customMenuSelections !== undefined) updateData.customMenuSelections = customMenuSelections;
    if (inventoryAllocations !== undefined) updateData.inventoryAllocations = inventoryAllocations;
    if (customItems !== undefined) updateData.customItems = customItems;

    if (menuItems && Array.isArray(menuItems)) {
      updateData.menuItems = {
        set: menuItems.map(id => ({ id }))
      };
    }

    const updatedQuotation = await prisma.quotation.update({
      where: { id: req.params.id },
      data: updateData,
      include: { menuItems: true, customer: true }});

    res.status(200).json({
      status: "success",
      data: { quotation: updatedQuotation }});
  } catch (error) {
    next(error);
  }
};

// ─── Delete ──────────────────────────────────────────────────────────────────

export const deleteQuotation = async (req, res, next) => {
  try {
    const existing = await prisma.quotation.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      return next(new AppError("No quotation found with that ID", 404));
    }

    await prisma.quotation.delete({
      where: { id: req.params.id }});

    res.status(204).json({
      status: "success",
      data: null});
  } catch (error) {
    next(error);
  }
};

// ─── Approve → create Event + Invoice ───────────────────────────────────────

export const approveQuotation = async (req, res, next) => {
  try {
    const quotationId = req.params.id;
    
    const { title, date, time, location, guestCount, advanceAmount } = req.body;

    const existingQuotation = await prisma.quotation.findFirst({
      where: { id: quotationId},
      include: {
        customer: true,
        menuItems: true
      }
    });

    if (!existingQuotation) {
      return next(new AppError("No quotation found with that ID", 404));
    }

    // Use a transaction to ensure everything is created successfully or not at all
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update quotation status
      const quotation = await tx.quotation.update({
        where: { id: quotationId },
        data: { status: "approved" },
        include: { customer: true, menuItems: true }});

      // Prepare Event Data
      const eventData = {
        
        title: title || `Event for ${quotation.customer.name}`,
        date: date ? new Date(date) : quotation.validUntil,
        time: time || "09:00",
        location: location || quotation.customer.address || "TBD",
        guestCount: guestCount ? Number(guestCount) : quotation.guestCount,
        durationInDays: quotation.durationInDays,
        status: "confirmed",
        notes: `Created from Quotation ${quotation.quotationNumber}. ${quotation.notes || ""}`,
        customerId: quotation.customerId,
        cateringBoysCount: quotation.cateringBoysCount,
        cateringBoyRate: quotation.cateringBoyRate,
        customMenuPrices: quotation.customMenuPrices || {},
        customMenuSelections: quotation.customMenuSelections || {},
        packageId: quotation.packageId,
        advanceAmount: advanceAmount ? Number(advanceAmount) : 0
      };

      if (quotation.menuItems && quotation.menuItems.length > 0) {
        eventData.menuItems = {
          connect: quotation.menuItems.map(m => ({ id: m.id }))
        };
      }

      let parsedAllocations = quotation.inventoryAllocations;
      if (typeof parsedAllocations === 'string') {
        try {
          parsedAllocations = JSON.parse(parsedAllocations);
        } catch (e) {
          console.error("Failed to parse inventoryAllocations:", e);
        }
      }

      if (parsedAllocations && Array.isArray(parsedAllocations)) {
        eventData.inventoryAllocations = {
          create: parsedAllocations.map(a => ({
            
            inventoryId: a.inventoryId,
            name: a.name || "",
            quantity: Number(a.quantity) || 0,
            unit: a.unit || "unit",
            isDeducted: false
          }))
        };
        // Explicitly connect inventory items so the Event relation is populated
        const uniqueInventoryIds = [...new Set(parsedAllocations.map(a => a.inventoryId))];
        eventData.inventoryItems = {
          connect: uniqueInventoryIds.map(id => ({ id }))
        };
      }

      // 2. Create the confirmed event based on quotation data and user input
      const event = await tx.event.create({
        data: eventData
      });

      // Send event creation notification
      const userId = req.user?._id || req.user?.id;
      if (userId) {
        await notificationService.sendNotification(
          userId,
          "New Event Created",
          `Event '${event.title}' has been scheduled for ${new Date(event.date).toLocaleDateString()}`,
          "info",
          "event",
          
          tx
        );
      }

      // 3. Auto-sync invoice
      await invoiceService.syncEventInvoice(event.id, tx);

      const draftInvoice = await tx.invoice.findFirst({ where: { eventId: event.id } });

      if (draftInvoice) {
        // Calculate tax rate from quotation
        const subtotal = Number(quotation.subtotal) || 0;
        const tax = Number(quotation.tax) || 0;
        const taxRate = subtotal > 0 ? (tax / subtotal) * 100 : 0;

        // Create manual invoice items for custom items
        const customItems = Array.isArray(quotation.customItems) ? quotation.customItems : [];
        if (customItems.length > 0) {
          await tx.invoiceItem.createMany({
            data: customItems.map(item => ({
              invoiceId: draftInvoice.id,
              description: item.description || "Custom Item",
              quantity: Number(item.quantity) || 1,
              unitPrice: Number(item.unitPrice) || 0,
              total: Number(item.total) || 0,
              isManual: true
            }))
          });
        }

        // Update invoice tax and discount settings to match quotation
        await tx.invoice.update({
          where: { id: draftInvoice.id },
          data: {
            taxRate: taxRate,
            discountType: "fixed",
            discountValue: quotation.discountAmount
          }
        });

        // Sync again to incorporate the manual items, tax, and discount
        await invoiceService.syncEventInvoice(event.id, tx);
      }

      const invoice = await tx.invoice.findFirst({ where: { eventId: event.id } });

      return { quotation, event, invoice };
    });

    res.status(200).json({
      status: "success",
      data: result});
  } catch (error) {
    next(error);
  }
};
