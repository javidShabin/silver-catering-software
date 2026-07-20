import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";

export const getEventIngredients = async (req, res, next) => {
  try {
    const { id: eventId } = req.params; // from /events/:id/ingredients
    
    // Validate parent event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId}
    });
    if (!event) return next(new AppError("No event found with that ID", 404));

    const ingredients = await prisma.eventIngredient.findMany({
      where: { eventId },
      include: {
        menu: { select: { id: true, name: true } },
        inventory: { select: { id: true, name: true, unit: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    res.status(200).json({ status: "success", data: ingredients });
  } catch (error) {
    next(error);
  }
};

export const addEventIngredient = async (req, res, next) => {
  try {
    const { id: eventId } = req.params;
    const { menuId, inventoryId, customName, quantity, unit, category, price } = req.body;

    // Validate parent event ownership
    const event = await prisma.event.findFirst({
      where: { id: eventId}
    });
    if (!event) return next(new AppError("No event found with that ID", 404));

    const ingredient = await prisma.eventIngredient.create({
      data: {
        eventId,
        menuId: menuId || null,
        inventoryId: inventoryId || null,
        customName: customName || null,
        quantity: quantity !== undefined ? Number(quantity) : 1,
        unit: unit || "unit",
        category: category || "Other",
        price: price !== undefined && price !== null ? Number(price) : null
      },
      include: {
        menu: { select: { id: true, name: true } },
        inventory: { select: { id: true, name: true, unit: true } }
      }
    });
    res.status(201).json({ status: "success", data: ingredient });
  } catch (error) {
    next(error);
  }
};

export const updateEventIngredient = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;
    const updates = req.body;

    // Validate ownership via parent relation
    const existing = await prisma.eventIngredient.findFirst({
      where: { 
        id: ingredientId,
        event: { }
      }
    });
    if (!existing) return next(new AppError("Ingredient not found", 404));

    const updateData = {};
    if (updates.menuId !== undefined) updateData.menuId = updates.menuId || null;
    if (updates.inventoryId !== undefined) updateData.inventoryId = updates.inventoryId || null;
    if (updates.customName !== undefined) updateData.customName = updates.customName || null;
    if (updates.quantity !== undefined) updateData.quantity = Number(updates.quantity);
    if (updates.unit !== undefined) updateData.unit = updates.unit;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.price !== undefined) updateData.price = updates.price !== null ? Number(updates.price) : null;
    if (updates.isPurchased !== undefined) updateData.isPurchased = updates.isPurchased;

    const ingredient = await prisma.eventIngredient.update({
      where: { id: ingredientId },
      data: updateData,
      include: {
        menu: { select: { id: true, name: true } },
        inventory: { select: { id: true, name: true, unit: true } }
      }
    });
    res.status(200).json({ status: "success", data: ingredient });
  } catch (error) {
    next(error);
  }
};

export const deleteEventIngredient = async (req, res, next) => {
  try {
    const { ingredientId } = req.params;

    // Validate ownership via parent relation
    const existing = await prisma.eventIngredient.findFirst({
      where: { 
        id: ingredientId,
        event: { }
      }
    });
    if (!existing) return next(new AppError("Ingredient not found", 404));

    await prisma.eventIngredient.delete({
      where: { id: ingredientId }
    });
    res.status(204).json({ status: "success", data: null });
  } catch (error) {
    next(error);
  }
};
