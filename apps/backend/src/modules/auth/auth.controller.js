import { registerService, loginService, googleLoginService } from "./auth.service.js";
import generateToken from "../../utils/generateToken.js";
import catchAsync from "../../utils/catchAsync.js";
import { getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import AppError from "../../utils/AppError.js";
import prisma from "../../utils/prisma.js";
import bcrypt from "bcryptjs";
import { sendEmail } from "../../utils/email.js";

export const getSetupStatus = catchAsync(async (req, res) => {
  const adminCount = await prisma.auth.count({
    where: { role: "admin" }
  });

  res.status(200).json({
    success: true,
    data: {
      hasAdmin: adminCount > 0
    }
  });
});

export const requestSignupOtp = catchAsync(async (req, res) => {
  const { email, name } = req.body;

  // Check if system already has an admin (since only 1st user can signup)
  const adminCount = await prisma.auth.count({
    where: { role: "admin" }
  });

  if (adminCount > 0) {
    throw new AppError("System is already set up. Signup is disabled.", 403);
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  await prisma.signupOtp.upsert({
    where: { email },
    update: { otp, expiresAt },
    create: { email, otp, expiresAt }
  });

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>Welcome, ${name}!</h2>
      <p>Thank you for registering. Please use the OTP below to verify your email address:</p>
      <h1 style="color: #f97316; letter-spacing: 5px;">${otp}</h1>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;

  const emailRes = await sendEmail({
    to: email,
    subject: "Verify Your Email - Catering System",
    htmlContent: emailHtml
  });

  if (!emailRes.success) {
    throw new AppError("Failed to send OTP email: " + emailRes.message, 500);
  }

  res.status(200).json({
    success: true,
    message: "OTP sent to your email"
  });
});

export const register = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  // Verify OTP first
  const otpRecord = await prisma.signupOtp.findUnique({
    where: { email }
  });

  if (!otpRecord) {
    throw new AppError("No OTP request found for this email", 400);
  }

  if (otpRecord.otp !== otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (new Date() > otpRecord.expiresAt) {
    throw new AppError("OTP has expired. Please request a new one.", 400);
  }

  // Check if an admin already exists to prevent public signup abuse
  const adminCount = await prisma.auth.count({
    where: { role: "admin" }
  });

  if (adminCount > 0) {
    throw new AppError("System is already set up. Signup is disabled.", 403);
  }

  // Force first user to be admin
  req.body.role = "admin";
  const user = await registerService(req.body);

  // Delete OTP record
  await prisma.signupOtp.delete({ where: { email } }).catch(() => {});

  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000});

  let combinedPermissions = [...(user.permissions || [])];
  if (user.role && user.role !== "admin") {
    const roleDb = await prisma.role.findFirst({
      where: { name: user.role},
      select: { permissions: true }
    });
    if (roleDb && roleDb.permissions) {
      combinedPermissions = [...new Set([...combinedPermissions, ...roleDb.permissions])];
    }
  }

  res.status(201).json({
    success: true,
    message: "User Registered Successfully",
    data: {
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        suspensionReason: user.suspensionReason || null,
        permissions: combinedPermissions,
        profilePic: user.profilePic || null
      }
    }
  });
});

export const login = catchAsync(async (req, res) => {
  const user = await loginService(req.body);
  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000});

  let combinedPermissions = [...(user.permissions || [])];
  if (user.role && user.role !== "admin") {
    const roleDb = await prisma.role.findFirst({
      where: { name: user.role},
      select: { permissions: true }
    });
    if (roleDb && roleDb.permissions) {
      combinedPermissions = [...new Set([...combinedPermissions, ...roleDb.permissions])];
    }
  }

  res.status(200).json({
    success: true,
    message: "Login Successful",
    data: {
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        suspensionReason: user.suspensionReason || null,
        permissions: combinedPermissions,
        profilePic: user.profilePic || null
      }
    }
  });
});

export const googleLogin = catchAsync(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("No ID token provided", 400);
  }

  if (getApps().length === 0) {
    throw new AppError("Firebase Admin SDK is not initialized.", 500);
  }

  let decodedToken;
  try {
    decodedToken = await getAuth().verifyIdToken(idToken);
  } catch (error) {
    throw new AppError(`Invalid Google ID token: ${error.message}`, 401);
  }

  const user = await googleLoginService(decodedToken);
  const token = generateToken(user);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000});

  let combinedPermissions = [...(user.permissions || [])];
  if (user.role && user.role !== "admin") {
    const roleDb = await prisma.role.findFirst({
      where: { name: user.role},
      select: { permissions: true }
    });
    if (roleDb && roleDb.permissions) {
      combinedPermissions = [...new Set([...combinedPermissions, ...roleDb.permissions])];
    }
  }

  res.status(200).json({
    success: true,
    message: "Google Login Successful",
    data: {
      user: {
        id: user.id,
        _id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: combinedPermissions,
        profilePic: user.profilePic || null
      }
    }
  });
});

