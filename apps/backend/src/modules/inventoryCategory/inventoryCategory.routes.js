import express from "express";
import * as categoryController from "./inventoryCategory.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", categoryController.getAllCategories);
router.post("/", restrictTo("admin", "manager"), categoryController.createCategory);
router.patch("/:id", restrictTo("admin", "manager"), categoryController.updateCategory);
router.delete("/:id", restrictTo("admin", "manager"), categoryController.deleteCategory);

export default router;
