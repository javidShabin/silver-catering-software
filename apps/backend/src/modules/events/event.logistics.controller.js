import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { Prisma } from "@prisma/client";

/**
 * Get all equipment/logistics allocated to an event
 */
export const getEventLogistics = catchAsync(async (req, res) => {
  const { id } = req.params;
  

  const allocations = await prisma.inventoryAllocation.findMany({
    where: {
      eventId: id},
    include: {
      inventory: {
        select: {
          id: true,
          name: true,
          rentPerDay: true,
          unit: true}}}});

  res.status(200).json({
    status: "success",
    data: allocations});
});

/**
 * Process return of logistics/equipment from an event
 */
export const processLogisticsReturn = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const { returns } = req.body; 
  // returns is an array of { allocationId, returnedQuantity, damagedQuantity, lostQuantity, notes, addDamageToBill, damageCost }

  if (!Array.isArray(returns) || returns.length === 0) {
    throw new AppError("No return data provided", 400);
  }

  // Ensure event exists
  const event = await prisma.event.findFirst({
    where: { id}});

  if (!event) {
    throw new AppError("Event not found", 404);
  }

  const result = await prisma.$transaction(async (tx) => {
    let processedCount = 0;
    
    for (const item of returns) {
      const { 
        allocationId, 
        returnedQuantity = 0, 
        damagedQuantity = 0, 
        lostQuantity = 0, 
        notes, 
        addDamageToBill, 
        damageCost 
      } = item;

      // 1. Fetch the allocation
      const allocation = await tx.inventoryAllocation.findFirst({
        where: { id: allocationId, eventId: id},
        include: { inventory: true }});

      if (!allocation) continue;

      const newRetQty = new Prisma.Decimal(returnedQuantity);
      const newDamQty = new Prisma.Decimal(damagedQuantity);
      const newLostQty = new Prisma.Decimal(lostQuantity);
      
      const oldRet = new Prisma.Decimal(allocation.returnedQuantity || 0);
      const oldDam = new Prisma.Decimal(allocation.damagedQuantity || 0);
      const oldLost = new Prisma.Decimal(allocation.lostQuantity || 0);
      
      const deltaRetQty = newRetQty.minus(oldRet);
      const deltaDamQty = newDamQty.minus(oldDam);
      const deltaLostQty = newLostQty.minus(oldLost);

      // Calculate new status
      const totalAccounted = newRetQty.plus(newDamQty).plus(newLostQty);
      let newStatus = "Partially Returned";
      if (totalAccounted.gte(new Prisma.Decimal(allocation.quantity || 0))) {
        newStatus = "Returned";
      }

      // 2. Update Allocation
      await tx.inventoryAllocation.update({
        where: { id: allocationId },
        data: {
          returnedQuantity: newRetQty,
          damagedQuantity: newDamQty,
          lostQuantity: newLostQty,
          status: newStatus,
          returnNotes: notes,
          returnDate: new Date()}});

      // 3. Update main inventory stock
      if (allocation.isDeducted && !deltaRetQty.equals(0)) {
        await tx.inventory.update({
          where: { id: allocation.inventoryId },
          data: {
            quantity: { increment: deltaRetQty }}});
        
        // Stock history for return
        await tx.stockHistory.create({
          data: {
            
            inventoryItemId: allocation.inventoryId,
            previousQuantity: allocation.inventory.quantity,
            newQuantity: new Prisma.Decimal(allocation.inventory.quantity || 0).plus(deltaRetQty),
            changeAmount: deltaRetQty.abs(),
            type: deltaRetQty.gt(0) ? "add" : "deduct",
            reason: `Return update for event: ${event.title}`,
            performedById: req.user.id,
            eventReferenceId: id}});
      }

      // 4. Generate Extra Bill for damages/lost if requested
      // The user manually specifies the amount to bill.
      const totalDamagedOrLost = newDamQty.plus(newLostQty);
      if (addDamageToBill && totalDamagedOrLost.gt(0) && damageCost) {
        await tx.extraBill.create({
          data: {
            
            eventId: id,
            description: `Damage/Loss Charges for ${allocation.inventory.name} (${totalDamagedOrLost.toString()} ${allocation.unit})`,
            amount: new Prisma.Decimal(damageCost)}});
      }
      
      processedCount++;
    }

    return processedCount;
  });

  res.status(200).json({
    status: "success",
    message: `Processed ${result} return entries successfully`});
});
