import express from "express";
import * as quotationController from "./quotation.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  createQuotationSchema,
  updateQuotationSchema,
  listQuotationsQuerySchema} from "./quotation.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get(
  "/",
  validate(listQuotationsQuerySchema),
  quotationController.getAllQuotations
);
router.get("/:id", quotationController.getQuotation);
router.post(
  "/",
  restrictTo("admin", "manager"),
  validate(createQuotationSchema),
  quotationController.createQuotation
);
router.patch(
  "/:id",
  restrictTo("admin", "manager"),
  validate(updateQuotationSchema),
  quotationController.updateQuotation
);
router.delete(
  "/:id",
  restrictTo("admin", "manager"),
  quotationController.deleteQuotation
);
router.post(
  "/:id/approve",
  restrictTo("admin", "manager"),
  quotationController.approveQuotation
);

export default router;