export const getMe = catchAsync(async (req, res) => {
  let combinedPermissions = [...(req.user.permissions || [])];
  if (req.user.role && req.user.role !== "admin") {
    const roleDb = await prisma.role.findFirst({
      where: { name: req.user.role},
      select: { permissions: true }
    });
    if (roleDb && roleDb.permissions) {
      combinedPermissions = [...new Set([...combinedPermissions, ...roleDb.permissions])];
    }
  }

  res.status(200).json({
    success: true,
    user: {
      ...req.user,
      privacyPolicyAccepted: true,
      permissions: combinedPermissions,
      profilePic: req.user.profilePic || null
    }
  });
});

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadProfilePic = catchAsync(async (req, res) => {
  if (!req.file) throw new AppError("Please provide an image file", 400);
  const user = await prisma.auth.findUnique({ where: { id: req.user.id } });
  if (user.profilePic && user.profilePic.startsWith("/uploads/")) {
    const filename = user.profilePic.replace("/uploads/", "");
    const oldPath = path.join(__dirname, "../../../uploads", filename);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
  }
  const profilePicUrl = `/uploads/${req.file.filename}`;
  const updatedUser = await prisma.auth.update({
    where: { id: req.user.id },
    data: { profilePic: profilePicUrl }
  });
  res.status(200).json({
    success: true,
    message: "Profile picture updated successfully",
    data: { profilePic: profilePicUrl }
  });
});

export const updateProfile = catchAsync(async (req, res) => {
  const { name, phone } = req.body;
  if (!name) throw new AppError("Name is required", 400);
  const updatedUser = await prisma.auth.update({
    where: { id: req.user.id },
    data: { name, phone: phone || null }
  });
  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    user: updatedUser
  });
});



export const logout = catchAsync(async (req, res) => {
  res.cookie("token", "", {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax"});
  res.status(200).json({
    success: true,
    message: "Logged out successfully"
  });
});

export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  if (!email) throw new AppError("Email address is required", 400);
  const user = await prisma.auth.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return res.status(200).json({ success: true, message: "If that email exists in our system, we have sent a 6-digit OTP code." });
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.auth.update({ where: { id: user.id }, data: { resetOtp: otp, resetOtpExpires: otpExpires } });
  res.status(200).json({ success: true, message: "If that email exists in our system, we have sent a 6-digit OTP code." });
});

export const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) throw new AppError("Email, OTP, and new password are required", 400);
  const user = await prisma.auth.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user || !user.resetOtp || !user.resetOtpExpires) throw new AppError("Invalid or expired password reset request", 400);
  if (user.resetOtp !== otp.trim()) throw new AppError("Incorrect OTP code", 400);
  if (new Date() > new Date(user.resetOtpExpires)) throw new AppError("OTP code has expired.", 400);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.auth.update({ where: { id: user.id }, data: { password: hashedPassword, resetOtp: null, resetOtpExpires: null } });
  res.status(200).json({ success: true, message: "Password reset successfully. You can now login." });
});

export const requestPasswordChange = catchAsync(async (req, res) => {
  const { currentPassword } = req.body;
  if (!currentPassword) throw new AppError("Current password is required", 400);
  const user = await prisma.auth.findUnique({ where: { id: req.user.id } });
  if (!user) throw new AppError("User not found", 404);
  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) throw new AppError("Incorrect current password", 400);
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.auth.update({ where: { id: user.id }, data: { resetOtp: otp, resetOtpExpires: otpExpires } });
  res.status(200).json({ success: true, message: "A 6-digit OTP code has been sent." });
});

export const confirmPasswordChange = catchAsync(async (req, res) => {
  const { otp, newPassword } = req.body;
  if (!otp || !newPassword) throw new AppError("OTP code and new password are required", 400);
  if (newPassword.length < 8) throw new AppError("Password must be at least 8 characters long", 400);
  const user = await prisma.auth.findUnique({ where: { id: req.user.id } });
  if (!user || !user.resetOtp || !user.resetOtpExpires) throw new AppError("Invalid or expired password change request", 400);
  if (user.resetOtp !== otp.trim()) throw new AppError("Incorrect OTP code", 400);
  if (new Date() > new Date(user.resetOtpExpires)) throw new AppError("OTP code has expired.", 400);
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.auth.update({ where: { id: user.id }, data: { password: hashedPassword, resetOtp: null, resetOtpExpires: null } });
  res.status(200).json({ success: true, message: "Password changed successfully." });
});