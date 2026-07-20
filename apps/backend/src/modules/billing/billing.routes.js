import express from "express";
import * as billingController from "./billing.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createInvoiceSchema, updateInvoiceStatusSchema, recordPaymentSchema, applyDiscountSchema } from "./billing.validation.js";
import jwt from "jsonwebtoken";
import AppError from "../../utils/AppError.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", billingController.getAllInvoices);
router.get("/stats", billingController.getBillingStats);
router.get("/overdue-count", billingController.getOverdueCount);
router.get("/:id", billingController.getInvoice);
router.post("/", restrictTo("admin", "manager"), validate(createInvoiceSchema), billingController.createInvoice);
router.patch("/:id/status", restrictTo("admin", "manager"), validate(updateInvoiceStatusSchema), billingController.updateInvoiceStatus);
router.patch("/:id/promised-date", restrictTo("admin", "manager"), billingController.setPromisedDate);
router.patch("/:id/discount", restrictTo("admin", "manager"), validate(applyDiscountSchema), billingController.applyDiscount);
router.post("/:id/payments", restrictTo("admin", "manager"), validate(recordPaymentSchema), billingController.recordPayment);

router.delete("/:id", restrictTo("admin", "manager"), billingController.deleteInvoice);

export default router;
