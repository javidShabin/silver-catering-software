import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";

export const getAllCategories = async (req, res, next) => {
  try {
    
    const categories = await prisma.inventoryCategory.findMany({
      where: { },
      orderBy: { name: 'asc' }
    });
    res.status(200).json({
      status: "success",
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    
    if (!name) return next(new AppError("Name is required", 400));
    
    // Check if category with same name exists for this tenant
    const existing = await prisma.inventoryCategory.findFirst({
      where: { name}
    });

    if (existing) {
      return next(new AppError("Category with this name already exists", 400));
    }

    const category = await prisma.inventoryCategory.create({
      data: { name, description}
    });
    res.status(201).json({
      status: "success",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    
    
    const existing = await prisma.inventoryCategory.findFirst({
      where: { id}
    });

    if (!existing) {
      return next(new AppError("Category not found", 404));
    }

    if (name && name !== existing.name) {
      const nameConflict = await prisma.inventoryCategory.findFirst({
        where: { name}
      });
      if (nameConflict) {
        return next(new AppError("Category with this name already exists", 400));
      }
    }

    const category = await prisma.inventoryCategory.update({
      where: { id },
      data: { name, description }
    });

    // If name changed, update associated inventory items
    if (name && name !== existing.name) {
      await prisma.inventory.updateMany({
        where: { category: existing.name},
        data: { category: name }
      });
    }

    res.status(200).json({
      status: "success",
      data: category
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    

    const existing = await prisma.inventoryCategory.findFirst({
      where: { id}
    });

    if (!existing) {
      return next(new AppError("Category not found", 404));
    }

    await prisma.$transaction(async (tx) => {
      await tx.inventoryCategory.delete({
        where: { id }
      });

      // Move items to Uncategorized
      let uncategorized = await tx.inventoryCategory.findFirst({
        where: { name: "Uncategorized"}
      });

      if (!uncategorized && existing.name !== "Uncategorized") {
        uncategorized = await tx.inventoryCategory.create({
          data: { name: "Uncategorized", description: "Default"}
        });
      }

      if (existing.name !== "Uncategorized") {
        await tx.inventory.updateMany({
          where: { category: existing.name},
          data: { category: "Uncategorized" }
        });
      }
    });

    res.status(204).json({
      status: "success",
      data: null
    });
  } catch (error) {
    next(error);
  }
};
