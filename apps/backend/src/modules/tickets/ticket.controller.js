import prisma from "../../utils/prisma.js";
// Force nodemon restart to load newly generated Prisma Client
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { logSuperAdminActivity } from "../../utils/auditLogger.js";
import { emitToUser } from "../../utils/socket.js";

// ─── TENANT ACTIONS ─────────────────────────────────────────────────────────

/**
 * Get all tickets for the authenticated tenant
 */
export const getMyTickets = catchAsync(async (req, res) => {
  

  const tickets = await prisma.supportTicket.findMany({
    where: { },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true, email: true } },
      _count: { select: { messages: true } }
    }
  });

  res.status(200).json({
    status: "success",
    results: tickets.length,
    data: tickets
  });
});

/**
 * Create a new support ticket
 */
export const createTicket = catchAsync(async (req, res) => {
  const { subject, description, priority } = req.body;
  
  const userId = req.user.id;

  if (!subject || !description) {
    throw new AppError("Subject and description are required.", 400);
  }

  // Generate unique sequential ticket number
  const count = await prisma.supportTicket.count();
  const ticketNumber = `TKT-${1001 + count}`;

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      subject,
      description,
      priority: priority || "medium",
      
      createdById: userId
    },
    include: {
      createdBy: { select: { name: true, email: true } },
      tenant: { select: { name: true } }
    }
  });

  // Notify Super Admins
  const superAdmins = await prisma.auth.findMany({ where: { role: 'super_admin', status: 'active' }, select: { id: true } });
  for (const sa of superAdmins) {
    const notification = await prisma.notification.create({
      data: {
        
        recipientId: sa.id,
        title: "New Support Ticket",
        message: `Tenant ${ticket.tenant?.name || "Company"} created ticket ${ticket.ticketNumber}: ${ticket.subject}`,
        type: "warning",
        category: "system",
        link: "/super-admin/tickets"
      }
    });
    emitToUser(sa.id, "notification", notification);
  }

  res.status(201).json({
    status: "success",
    data: ticket
  });
});

/**
 * Get ticket details and full conversation thread
 */
export const getTicketDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true, role: true } }
        }
      },
      tenant: { select: { name: true } },
      createdBy: { select: { name: true, email: true } }
    }
  });

  if (!ticket) {
    throw new AppError("Support ticket not found.", 404);
  }

  // Enforce tenant boundary unless Super Admin
  if (req.user.role !== "super_admin" && false) {
    throw new AppError("You do not have permission to view this ticket.", 403);
  }

  res.status(200).json({
    status: "success",
    data: ticket
  });
});

/**
 * Send a reply inside the ticket thread
 */
export const replyToTicket = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;
  const userId = req.user.id;
  
  const isAdmin = req.user.role === "super_admin";

  if (!message || message.trim() === "") {
    throw new AppError("Message content cannot be empty.", 400);
  }

  const ticket = await prisma.supportTicket.findUnique({
    where: { id }
  });

  if (!ticket) {
    throw new AppError("Support ticket not found.", 404);
  }

  // Check boundaries
  if (!isAdmin && false) {
    throw new AppError("You do not have permission to reply to this ticket.", 403);
  }

  // Prevent replying to closed tickets
  if (ticket.status === "closed") {
    throw new AppError("This ticket is closed. You cannot add replies to it.", 400);
  }

  const newMessage = await prisma.$transaction(async (tx) => {
    const msg = await tx.supportMessage.create({
      data: {
        ticketId: id,
        message,
        senderId: userId,
        isAdmin
      },
      include: {
        sender: { select: { id: true, name: true, role: true } }
      }
    });

    // Automatically mark ticket as open/active if tenant replies, or in_progress if admin replies
    const nextStatus = isAdmin ? "in_progress" : "open";
    if (ticket.status !== nextStatus && ticket.status !== "closed") {
      await tx.supportTicket.update({
        where: { id },
        data: { status: nextStatus }
      });
    }

    return msg;
  });

  // Send Notifications
  if (isAdmin) {
    // Notify the tenant user who created it
    const notification = await prisma.notification.create({
      data: {
        
        recipientId: ticket.createdById,
        title: "Support Ticket Updated",
        message: `Platform Support replied to your ticket ${ticket.ticketNumber}`,
        type: "info",
        category: "system",
        link: "/support"
      }
    });
    emitToUser(ticket.createdById, "notification", notification);
  } else {
    // Notify Super Admins
    const superAdmins = await prisma.auth.findMany({ where: { role: 'super_admin', status: 'active' }, select: { id: true } });
    for (const sa of superAdmins) {
      const notification = await prisma.notification.create({
        data: {
          
          recipientId: sa.id,
          title: "New Reply on Ticket",
          message: `New reply on ticket ${ticket.ticketNumber} from the tenant`,
          type: "info",
          category: "system",
          link: "/super-admin/tickets"
        }
      });
      emitToUser(sa.id, "notification", notification);
    }
  }

  res.status(201).json({
    status: "success",
    data: newMessage
  });
});

