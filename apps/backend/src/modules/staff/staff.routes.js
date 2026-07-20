import express from "express";
import * as staffController from "./staff.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createStaffSchema, updateStaffSchema } from "./staff.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", restrictTo("admin", "manager"), staffController.getAllStaff);
router.post("/", restrictTo("admin", "manager"), validate(createStaffSchema), staffController.addStaff);

router.get("/roles", restrictTo("admin", "manager"), staffController.getAllRoles);
router.post("/roles", restrictTo("admin", "manager"), staffController.addRole);
router.patch("/roles/:id", restrictTo("admin", "manager"), staffController.updateRole);
router.delete("/roles/:id", restrictTo("admin", "manager"), staffController.deleteRole);

router.patch("/:id", restrictTo("admin", "manager"), validate(updateStaffSchema), staffController.updateStaff);
router.delete("/:id", restrictTo("admin", "manager"), staffController.deleteStaff);

export default router;
