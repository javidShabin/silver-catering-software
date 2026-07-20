import express from "express";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import AppError from "../../utils/AppError.js";
import {
  createPackageSchema,
  updatePackageSchema
} from "./packages.validation.js";
import {
  createPackage,
  getAllPackages,
  getPackage,
  updatePackage,
  deletePackage
} from "./packages.controller.js";

const router = express.Router();

// Require packages feature for all routes
router.use(authMiddleware);

// Routes for packages
router
  .route("/")
  .get(getAllPackages)
  .post(
    restrictTo("super_admin", "admin", "employee"),
    validate(createPackageSchema),
    createPackage
  );

router
  .route("/:id")
  .get(getPackage)
  .patch(
    restrictTo("super_admin", "admin", "employee"),
    validate(updatePackageSchema),
    updatePackage
  )
  .delete(
    restrictTo("super_admin", "admin"),
    deletePackage
  );

export default router;
