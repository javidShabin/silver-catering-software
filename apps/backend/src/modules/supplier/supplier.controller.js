import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

/**
 * Get all suppliers with dynamic balance calculation
 */
export const getAllSuppliers = catchAsync(async (req, res) => {
  
  const [suppliers, pendingBalances] = await Promise.all([
    prisma.supplier.findMany({
      where: { },
      orderBy: { name: 'asc' }
    }),
    prisma.purchase.groupBy({
      by: ['supplierId'],
      where: {
        
        paymentStatus: {
          not: "paid"
        }
      },
      _sum: {
        totalAmount: true
      }
    })
  ]);

  const balanceMap = pendingBalances.reduce((acc, curr) => {
    acc[curr.supplierId] = Number(curr._sum.totalAmount) || 0;
    return acc;
  }, {});

  const formattedSuppliers = suppliers.map(supplier => ({
    ...supplier,
    balanceDue: balanceMap[supplier.id] || 0
  }));

  res.status(200).json({
    status: "success",
    results: formattedSuppliers.length,
    data: formattedSuppliers});
});

/**
 * Get lightweight supplier list for dropdowns (additive optimization)
 */
export const getSupplierLookup = catchAsync(async (req, res) => {
  
  const suppliers = await prisma.supplier.findMany({
    where: { },
    select: { id: true, name: true },
    orderBy: [{ name: "asc" }, { id: "asc" }]
  });
  res.status(200).json({
    status: "success",
    data: suppliers});
});

/**
 * Get single supplier
 */
export const getSupplier = catchAsync(async (req, res) => {
  
  const supplier = await prisma.supplier.findFirst({
    where: { id: req.params.id},
    include: {
      purchases: {
        orderBy: { purchaseDate: 'desc' },
        take: 10
      }
    }
  });

  if (!supplier) {
    throw new AppError("No supplier found with that ID", 404);
  }

  const pendingAggregation = await prisma.purchase.aggregate({
    where: {
      supplierId: req.params.id,
      
      paymentStatus: { not: "paid" }
    },
    _sum: { totalAmount: true }
  });
  
  const balanceDue = Number(pendingAggregation._sum.totalAmount) || 0;

  res.status(200).json({
    status: "success",
    data: {
      ...supplier,
      balanceDue
    }});
});

/**
 * Create supplier
 */
export const createSupplier = catchAsync(async (req, res) => {
  
  const { id,  createdAt, updatedAt, ...allowedData } = req.body;
  const newSupplier = await prisma.supplier.create({
    data: {
      ...allowedData}});

  res.status(201).json({
    status: "success",
    data: newSupplier});
});

/**
 * Update supplier
 */
export const updateSupplier = catchAsync(async (req, res) => {
  try {
    
    const existing = await prisma.supplier.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      throw new AppError("No supplier found with that ID", 404);
    }

    const { id,  createdAt, updatedAt, ...allowedData } = req.body;
    const supplier = await prisma.supplier.update({
      where: { id: req.params.id },
      data: allowedData});

    res.status(200).json({
      status: "success",
      data: supplier});
  } catch (error) {
    throw error;
  }
});

/**
 * Delete supplier
 */
export const deleteSupplier = catchAsync(async (req, res) => {
  try {
    
    const existing = await prisma.supplier.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      throw new AppError("No supplier found with that ID", 404);
    }

    await prisma.supplier.delete({
      where: { id: req.params.id }});

    res.status(204).json({
      status: "success",
      data: null});
  } catch (error) {
    if (error.code === 'P2003') {
      throw new AppError("Cannot delete vendor with associated purchases. Please remove them first.", 400);
    }
    throw error;
  }
});
