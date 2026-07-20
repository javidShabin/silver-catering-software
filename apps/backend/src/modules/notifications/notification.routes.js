import express from "express";
import * as notificationController from "./notification.controller.js";
import authMiddleware from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/announcements", notificationController.getActiveAnnouncements);
router.get("/", notificationController.getMyNotifications);
router.patch("/mark-all-read", notificationController.markAllAsRead);
router.patch("/:id/read", notificationController.markAsRead);
router.delete("/:id", notificationController.deleteNotification);

export default router;
