import express from "express";
import { getGoogleAuthUrl, handleGoogleCallback, triggerBackup, restoreBackup, getBackupStatus } from "./backup.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import multer from "multer";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get the Google OAuth URL for the user to authorize
router.get("/google/auth", authMiddleware, restrictTo("admin", "manager", "super_admin"), getGoogleAuthUrl);

// Handle the callback from Google
router.get("/google/callback", handleGoogleCallback);

// Trigger a manual backup
router.post("/trigger", authMiddleware, restrictTo("admin", "super_admin"), triggerBackup);

// Restore a backup
router.post("/restore", authMiddleware, restrictTo("admin", "super_admin"), upload.single("backupFile"), restoreBackup);

// Get backup connection status
router.get("/status", authMiddleware, restrictTo("admin", "manager", "super_admin"), getBackupStatus);

export default router;
