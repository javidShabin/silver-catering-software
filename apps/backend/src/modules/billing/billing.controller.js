import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

import { Prisma } from "@prisma/client";
import { invalidateTenantReports } from "../../utils/cacheInvalidator.js";
import jwt from "jsonwebtoken";

/**
 * Get all invoices with filtering
 */
export const getAllInvoices = catchAsync(async (req, res) => {
  const { status, customerId, search, page = 1, limit = 50 } = req.query;
  const MAX_LIMIT = 100;
  const limitNum = Math.min(Number(limit) || 50, MAX_LIMIT);
  const pageNum = Math.max(Number(page) || 1, 1);
  const skip = (pageNum - 1) * limitNum;
  

  const where = {  deletedAt: null };
  if (status && status !== "all") where.status = status;
  if (customerId) where.customerId = customerId;

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { event: { title: { contains: search, mode: "insensitive" } } }
    ];
  }

  const [total, invoices] = await Promise.all([
    prisma.invoice.count({ where }),
    prisma.invoice.findMany({
      where,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        event: { select: { title: true, date: true, extraBills: true, menuItems: { select: { name: true, category: true } } } },
        items: true,
        paymentHistory: true
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: limitNum,
      skip
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
    results: invoices.length,
    data: invoices});
});

/**
 * Get aggregated billing stats
 */
export const getBillingStats = catchAsync(async (req, res) => {
  const { status, customerId, search } = req.query;
  

  const where = {  deletedAt: null };
  if (status && status !== "all") where.status = status;
  if (customerId) where.customerId = customerId;

  if (search) {
    where.OR = [
      { invoiceNumber: { contains: search, mode: "insensitive" } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { event: { title: { contains: search, mode: "insensitive" } } }
    ];
  }

  const result = await prisma.invoice.aggregate({
    where,
    _sum: {
      totalAmount: true,
      advancePaid: true,
      balanceAmount: true}
  });

  res.status(200).json({
    status: "success",
    data: {
      total: result._sum.totalAmount || 0,
      received: result._sum.advancePaid || 0,
      pending: result._sum.balanceAmount || 0}
  });
});

/**
 * Create new invoice
 */
export const createInvoice = catchAsync(async (req, res) => {
  let invoiceNumber = req.body.invoiceNumber;
  

  if (!invoiceNumber) {
    const year = new Date().getFullYear();
    const sequenceId = `invoice_${year}`;
    const sequence = await prisma.sequence.upsert({
      where: { id: sequenceId },
      update: { value: { increment: 1 } },
      create: { id: sequenceId,  value: 1 }
    });
    invoiceNumber = `INV-${year}-${sequence.value.toString().padStart(4, '0')}`;
  }

  const newInvoice = await prisma.invoice.create({
    data: {
      ...req.body,
      
      invoiceNumber
    },
    include: {
      customer: { select: { name: true } },
      event: { select: { title: true, extraBills: true } },
      items: true,
      paymentHistory: true
    }
  });

  res.status(201).json({
    status: "success",
    data: newInvoice});

  invalidateTenantReports();
});

/**
 * Record a payment against an invoice
 */
export const recordPayment = catchAsync(async (req, res) => {
  const { amount, method, reference } = req.body;
  const invoiceId = req.params.id;
  

  const invoice = await prisma.invoice.findFirst({ where: { id: invoiceId} });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  // Use a transaction to apply atomic numerical updates and safely determine status
  const updatedInvoice = await prisma.$transaction(async (tx) => {
    // 1. Atomically apply the payment (increment advance, decrement balance)
    await tx.invoice.updateMany({
      where: { id: invoiceId},
      data: {
        advancePaid: { increment: amount },
        balanceAmount: { decrement: amount }
      }
    });

    const paymentEntry = await tx.payment.create({
      data: {
        invoiceId,
        amount: Number(amount),
        method,
        reference,
        paymentDate: new Date()
      }
    });

    const partialUpdate = await tx.invoice.findFirst({
      where: { id: invoiceId},
      include: {
        paymentHistory: true,
        items: true
      }
    });

    // 2. Read the atomically updated balance to securely decide the new status
    let statusUpdate = partialUpdate.status;
    const currentBalance = new Prisma.Decimal(partialUpdate.balanceAmount);
    const currentAdvance = new Prisma.Decimal(partialUpdate.advancePaid);

    if (currentBalance.lte(0) && statusUpdate !== 'paid') {
      statusUpdate = 'paid';
    } else if (currentAdvance.gt(0) && statusUpdate === 'pending') {
      statusUpdate = 'partially-paid';
    }

    // 3. Update status if necessary
    if (statusUpdate !== partialUpdate.status) {
      await tx.invoice.updateMany({
        where: { id: invoiceId},
        data: { status: statusUpdate }
      });
      return await tx.invoice.findFirst({
        where: { id: invoiceId},
        include: { paymentHistory: true, items: true }
      });
    }

    return partialUpdate;
  });

  // Clear any existing promised payment notifications for this invoice
  await prisma.notification.deleteMany({
    where: {
      
      category: 'billing',
      message: { contains: invoice.invoiceNumber }
    }
  });

  res.status(200).json({
    status: "success",
    data: updatedInvoice});

  invalidateTenantReports();
});

/**
 * Get invoice by ID
 */
export const getInvoice = catchAsync(async (req, res) => {
  const invoice = await prisma.invoice.findFirst({
    where: { id: req.params.id},
    include: {
      customer: true,
      event: {
        include: {
          menuItems: { select: { name: true, category: true } }
        }
      },
      items: true,
      paymentHistory: true
    }
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  res.status(200).json({
    status: "success",
    data: invoice});
});

/**
 * Update invoice status
 */
export const updateInvoiceStatus = catchAsync(async (req, res) => {
  const { status } = req.body;
  const invoiceId = req.params.id;
  

  try {
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId}
    });

    if (!invoice) {
      throw new AppError("No invoice found with that ID", 404);
    }

    const balanceAmount = new Prisma.Decimal(invoice.balanceAmount);
    const advancePaid = new Prisma.Decimal(invoice.advancePaid);

    // Validate Status Transitions based on strict financial rules
    if (status === 'paid' && balanceAmount.gt(0)) {
      throw new AppError(`Cannot mark invoice as 'paid'. There is an outstanding balance of ${balanceAmount}.`, 400);
    }

    if (status === 'partially-paid' && advancePaid.lte(0)) {
      throw new AppError("Cannot mark invoice as 'partially-paid'. No advance payments have been recorded.", 400);
    }
    
    if (status === 'partially-paid' && balanceAmount.lte(0)) {
      throw new AppError("Cannot mark invoice as 'partially-paid'. The balance is already zero (should be 'paid').", 400);
    }

    if (status === 'cancelled' && advancePaid.gt(0)) {
      throw new AppError(`Cannot cancel an invoice that has received payments (${advancePaid}). Please refund or remove the payments first.`, 400);
    }

    await prisma.invoice.updateMany({
      where: { id: invoiceId},
      data: { status }
    });
    
    const updatedInvoice = await prisma.invoice.findFirst({ where: { id: invoiceId } });

    res.status(200).json({
      status: "success",
      data: updatedInvoice});

    invalidateTenantReports();
  } catch (error) {
    throw error;
  }
});

