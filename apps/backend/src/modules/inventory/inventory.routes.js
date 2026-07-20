import express from "express";
import * as inventoryController from "./inventory.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createInventorySchema, updateInventorySchema, updateStockSchema } from "./inventory.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", inventoryController.getAllInventory);
router.get("/lookup", inventoryController.getInventoryLookup);
router.post("/", restrictTo("admin", "manager"), validate(createInventorySchema), inventoryController.createInventoryItem);
router.patch("/:id", restrictTo("admin", "manager"), validate(updateInventorySchema), inventoryController.updateInventoryItem);
router.delete("/:id", restrictTo("admin", "manager"), inventoryController.deleteInventoryItem);
router.patch("/:id/stock", restrictTo("admin", "manager"), validate(updateStockSchema), inventoryController.updateStock);

export default router;
