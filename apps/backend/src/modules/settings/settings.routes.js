import express from "express";
import * as settingsController from "./settings.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

// Both admins and super_admins can view the policy
router.get("/privacy-policy", authMiddleware, settingsController.getPrivacyPolicy);

// Only super_admin can update it
router.put(
  "/privacy-policy",
  authMiddleware,
  restrictTo("super_admin"),
  settingsController.updatePrivacyPolicy
);

export default router;
