import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";

/**
 * Get all menu items with search and category filter
 */
export const getAllMenuItems = catchAsync(async (req, res) => {
  const { search, category, cursor, limit = 12 } = req.query;
  const MAX_LIMIT = 100;
  const limitNum = Math.min(Number(limit) || 12, MAX_LIMIT);
  

  const where = { };
  if (category && category !== "All") where.category = category;
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  const query = {
    where,
    orderBy: [
      { category: "asc" },
      { name: "asc" },
      { id: "asc" }
    ],
    take: limitNum + 1,
    include: {
      recipeIngredients: {
        include: { inventory: true }
      }
    }
  };

  if (cursor) {
    query.cursor = { id: cursor };
    query.skip = 1;
  }

  const items = await prisma.menu.findMany(query);

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
 * Get lightweight menu items for dropdowns (additive optimization)
 */
export const getMenuLookup = catchAsync(async (req, res) => {
  
  const items = await prisma.menu.findMany({
    where: {  isAvailable: true },
    select: { id: true, name: true, category: true, minPrice: true, unit: true },
    orderBy: [{ category: "asc" }, { name: "asc" }]
  });
  res.status(200).json({
    status: "success",
    data: items});
});

/**
 * Create menu item
 */
export const createMenuItem = catchAsync(async (req, res) => {
  const { recipeIngredients, ...menuData } = req.body;
  

  const newItem = await prisma.menu.create({
    data: {
      ...menuData,
      
      ...(recipeIngredients && recipeIngredients.length > 0 ? {
        recipeIngredients: {
          create: recipeIngredients.map(ri => ({
            inventoryId: ri.inventoryId,
            quantityPerPortion: ri.quantityPerPortion,
            unit: ri.unit
          }))
        }
      } : {})
    },
    include: {
      recipeIngredients: {
        include: { inventory: true }
      }
    }
  });

  res.status(201).json({
    status: "success",
    data: newItem});
});

/**
 * Update menu item
 */
export const updateMenuItem = catchAsync(async (req, res) => {
  try {
    
    const existing = await prisma.menu.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      throw new AppError("No menu item found with that ID", 404);
    }

    const { recipeIngredients, ...menuData } = req.body;
    let updateData = { ...menuData };
    
    if (recipeIngredients) {
      updateData.recipeIngredients = {
        deleteMany: {},
        create: recipeIngredients.map(ri => ({
          inventoryId: ri.inventoryId,
          quantityPerPortion: ri.quantityPerPortion,
          unit: ri.unit
        }))
      };
    }

    const item = await prisma.menu.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        recipeIngredients: {
          include: { inventory: true }
        }
      }
    });

    res.status(200).json({
      status: "success",
      data: item});
  } catch (error) {
    throw error;
  }
});

/**
 * Delete menu item
 */
export const deleteMenuItem = catchAsync(async (req, res) => {
  try {
    
    const existing = await prisma.menu.findFirst({
      where: { id: req.params.id}
    });

    if (!existing) {
      throw new AppError("No menu item found with that ID", 404);
    }

    await prisma.menu.delete({
      where: { id: req.params.id }});

    res.status(204).json({
      status: "success",
      data: null});
  } catch (error) {
    throw error;
  }
});

