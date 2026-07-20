import express from "express";

import authMiddleware from "../../middleware/auth.middleware.js";
import { 
  authLimiter, 
  forgotPasswordLimiter, 
  resetPasswordLimiter 
} from "../../middleware/rateLimit.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { registerSchema, requestSignupOtpSchema } from "./auth.validation.js";
import { upload } from "../../utils/upload.js";

import {
  requestSignupOtp,
  register,
  login,
  googleLogin,
  getMe,
  logout,
  getSetupStatus,
  forgotPassword,
  resetPassword,
  requestPasswordChange,
  confirmPasswordChange,
  uploadProfilePic,
  updateProfile
} from "./auth.controller.js";

const router = express.Router();

router.get("/setup-status", getSetupStatus);

// Public registration is conditionally handled in the service (only allows first user)
router.post("/request-signup-otp", authLimiter, validate(requestSignupOtpSchema), requestSignupOtp);
router.post("/register", authLimiter, validate(registerSchema), register);

router.post("/login", authLimiter, login);

router.post("/google", authLimiter, googleLogin);

router.post("/logout", logout);

router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);

router.post("/reset-password", resetPasswordLimiter, resetPassword);

router.post("/change-password/request", authMiddleware, requestPasswordChange);
router.post("/change-password/confirm", authMiddleware, confirmPasswordChange);

router.get("/me", authMiddleware, getMe);
router.put("/profile", authMiddleware, updateProfile);
router.post("/profile-pic", authMiddleware, upload.single("image"), uploadProfilePic);



export default router;