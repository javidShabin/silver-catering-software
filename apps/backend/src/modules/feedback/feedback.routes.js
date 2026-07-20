import express from "express";
import {
  getFeedbackByToken,
  submitFeedback,
  getTenantFeedbacks,
  getFeedbackLinkForEvent,
  getWebsiteReviews
} from "./feedback.controller.js";
import protect, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Public routes (no auth required)
router.get("/public/:token", getFeedbackByToken);
router.post("/public/:token", submitFeedback);
router.get("/website", getWebsiteReviews);

// Protected routes (Admin/Manager only)
router.get("/admin", protect, restrictTo("admin", "manager", "super_admin"), getTenantFeedbacks);
router.get("/admin/link/:eventId", protect, restrictTo("admin", "manager", "super_admin"), getFeedbackLinkForEvent);

export default router;
