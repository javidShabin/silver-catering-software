import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { Prisma } from "@prisma/client";
import { invalidateTenantReports } from "../../utils/cacheInvalidator.js";

/**
 * --- SUPPLIER CONTROLLERS ---
 */

export const getAllSuppliers = catchAsync(async (req, res) => {
  const { search } = req.query;
  
  const where = { };
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }
  
  const suppliers = await prisma.supplier.findMany({
    where,
    orderBy: { name: "asc" }
  });
  res.status(200).json({ status: "success", data: suppliers });
});

export const createSupplier = catchAsync(async (req, res) => {
  
  const { id,  createdAt, updatedAt, ...allowedData } = req.body;
  const supplier = await prisma.supplier.create({ 
    data: { ...allowedData} 
  });
  res.status(201).json({ status: "success", data: supplier });
});

export const updateSupplier = catchAsync(async (req, res) => {
  try {
    
    const existing = await prisma.supplier.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      throw new AppError("No supplier found", 404);
    }

    const { id,  createdAt, updatedAt, ...allowedData } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: allowedData
    });
    res.status(200).json({ status: "success", data: supplier });
  } catch (error) {
    throw error;
  }
});

/**
 * --- PURCHASE CONTROLLERS ---
 */

export const getAllPurchases = catchAsync(async (req, res) => {
  const { cursor, limit = 10 } = req.query;
  const MAX_LIMIT = 100;
  const limitNum = Math.min(Number(limit) || 10, MAX_LIMIT);
  
  const query = {
    where: { },
    include: {
      supplier: true,
      event: { select: { id: true, title: true, date: true } }
    },
    orderBy: [{ purchaseDate: "desc" }, { id: "desc" }],
    take: limitNum + 1
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const purchases = await prisma.purchase.findMany(query);

  let nextCursor = null;
  if (purchases.length > limitNum) {
    const nextItem = purchases.pop();
    nextCursor = nextItem.id;
  }

  res.status(200).json({
    status: "success",
    results: purchases.length,
    nextCursor,
    data: purchases
  });
});

/**
 * Create Purchase (Decoupled from Inventory)
 */
export const createPurchase = catchAsync(async (req, res) => {
  const { inventoryItem, itemName, quantityPurchased, supplier, totalAmount, purchaseDate, ...rest } = req.body;
  const { id, createdAt, updatedAt, ...allowedRest } = rest;
  
  const purchaseData = {
    ...allowedRest,
    itemName: itemName || inventoryItem || "Unknown Item",
    quantityPurchased: Number(quantityPurchased),
    totalAmount: Number(quantityPurchased) * Number(allowedRest.unitCost),
    supplierId: supplier,
    eventId: req.body.eventId || null
  };

  if (purchaseDate && purchaseDate.trim() !== "") {
    purchaseData.purchaseDate = new Date(purchaseDate);
  }

  const newPurchase = await prisma.purchase.create({
    data: purchaseData,
    include: {
      supplier: true,
      event: { select: { id: true, title: true, date: true } }
    }
  });

  res.status(201).json({
    status: "success",
    data: newPurchase
  });

  invalidateTenantReports();
});

export const updatePaymentStatus = catchAsync(async (req, res) => {
  try {
    const existing = await prisma.purchase.findFirst({
      where: { id: req.params.id }
    });

    if (!existing) {
      throw new AppError("No purchase record found", 404);
    }

    const purchase = await prisma.purchase.update({
      where: { id: req.params.id },
      data: { paymentStatus: req.body.paymentStatus },
      include: {
        supplier: true
      }
    });
    res.status(200).json({ status: "success", data: purchase });
    
    invalidateTenantReports();
  } catch (error) {
    throw error;
  }
});

export const getPurchaseById = catchAsync(async (req, res) => {
  const purchase = await prisma.purchase.findFirst({
    where: { id: req.params.id },
    include: {
      supplier: true
    }
  });

  if (!purchase) {
    throw new AppError("Purchase not found", 404);
  }

  res.status(200).json({ status: "success", data: purchase });
});

export const updatePurchase = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { itemName, inventoryItem, quantityPurchased, supplier, totalAmount, purchaseDate, eventId, ...rest } = req.body;
  const { id: _, createdAt, updatedAt, ...allowedRest } = rest;

  const existingPurchase = await prisma.purchase.findFirst({
    where: { id }
  });

  if (!existingPurchase) {
    throw new AppError("Purchase not found", 404);
  }

  const dataToUpdate = { ...allowedRest };
  if (itemName || inventoryItem) dataToUpdate.itemName = itemName || inventoryItem;
  if (quantityPurchased !== undefined) dataToUpdate.quantityPurchased = Number(quantityPurchased);
  if (supplier !== undefined) dataToUpdate.supplierId = supplier;
  if (eventId !== undefined) dataToUpdate.eventId = eventId || null;
  
  if (purchaseDate !== undefined && purchaseDate && purchaseDate.trim() !== "") {
    dataToUpdate.purchaseDate = new Date(purchaseDate);
  }

  const finalQuantity = dataToUpdate.quantityPurchased !== undefined ? dataToUpdate.quantityPurchased : Number(existingPurchase.quantityPurchased);
  const finalUnitCost = dataToUpdate.unitCost !== undefined ? Number(dataToUpdate.unitCost) : Number(existingPurchase.unitCost);
  dataToUpdate.totalAmount = finalQuantity * finalUnitCost;

  const purchase = await prisma.purchase.update({
    where: { id },
    data: dataToUpdate,
    include: {
      supplier: true,
      event: { select: { id: true, title: true, date: true } }
    }
  });

  res.status(200).json({ status: "success", data: purchase });

  invalidateTenantReports();
});

export const deletePurchase = catchAsync(async (req, res) => {
  const { id } = req.params;

  const existingPurchase = await prisma.purchase.findFirst({
    where: { id }
  });

  if (!existingPurchase) {
    throw new AppError("Purchase not found", 404);
  }

  await prisma.purchase.delete({
    where: { id }
  });

  res.status(204).json({ status: "success", data: null });

  invalidateTenantReports();
});
