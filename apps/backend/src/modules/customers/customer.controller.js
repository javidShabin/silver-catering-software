import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

/**
 * Get all customers with search and pagination
 */
export const getAllCustomers = catchAsync(async (req, res) => {
  const { search, page = 1, limit = 50 } = req.query;
  const MAX_LIMIT = 100;
  const limitNum = Math.min(Number(limit) || 50, MAX_LIMIT);
  const pageNum = Math.max(Number(page) || 1, 1);
  const skip = (pageNum - 1) * limitNum;
  

  const where = {
    
    ...(search && {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { phone: { contains: search, mode: "insensitive" } },
      ]})};

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: [{ name: "asc" }, { id: "asc" }],
      take: limitNum,
      skip})
  ]);

  res.status(200).json({
    status: "success",
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum)
    },
    results: customers.length,
    data: customers});
});

/**
 * Get lightweight customer list for dropdowns (additive optimization)
 */
export const getCustomerLookup = catchAsync(async (req, res) => {
  
  const customers = await prisma.customer.findMany({
    where: { },
    select: { id: true, name: true, email: true },
    orderBy: [{ name: "asc" }, { id: "asc" }]
  });
  res.status(200).json({
    status: "success",
    data: customers});
});

/**
 * Get single customer
 */
export const getCustomer = catchAsync(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { 
      id: req.params.id},
    include: { events: true }, // Equivalent to populate("eventHistory")
  });

  if (!customer) {
    throw new AppError("No customer found with that ID", 404);
  }

  res.status(200).json({
    status: "success",
    data: customer});
});

/**
 * Get customer summary including events, invoices, and payment history
 */
export const getCustomerSummary = catchAsync(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { 
      id: req.params.id},
    include: { 
      events: {
        orderBy: { date: 'desc' },
        include: {
          invoices: {
            include: {
              paymentHistory: {
                orderBy: { paymentDate: 'desc' }
              }
            }
          }
        }
      }
    }});

  if (!customer) {
    throw new AppError("No customer found with that ID", 404);
  }

  res.status(200).json({
    status: "success",
    data: customer});
});

/**
 * Create customer
 */
export const createCustomer = catchAsync(async (req, res) => {
  const { id,  createdAt, updatedAt, ...allowedData } = req.body;

  if (allowedData.email === "") {
    allowedData.email = null;
  }

  const newCustomer = await prisma.customer.create({
    data: {
      ...allowedData}});

  res.status(201).json({
    status: "success",
    data: newCustomer});
});

/**
 * Update customer
 */
export const updateCustomer = catchAsync(async (req, res) => {
  const existing = await prisma.customer.findFirst({
    where: { id: req.params.id}
  });

  if (!existing) {
    throw new AppError("No customer found with that ID", 404);
  }

  const { id,  createdAt, updatedAt, ...allowedData } = req.body;

  if (allowedData.email === "") {
    allowedData.email = null;
  }

  const customer = await prisma.customer.update({
    where: { id: req.params.id },
    data: allowedData});

  res.status(200).json({
    status: "success",
    data: customer});
});

/**
 * Delete customer
 */
export const deleteCustomer = catchAsync(async (req, res) => {
  const existing = await prisma.customer.findFirst({
    where: { id: req.params.id}
  });

  if (!existing) {
    throw new AppError("No customer found with that ID", 404);
  }

  try {
    await prisma.customer.delete({
      where: { id: req.params.id }});

    res.status(204).json({
      status: "success",
      data: null});
  } catch (error) {
    if (error.code === 'P2003') {
      throw new AppError("Cannot delete customer with associated events or invoices. Please remove them first.", 400);
    }
    throw error;
  }
});
