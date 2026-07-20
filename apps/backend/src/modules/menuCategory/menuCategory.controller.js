import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

const DEFAULT_CATEGORIES = [
  "Starters", 
  "Main Course", 
  "Desserts", 
  "Beverages", 
  "Snacks"
];

/**
 * Get all menu categories
 * Automatically seeds default categories if the table is empty.
 */
export const getAllCategories = catchAsync(async (req, res) => {
  

  let categories = await prisma.menuCategory.findMany({
    where: { },
    orderBy: { createdAt: 'asc' }
  });

  // Seed default categories if none exist for this tenant
  if (categories.length === 0) {
    await prisma.menuCategory.createMany({
      data: DEFAULT_CATEGORIES.map(name => ({ name})),
      skipDuplicates: true
    });
    categories = await prisma.menuCategory.findMany({
      where: { },
      orderBy: { createdAt: 'asc' }
    });
  }

  res.status(200).json({
    status: "success",
    data: categories});
});

/**
 * Create menu category
 */
export const createCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  

  if (!name) {
    throw new AppError("Category name is required", 400);
  }

  const existing = await prisma.menuCategory.findUnique({
    where: { _name: {  name } }
  });

  if (existing) {
    throw new AppError("A category with this name already exists", 400);
  }

  const newCategory = await prisma.menuCategory.create({
    data: { name, description}
  });

  res.status(201).json({
    status: "success",
    data: newCategory});
});

/**
 * Update menu category
 */
export const updateCategory = catchAsync(async (req, res) => {
  const { name, description } = req.body;
  const { id } = req.params;
  

  const category = await prisma.menuCategory.findFirst({
    where: { id}
  });

  if (!category) {
    throw new AppError("No category found with that ID", 404);
  }

  const existingName = category.name;

  // If renaming, check for conflicts
  if (name && name !== existingName) {
    const nameExists = await prisma.menuCategory.findUnique({
      where: { _name: {  name } }
    });
    if (nameExists) {
      throw new AppError("A category with this name already exists", 400);
    }
  }

  // Use a transaction to update both the Category and existing Menu items
  const updatedCategory = await prisma.$transaction(async (tx) => {
    const updated = await tx.menuCategory.update({
      where: { id },
      data: { name, description }
    });

    if (name && name !== existingName) {
      await tx.menu.updateMany({
        where: { category: existingName},
        data: { category: name }
      });
    }

    return updated;
  });

  res.status(200).json({
    status: "success",
    data: updatedCategory});
});

/**
 * Delete menu category
 */
export const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;
  

  const category = await prisma.menuCategory.findFirst({
    where: { id}
  });

  if (!category) {
    throw new AppError("No category found with that ID", 404);
  }

  // Ensure "Uncategorized" exists for this tenant
  let uncategorized = await prisma.menuCategory.findUnique({
    where: { _name: {  name: "Uncategorized" } }
  });

  if (!uncategorized && category.name !== "Uncategorized") {
    uncategorized = await prisma.menuCategory.create({
      data: { name: "Uncategorized", description: "Default category for items without a specific category"}
    });
  }

  await prisma.$transaction(async (tx) => {
    // Delete the category
    await tx.menuCategory.delete({
      where: { id }
    });

    // Move associated menu items to "Uncategorized" if they are not already
    if (category.name !== "Uncategorized") {
      await tx.menu.updateMany({
        where: { category: category.name},
        data: { category: "Uncategorized" }
      });
    }
  });

  res.status(204).json({
    status: "success",
    data: null});
});
