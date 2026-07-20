import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import { Prisma } from "@prisma/client";

class InventoryService {
  /**
   * Helper to adjust inventory stock
   */
  async adjustInventoryStock(inventoryId, changeAmount, type, reason, eventId, userId,  tx = prisma) {
    if (Number(changeAmount) === 0) return;
    try {
      await tx.$executeRaw`SELECT 1 FROM "Inventory" WHERE id = ${inventoryId} FOR UPDATE`;
      const invItem = await tx.inventory.findFirst({ where: { id: inventoryId} });
      if (!invItem) return;

      const currentQty = new Prisma.Decimal(invItem.quantity);
      const amount = type === "subtract" ? -Math.abs(changeAmount) : Math.abs(changeAmount);
      const newQty = currentQty.plus(amount);

      if (newQty.lt(0)) {
        throw new AppError(`Cannot adjust stock: this action would result in negative inventory quantity for '${invItem.name}'. (Current Stock: ${currentQty} ${invItem.unit}, Attempting to subtract: ${Math.abs(changeAmount)} ${invItem.unit})`, 400);
      }

      await tx.inventory.update({
        where: { id: inventoryId },
        data: {
          quantity: newQty
        }
      });

      await tx.stockHistory.create({
        data: {
          inventoryItemId: inventoryId,
          previousQuantity: currentQty,
          newQuantity: newQty,
          changeAmount: Math.abs(changeAmount),
          type: type,
          reason: reason,
          eventReferenceId: eventId,
          performedById: userId || null
        }
      });
    } catch (err) {
      console.error(JSON.stringify({
        level: "error",
        message: "Failed to adjust inventory stock",
        inventoryId,
        changeAmount,
        type,
        error: err.message
      }));
      throw err;
    }
  }
}

export default new InventoryService();
