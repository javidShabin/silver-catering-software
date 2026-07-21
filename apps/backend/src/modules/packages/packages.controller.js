import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

/**
 * @desc    Create a new package
 * @route   POST /api/v1/packages
 * @access  Private
 */
export const createPackage = catchAsync(async (req, res) => {
  const { name, description, pricePerHead, minGuests, isActive, menuItemIds } = req.body;
  

  // Check if name already exists
  const existing = await prisma.package.findUnique({
    where: { name }
  });
  if (existing) {
    throw new AppError("A package with this name already exists", 400);
  }

  // Connect menu items if provided
  const menuItemsConnect = menuItemIds?.map((id) => ({ id })) || [];

  const newPackage = await prisma.package.create({
    data: {
      
      name,
      description,
      pricePerHead,
      minGuests,
      isActive,
      menuItems: {
        connect: menuItemsConnect
      }
    },
    include: {
      menuItems: true
    }
  });

  res.status(201).json({
    status: "success",
    data: newPackage});
});

/**
 * @desc    Get all packages for a tenant
 * @route   GET /api/v1/packages
 * @access  Private
 */
export const getAllPackages = catchAsync(async (req, res) => {
  

  const packages = await prisma.package.findMany({
    where: { },
    include: {
      menuItems: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json({
    status: "success",
    results: packages.length,
    data: packages});
});

/**
 * @desc    Get a single package
 * @route   GET /api/v1/packages/:id
 * @access  Private
 */
export const getPackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  

  const pkg = await prisma.package.findFirst({
    where: { id},
    include: {
      menuItems: true
    }
  });

  if (!pkg) {
    throw new AppError("Package not found", 404);
  }

  res.status(200).json({
    status: "success",
    data: pkg});
});

/**
 * @desc    Update a package
 * @route   PATCH /api/v1/packages/:id
 * @access  Private
 */
export const updatePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  const { name, description, pricePerHead, minGuests, isActive, menuItemIds } = req.body;

  const pkg = await prisma.package.findFirst({
    where: { id}});

  if (!pkg) {
    throw new AppError("Package not found", 404);
  }

  if (name && name !== pkg.name) {
    const existing = await prisma.package.findUnique({
      where: { name }
    });
    if (existing) {
      throw new AppError("A package with this name already exists", 400);
    }
  }

  const dataToUpdate = {
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(pricePerHead !== undefined && { pricePerHead }),
    ...(minGuests !== undefined && { minGuests }),
    ...(isActive !== undefined && { isActive })};

  // If menuItemIds is provided, we use 'set' to replace the existing relations
  if (menuItemIds !== undefined) {
    dataToUpdate.menuItems = {
      set: menuItemIds.map((itemId) => ({ id: itemId }))
    };
  }

  const updatedPackage = await prisma.package.update({
    where: { id },
    data: dataToUpdate,
    include: {
      menuItems: true
    }
  });

  res.status(200).json({
    status: "success",
    data: updatedPackage});
});

/**
 * @desc    Delete a package
 * @route   DELETE /api/v1/packages/:id
 * @access  Private
 */
export const deletePackage = catchAsync(async (req, res) => {
  const { id } = req.params;
  

  const pkg = await prisma.package.findFirst({
    where: { id}});

  if (!pkg) {
    throw new AppError("Package not found", 404);
  }

  try {
    await prisma.package.delete({
      where: { id }
    });
  } catch (error) {
    if (error.code === 'P2003') {
      throw new AppError("Cannot delete package that is linked to existing events or quotations.", 400);
    }
    throw error;
  }

  res.status(204).json({
    status: "success",
    data: null});
});
