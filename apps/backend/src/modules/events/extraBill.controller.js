import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import invoiceService from "../billing/invoice.service.js";
import { invalidateTenantReports } from "../../utils/cacheInvalidator.js";

/**
 * Get all extra bills for an event
 */
export const getExtraBills = catchAsync(async (req, res) => {
  const eventId = req.params.id;

  const extraBills = await prisma.extraBill.findMany({
    where: { 
      eventId},
    orderBy: { description: 'asc' }
  });

  res.status(200).json({
    status: "success",
    results: extraBills.length,
    data: extraBills});
});

/**
 * Add an extra bill to an event
 */
export const addExtraBill = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const { description, amount } = req.body;

  if (!description || amount === undefined) {
    throw new AppError("Description and amount are required", 400);
  }

  const event = await prisma.event.findFirst({ 
    where: { 
      id: eventId} 
  });
  if (!event) {
    throw new AppError("No event found with that ID", 404);
  }

  const newBill = await prisma.$transaction(async (tx) => {
    const bill = await tx.extraBill.create({
      data: {
        eventId,
        
        description,
        amount: Number(amount)
      }
    });

    // Sync financial data
    await invoiceService.syncEventInvoice(eventId, tx);

    return bill;
  });

  res.status(201).json({
    status: "success",
    data: newBill});

  invalidateTenantReports();
});

/**
 * Update an extra bill
 */
export const updateExtraBill = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const { billId } = req.params;
  const { description, amount } = req.body;

  const bill = await prisma.extraBill.findFirst({ 
    where: { 
      id: billId} 
  });
  if (!bill || bill.eventId !== eventId) {
    throw new AppError("No extra bill found with that ID for this event", 404);
  }

  const updatedBill = await prisma.$transaction(async (tx) => {
    const updated = await tx.extraBill.update({
      where: { id: billId },
      data: {
        description: description !== undefined ? description : bill.description,
        amount: amount !== undefined ? Number(amount) : bill.amount
      }
    });

    // Sync financial data
    await invoiceService.syncEventInvoice(eventId, tx);

    return updated;
  });

  res.status(200).json({
    status: "success",
    data: updatedBill});

  invalidateTenantReports();
});

/**
 * Delete an extra bill
 */
export const deleteExtraBill = catchAsync(async (req, res) => {
  const eventId = req.params.id;
  const { billId } = req.params;

  const bill = await prisma.extraBill.findFirst({ 
    where: { 
      id: billId} 
  });
  if (!bill || bill.eventId !== eventId) {
    throw new AppError("No extra bill found with that ID for this event", 404);
  }

  await prisma.$transaction(async (tx) => {
    await tx.extraBill.delete({ where: { id: billId } });

    // Sync financial data
    await invoiceService.syncEventInvoice(eventId, tx);
  });

  res.status(204).json({
    status: "success",
    data: null});

  invalidateTenantReports();
});
