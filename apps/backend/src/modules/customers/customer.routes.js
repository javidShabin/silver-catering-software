import express from "express";
import * as customerController from "./customer.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createCustomerSchema, updateCustomerSchema } from "./customer.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", customerController.getAllCustomers);
router.get("/lookup", customerController.getCustomerLookup);
router.get("/:id/summary", customerController.getCustomerSummary);
router.get("/:id", customerController.getCustomer);
router.post("/", restrictTo("admin", "manager"), validate(createCustomerSchema), customerController.createCustomer);
router.patch("/:id", restrictTo("admin", "manager"), validate(updateCustomerSchema), customerController.updateCustomer);
router.delete("/:id", restrictTo("admin", "manager"), customerController.deleteCustomer);

export default router;
