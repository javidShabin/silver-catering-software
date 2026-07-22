import express from "express";
import * as purchaseController from "./purchase.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createPurchaseSchema, updatePurchaseSchema } from "./purchase.validation.js";

const router = express.Router();

router.use(authMiddleware);

// Supplier Routes
router.get("/suppliers", purchaseController.getAllSuppliers);
router.post("/suppliers", restrictTo("admin", "manager"), purchaseController.createSupplier);
router.patch("/suppliers/:id", restrictTo("admin", "manager"), purchaseController.updateSupplier);

// Purchase Routes
router.get("/", purchaseController.getAllPurchases);
router.post("/", restrictTo("admin", "manager"), validate(createPurchaseSchema), purchaseController.createPurchase);
router.get("/:id", purchaseController.getPurchaseById);
router.post("/:id/payments", restrictTo("admin", "manager"), purchaseController.recordPayment);
router.patch("/:id/payment", restrictTo("admin", "manager"), validate(updatePurchaseSchema), purchaseController.updatePaymentStatus);
router.patch("/:id", restrictTo("admin", "manager"), validate(updatePurchaseSchema), purchaseController.updatePurchase);
router.delete("/:id", restrictTo("admin", "manager"), purchaseController.deletePurchase);

export default router;
