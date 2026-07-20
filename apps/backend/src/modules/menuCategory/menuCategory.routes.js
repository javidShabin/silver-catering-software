import express from "express";
import * as menuCategoryController from "./menuCategory.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .get(menuCategoryController.getAllCategories)
  .post(restrictTo("admin", "manager"), menuCategoryController.createCategory);

router
  .route("/:id")
  .patch(restrictTo("admin", "manager"), menuCategoryController.updateCategory)
  .delete(restrictTo("admin", "manager"), menuCategoryController.deleteCategory);

export default router;