/**
 * Apply a discount to the invoice
 */
export const applyDiscount = catchAsync(async (req, res) => {
  const { discountType, discountValue } = req.body;
  const invoiceId = req.params.id;
  

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId}
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  const updatedInvoice = await prisma.$transaction(async (tx) => {
    // Lock invoice to prevent race conditions during recalculation
    await tx.$executeRaw`SELECT 1 FROM "Invoice" WHERE id = ${invoiceId} FOR UPDATE`;
    
    const lockedInvoice = await tx.invoice.findFirst({ where: { id: invoiceId} });
    if (!lockedInvoice) throw new AppError("Invoice not found", 404);

    const subtotal = new Prisma.Decimal(lockedInvoice.subtotal);
    const taxRate = new Prisma.Decimal(lockedInvoice.taxRate);
    const tax = subtotal.times(taxRate).dividedBy(100);
    const subtotalPlusTax = subtotal.plus(tax);

    let calculatedDiscountAmount = new Prisma.Decimal(0);
    const value = new Prisma.Decimal(discountValue);

    if (discountType === "percentage") {
      if (value.lt(0) || value.gt(100)) {
        throw new AppError("Percentage discount must be between 0 and 100", 400);
      }
      calculatedDiscountAmount = subtotalPlusTax.times(value).dividedBy(100);
    } else {
      if (value.lt(0)) {
        throw new AppError("Fixed discount cannot be negative", 400);
      }
      calculatedDiscountAmount = value;
    }

    // Ensure total amount never falls below zero
    if (calculatedDiscountAmount.gt(subtotalPlusTax)) {
      throw new AppError(`Discount amount (${calculatedDiscountAmount}) cannot exceed the subtotal + tax (${subtotalPlusTax}).`, 400);
    }

    const totalAmount = Prisma.Decimal.max(0, subtotalPlusTax.minus(calculatedDiscountAmount));
    const advancePaid = new Prisma.Decimal(lockedInvoice.advancePaid || 0);
    const balanceAmount = totalAmount.minus(advancePaid);

    let statusUpdate = lockedInvoice.status;
    if (balanceAmount.lte(0) && statusUpdate !== "paid") {
      statusUpdate = "paid";
    } else if (advancePaid.gt(0) && balanceAmount.gt(0) && statusUpdate === "pending") {
      statusUpdate = "partially-paid";
    }

    await tx.invoice.updateMany({
      where: { id: invoiceId},
      data: {
        discountType,
        discountValue: value,
        discountAmount: calculatedDiscountAmount,
        totalAmount,
        balanceAmount,
        status: statusUpdate
      }
    });

    return await tx.invoice.findFirst({ where: { id: invoiceId} });
  });

  res.status(200).json({
    status: "success",
    data: updatedInvoice});

  invalidateTenantReports();
});


