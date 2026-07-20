import express from "express";
import * as menuController from "./menu.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createMenuSchema, updateMenuSchema } from "./menu.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", menuController.getAllMenuItems);
router.get("/lookup", menuController.getMenuLookup);
router.post("/", restrictTo("admin", "manager"), validate(createMenuSchema), menuController.createMenuItem);
router.patch("/:id", restrictTo("admin", "manager"), validate(updateMenuSchema), menuController.updateMenuItem);
router.delete("/:id", restrictTo("admin", "manager"), menuController.deleteMenuItem);

export default router;
