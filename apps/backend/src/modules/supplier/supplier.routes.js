import express from "express";
import * as supplierController from "./supplier.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);
router.use(restrictTo("admin", "manager", "accountant"));

router
  .route("/")
  .get(supplierController.getAllSuppliers)
  .post(supplierController.createSupplier);

router.get("/lookup", supplierController.getSupplierLookup);

router
  .route("/:id")
  .get(supplierController.getSupplier)
  .patch(supplierController.updateSupplier)
  .delete(supplierController.deleteSupplier);

export default router;