/**
 * Delete invoice
 */
export const deleteInvoice = catchAsync(async (req, res) => {
  const invoiceId = req.params.id;
  

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId},
    include: { paymentHistory: true }
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  // Prevent deletion if payment history exists
  if (invoice.paymentHistory && invoice.paymentHistory.length > 0) {
    throw new AppError("Cannot delete invoice because it has recorded payments. Please mark it as 'cancelled' instead to preserve financial audit history.", 400);
  }

  try {
    // Perform Soft Delete
    await prisma.invoice.updateMany({
      where: { id: invoiceId},
      data: {
        deletedAt: new Date(),
        status: "cancelled" // Automatically mark as cancelled when soft deleting
      }
    });

    res.status(204).json({
      status: "success",
      data: null});

    invalidateTenantReports();
  } catch (error) {
    throw error;
  }
});



/**
 * Get count of overdue/promised payments for today and past
 */
export const getOverdueCount = catchAsync(async (req, res) => {
  
  const now = new Date();

  const count = await prisma.invoice.count({
    where: {
      
      deletedAt: null,
      balanceAmount: { gt: 0 },
      OR: [
        { promisedPaymentDate: { lte: now } },
        { 
          promisedPaymentDate: null,
          status: "overdue" 
        }
      ]
    }
  });

  const overdueInvoices = await prisma.invoice.findMany({
    where: {
      
      deletedAt: null,
      balanceAmount: { gt: 0 },
      OR: [
        { promisedPaymentDate: { lte: now } },
        { 
          promisedPaymentDate: null,
          status: "overdue" 
        }
      ]
    },
    select: { customerId: true }
  });

  const customerIds = [...new Set(overdueInvoices.map(inv => inv.customerId))];

  res.status(200).json({
    status: "success",
    data: { count, customerIds }
  });
});

/**
 * Set promised payment date
 */
export const setPromisedDate = catchAsync(async (req, res) => {
  const { promisedPaymentDate } = req.body;
  const invoiceId = req.params.id;
  

  const invoice = await prisma.invoice.findFirst({
    where: { id: invoiceId}
  });

  if (!invoice) {
    throw new AppError("No invoice found with that ID", 404);
  }

  const updatedInvoice = await prisma.invoice.update({
    where: { id: invoiceId },
    data: { promisedPaymentDate: promisedPaymentDate ? new Date(promisedPaymentDate) : null },
    include: {
      customer: true,
      event: true,
      items: true,
      paymentHistory: true
    }
  });

  // Clear any existing promised payment notifications for this invoice since the date was updated
  await prisma.notification.deleteMany({
    where: {
      
      category: 'billing',
      message: { contains: invoice.invoiceNumber }
    }
  });

  res.status(200).json({
    status: "success",
    data: updatedInvoice});
});


/**
 * Update overdue invoices (called by cron)
 */
export const updateOverdueInvoices = async () => {
  const now = new Date();
  const result = await prisma.invoice.updateMany({
    where: {
      status: { in: ["sent", "partially-paid"] },
      dueDate: { lt: now }
    },
    data: {
      status: "overdue"
    }
  });
  console.log(`[Cron] Marked ${result.count} invoices as overdue.`);
};

/**
 * Check promised payments and notify admin (called by cron)
 */
export const checkPromisedPayments = async () => {
  const now = new Date();
  const targetDayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const targetDayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  // Find invoices with promised date today or overdue that have balance
  const pendingInvoices = await prisma.invoice.findMany({
    where: {
      balanceAmount: { gt: 0 },
      promisedPaymentDate: { lte: targetDayEnd },
      status: { not: "paid" },
      deletedAt: null
    },
    include: {
      customer: true
    }
  });

  console.log(`[Cron] Found ${pendingInvoices.length} pending promised payments.`);

  for (const invoice of pendingInvoices) {
    // Notify admins of this tenant
    const tenantAdmins = await prisma.auth.findMany({
      where: {  role: { in: ['admin', 'manager'] }, status: 'active' }
    });
    
    if (tenantAdmins.length > 0) {
      const isPast = new Date(invoice.promisedPaymentDate) < targetDayStart;
      const title = isPast ? 'Overdue Promised Payment' : 'Promised Payment Today';
      const message = `Customer ${invoice.customer.name} has a pending payment of ${invoice.balanceAmount} for invoice ${invoice.invoiceNumber}.`;

      // Check if notification already sent today to avoid spamming
      const existingNotifs = await prisma.notification.findFirst({
        where: {
          
          category: 'billing',
          title,
          message,
          createdAt: { gte: targetDayStart }
        }
      });

      if (!existingNotifs) {
        await prisma.notification.createMany({
          data: tenantAdmins.map(admin => ({
            
            recipientId: admin.id,
            title,
            message,
            type: isPast ? 'error' : 'warning',
            category: 'billing'
          }))
        });
      }
    }
  }
};
