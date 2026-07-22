import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

/**
 * Get all staff roles
 * @route GET /api/v1/staff-roles
 */
export const getAllStaffRoles = catchAsync(async (req, res) => {
  const staffRoles = await prisma.staffRole.findMany({
    orderBy: { name: "asc" }
  });

  res.status(200).json({
    status: "success",
    results: staffRoles.length,
    data: staffRoles
  });
});

/**
 * Get a single staff role by ID
 * @route GET /api/v1/staff-roles/:id
 */
export const getStaffRole = catchAsync(async (req, res) => {
  const staffRole = await prisma.staffRole.findUnique({
    where: { id: req.params.id }
  });

  if (!staffRole) {
    throw new AppError("No staff role found with that ID", 404);
  }

  res.status(200).json({
    status: "success",
    data: staffRole
  });
});

/**
 * Create a new staff role
 * @route POST /api/v1/staff-roles
 */
export const createStaffRole = catchAsync(async (req, res) => {
  const { name, defaultRate } = req.body;

  // Check if role already exists
  const existingRole = await prisma.staffRole.findUnique({
    where: { name }
  });

  if (existingRole) {
    throw new AppError("A staff role with this name already exists", 400);
  }

  const newStaffRole = await prisma.staffRole.create({
    data: {
      name,
      defaultRate
    }
  });

  res.status(201).json({
    status: "success",
    data: newStaffRole
  });
});

/**
 * Update a staff role
 * @route PATCH /api/v1/staff-roles/:id
 */
export const updateStaffRole = catchAsync(async (req, res) => {
  const { name, defaultRate } = req.body;

  const existingRole = await prisma.staffRole.findUnique({
    where: { id: req.params.id }
  });

  if (!existingRole) {
    throw new AppError("No staff role found with that ID", 404);
  }

  // If renaming, check for conflicts
  if (name && name !== existingRole.name) {
    const conflict = await prisma.staffRole.findUnique({
      where: { name }
    });
    if (conflict) {
      throw new AppError("A staff role with this name already exists", 400);
    }
  }

  const updatedStaffRole = await prisma.staffRole.update({
    where: { id: req.params.id },
    data: {
      name: name !== undefined ? name : existingRole.name,
      defaultRate: defaultRate !== undefined ? defaultRate : existingRole.defaultRate
    }
  });

  res.status(200).json({
    status: "success",
    data: updatedStaffRole
  });
});

/**
 * Delete a staff role
 * @route DELETE /api/v1/staff-roles/:id
 */
export const deleteStaffRole = catchAsync(async (req, res) => {
  const existingRole = await prisma.staffRole.findUnique({
    where: { id: req.params.id }
  });

  if (!existingRole) {
    throw new AppError("No staff role found with that ID", 404);
  }

  await prisma.staffRole.delete({
    where: { id: req.params.id }
  });

  res.status(204).json({
    status: "success",
    data: null
  });
});
