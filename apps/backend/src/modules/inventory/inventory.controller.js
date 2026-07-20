import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { Prisma } from "@prisma/client";
import { emitToUser } from "../../utils/socket.js";

/**
 * Get all inventory items with search and filter
 */
export const getAllInventory = catchAsync(async (req, res) => {
  const { search, category, status, cursor, limit = 10 } = req.query;
  const MAX_LIMIT = 100;
  const limitNum = Math.min(Number(limit) || 10, MAX_LIMIT);
  

  const where = { isActive: true};
  if (req.query.archived === 'true') {
    where.isActive = false;
  }
  
  if (category && category !== "All") where.category = category;
  if (status && status !== "All") where.status = status;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const query = {
    where,
    orderBy: [{ name: "asc" }, { id: "asc" }],
    take: limitNum + 1};

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const items = await prisma.inventory.findMany(query);

  let nextCursor = null;
  if (items.length > limitNum) {
    const nextItem = items.pop();
    nextCursor = nextItem.id;
  }

  res.status(200).json({
    status: "success",
    results: items.length,
    nextCursor,
    data: items});
});

/**
 * Get lightweight inventory items for dropdowns (additive optimization)
 */
export const getInventoryLookup = catchAsync(async (req, res) => {
  
  const items = await prisma.inventory.findMany({
    where: {  isActive: true },
    select: { id: true, name: true, unit: true, category: true, rentPerDay: true },
    orderBy: [{ name: "asc" }, { id: "asc" }]
  });
  res.status(200).json({
    status: "success",
    data: items});
});

/**
 * Create inventory item
 */
export const createInventoryItem = catchAsync(async (req, res) => {
  const { id,  createdAt, updatedAt, ...allowedData } = req.body;
  const newItem = await prisma.inventory.create({
    data: {
      ...allowedData}});

  res.status(201).json({
    status: "success",
    data: newItem});
});

/**
 * Update inventory item
 */
export const updateInventoryItem = catchAsync(async (req, res) => {
  try {
    const existing = await prisma.inventory.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      throw new AppError("No inventory item found with that ID", 404);
    }

    const { id,  createdAt, updatedAt, ...allowedData } = req.body;
    const item = await prisma.inventory.update({
      where: { id: req.params.id },
      data: allowedData});

    res.status(200).json({
      status: "success",
      data: item});
  } catch (error) {
    throw error;
  }
});

/**
 * Delete inventory item
 */
export const deleteInventoryItem = catchAsync(async (req, res) => {
  const id = req.params.id;
  
  
  // Fetch item and check for historical dependencies
  const item = await prisma.inventory.findFirst({
    where: { id},
    include: {
      purchases: { take: 1 },
      stockHistory: { take: 1 },
      allocations: { take: 1 }
    }
  });
  
  if (!item) throw new AppError("No inventory item found", 404);
  
  const hasHistory = item.purchases.length > 0 || item.stockHistory.length > 0 || item.allocations.length > 0;
  
  if (hasHistory) {
    // Prevent deletion, archive instead
    await prisma.inventory.update({
      where: { id },
      data: { isActive: false, status: "Archived" }
    });
    
    return res.status(200).json({
      status: "success",
      message: "Item archived successfully. Historical records preserved."});
  }
  
  // Safe to hard delete if absolutely no history exists
  await prisma.inventory.delete({ where: { id } });
  
  res.status(204).json({
    status: "success",
    data: null});
});

/**
 * Update stock level (Specialized endpoint)
 */
export const updateStock = catchAsync(async (req, res) => {
  const { quantity, type, reason } = req.body; // type: 'add' or 'subtract'
  
  
  const updatedItem = await prisma.$transaction(async (tx) => {
    // Acquire exclusive row lock
    await tx.$executeRaw`SELECT 1 FROM "Inventory" WHERE id = ${req.params.id} FOR UPDATE`;

    const item = await tx.inventory.findFirst({ where: { id: req.params.id} });

    if (!item) {
      throw new AppError("No inventory item found with that ID", 404);
    }

    const previousQuantity = new Prisma.Decimal(item.quantity);
    let newQuantity = previousQuantity;
    let lastRestocked = item.lastRestocked;
    const changeQty = new Prisma.Decimal(quantity);
    
    if (type === 'add') {
      newQuantity = newQuantity.plus(changeQty);
      lastRestocked = new Date();
    } else if (type === 'subtract') {
      if (previousQuantity.lt(changeQty)) {
        throw new AppError("Insufficient stock quantity", 400);
      }
      newQuantity = newQuantity.minus(changeQty);
    }

    let status = "In Stock";
    if (newQuantity.isZero()) status = "Out of Stock";
    else if (newQuantity.lte(new Prisma.Decimal(item.minStockLevel))) status = "Low Stock";

    const updated = await tx.inventory.update({
      where: { id: item.id },
      data: {
        quantity: newQuantity,
        lastRestocked,
        status,
        lastUpdatedById: req.user?.id
      }
    });

    // 1. Record History
    await tx.stockHistory.create({
      data: {
        inventoryItemId: item.id,
        previousQuantity,
        newQuantity,
        changeAmount: Number(quantity),
        type,
        reason: reason || `Stock ${type}ed via management dashboard`,
        performedById: req.user?.id}
    });

    // 2. Check for Low Stock Notification
    if (newQuantity.lte(new Prisma.Decimal(item.minStockLevel))) {
      // Assuming admins should be notified
      const admins = await tx.auth.findMany({ where: { role: 'admin'} });
      
      if (admins.length > 0) {
        const notificationsData = admins.map(admin => ({
          recipientId: admin.id,
          title: "Low Stock Alert",
          message: `${item.name} is running low (${newQuantity} ${item.unit} remaining).`,
          type: "warning",
          category: "inventory"}));

        await tx.notification.createMany({ data: notificationsData });

        admins.forEach(admin => {
          emitToUser(admin.id, "notification", {
            recipientId: admin.id,
            title: "Low Stock Alert",
            message: `${item.name} is running low (${newQuantity} ${item.unit} remaining).`,
            type: "warning",
            category: "inventory",
            
            isRead: false,
            createdAt: new Date()
          });
        });
      }
    }

    return updated;
  });

  res.status(200).json({
    status: "success",
    data: updatedItem});
});
