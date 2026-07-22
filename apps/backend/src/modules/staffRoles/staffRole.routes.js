import express from "express";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import {
  createStaffRoleSchema,
  updateStaffRoleSchema
} from "./staffRole.validation.js";
import {
  getAllStaffRoles,
  getStaffRole,
  createStaffRole,
  updateStaffRole,
  deleteStaffRole
} from "./staffRole.controller.js";

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .get(getAllStaffRoles)
  .post(restrictTo("admin", "manager"), validate(createStaffRoleSchema), createStaffRole);

router
  .route("/:id")
  .get(getStaffRole)
  .patch(restrictTo("admin", "manager"), validate(updateStaffRoleSchema), updateStaffRole)
  .delete(restrictTo("admin"), deleteStaffRole);

export default router;