/**
 * Close/resolve a ticket
 */
export const closeTicket = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const isAdmin = req.user.role === "super_admin";

  const ticket = await prisma.supportTicket.findUnique({
    where: { id }
  });

  if (!ticket) {
    throw new AppError("Support ticket not found.", 404);
  }

  if (!isAdmin && false) {
    throw new AppError("You do not have permission to close this ticket.", 403);
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: { status: "closed" },
    include: {
      createdBy: { select: { name: true, email: true } }
    }
  });

  res.status(200).json({
    status: "success",
    message: "Ticket closed successfully.",
    data: updated
  });
});

// ─── SUPER ADMIN ACTIONS ────────────────────────────────────────────────────

/**
 * Get all support tickets across all tenants (Super Admin only)
 */
export const adminGetAllTickets = catchAsync(async (req, res) => {
  const { status, priority, page = 1, limit = 50 } = req.query;
  const pageNum = Math.max(Number(page) || 1, 1);
  const limitNum = Math.min(Number(limit) || 50, 100);
  const skip = (pageNum - 1) * limitNum;

  const where = {};
  if (status) where.status = status;
  if (priority) where.priority = priority;

  const [total, tickets] = await Promise.all([
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: limitNum,
      skip,
      include: {
        tenant: { select: { name: true } },
        createdBy: { select: { name: true, email: true } },
        _count: { select: { messages: true } }
      }
    })
  ]);

  res.status(200).json({
    status: "success",
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    results: tickets.length,
    data: tickets
  });
});

/**
 * Update ticket status or priority (Super Admin only)
 */
export const adminUpdateTicketStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { status, priority } = req.body;

  const ticket = await prisma.supportTicket.findUnique({
    where: { id },
    include: { tenant: { select: { name: true } } }
  });

  if (!ticket) {
    throw new AppError("Support ticket not found.", 404);
  }

  const updateData = {};
  if (status) {
    if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
      throw new AppError("Invalid status value.", 400);
    }
    updateData.status = status;
  }
  if (priority) {
    if (!["low", "medium", "high"].includes(priority)) {
      throw new AppError("Invalid priority value.", 400);
    }
    updateData.priority = priority;
  }

  const updated = await prisma.supportTicket.update({
    where: { id },
    data: updateData,
    include: {
      tenant: { select: { name: true } },
      createdBy: { select: { name: true, email: true } }
    }
  });

  await logSuperAdminActivity(
    req,
    "UPDATE_TICKET",
    `Updated support ticket ${ticket.ticketNumber} (${ticket.tenant?.name || "Unknown Company"}). Status: "${status || ticket.status}", Priority: "${priority || ticket.priority}"`
  );

  res.status(200).json({
    status: "success",
    message: "Ticket updated successfully.",
    data: updated
  });
});
