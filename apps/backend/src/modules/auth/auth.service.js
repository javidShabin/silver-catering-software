import bcrypt from "bcryptjs";
import prisma from "../../utils/prisma.js";
import AppError from "../../utils/AppError.js";
import { LRUCache } from 'lru-cache';

const rateLimitCache = new LRUCache({
  max: 1000,
  ttl: 15 * 60 * 1000 // 15 minutes
});

// Dummy hash for timing attack mitigation (cost factor 10 to match actual passwords)
const DUMMY_HASH = "$2a$10$dummyHashToPreventTimingAttack1234567890123456789012";
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_SECONDS = 15 * 60; // 15 minutes

export const registerService = async (userData) => {
  const { name, email, password } = userData;

  // check existing email
  const existingUser = await prisma.auth.findUnique({ where: { email } });

  if (existingUser) {
    throw new AppError("Email already exists", 400);
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // create user
  const user = await prisma.auth.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: userData.role || "employee"
    }
  });

  return user;
};

const incrementFailedAttempt = async (attemptKey) => {
  const current = rateLimitCache.get(attemptKey) || 0;
  rateLimitCache.set(attemptKey, current + 1);
};

export const loginService = async (userData) => {
  const { email, password } = userData;
  const attemptKey = `login_attempts:${email}`;

  // Check rate limit
  const attempts = rateLimitCache.get(attemptKey);
  if (attempts && attempts >= MAX_LOGIN_ATTEMPTS) {
    throw new AppError("Too many failed login attempts. Please try again later.", 429);
  }

  // find user
  const user = await prisma.auth.findUnique({ where: { email } });

  if (!user) {
    // Mitigate timing attacks by performing a dummy hash comparison
    await bcrypt.compare(password, DUMMY_HASH);
    await incrementFailedAttempt(attemptKey);
    throw new AppError("Invalid email or password", 401);
  }

  // compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    await incrementFailedAttempt(attemptKey);
    throw new AppError("Invalid email or password", 401);
  }

  // Check if user is suspended
  if (user.status === "suspended") {
    throw new AppError("Your account is suspended", 403);
  }

  // Reset failed attempts on successful login
  rateLimitCache.delete(attemptKey);

  return user;
};

export const googleLoginService = async (decodedToken) => {
  const { email, name, picture } = decodedToken;

  if (!email) {
    throw new AppError("Google token does not contain an email", 400);
  }

  // Check if user exists
  let user = await prisma.auth.findUnique({ where: { email } });

  if (!user) {
    // Check if this is the first user to register
    const isFirstUser = (await prisma.auth.count()) === 0;

    if (!isFirstUser) {
      throw new AppError("Account not found. Please contact the administrator to create an account.", 404);
    }

    // Create user with a dummy password since Google handles authentication
    const dummyPassword = await bcrypt.hash(Math.random().toString(36).slice(-8), 10);

    // Create the admin user
    user = await prisma.auth.create({
      data: {
        name: name || email.split("@")[0],
        email,
        password: dummyPassword,
        role: "admin",
        profilePic: picture || null
      }
    });
  } else if (picture && !user.profilePic) {
    // Save google picture if user doesn't have one
    user = await prisma.auth.update({
      where: { id: user.id },
      data: { profilePic: picture }
    });
  }

  if (user.status === "suspended") {
    throw new AppError("Your account is suspended", 403);
  }

  return user;
};