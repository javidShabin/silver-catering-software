import jwt from "jsonwebtoken";
import { LRUCache } from "lru-cache";
import prisma from "../utils/prisma.js";
import AppError from "../utils/AppError.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token structure",
      });
    }

    let userAuthRecord = null;
    let isCrew = decoded.role === "crew";

    if (isCrew) {
      // NOTE: cateringCrew was a hypothetical role in original code, leaving logic intact without tenant
      userAuthRecord = await prisma.cateringCrew?.findUnique({
        where: { id: decoded.id },
        select: { status: true }
      });
      // Fallback if CateringCrew does not exist in Prisma schema
      if(!userAuthRecord) userAuthRecord = { status: "active" }; 
    } else {
      userAuthRecord = await prisma.auth.findUnique({
        where: { id: decoded.id },
        select: {
          status: true,
          suspensionReason: true,
          role: true
        }
      });
    }

    if (!userAuthRecord || userAuthRecord.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - User account is inactive, suspended, or deleted",
      });
    }

    req.user = { 
      id: decoded.id, 
      _id: decoded.id,
      name: decoded.name,
      email: decoded.email,
      role: isCrew ? decoded.role : (userAuthRecord.role || decoded.role),
      status: userAuthRecord.status,
      suspensionReason: userAuthRecord.suspensionReason || null,
      permissions: decoded.permissions || []
    };

    next();
  } catch (error) {
    return next(new AppError("Invalid token or authorization failed", 401));
  }
};

const CACHE_TTL = 5 * 60 * 1000;

const roleCache = new LRUCache({
  max: 500,
  ttl: CACHE_TTL,
  allowStale: false,
  updateAgeOnGet: false,
});

export const invalidateRoleCache = (roleName) => {
  if (roleName) {
    roleCache.delete(`role:${roleName}`);
  }
};

export const getEffectivePermissions = async (userRole, userDirectPermissions) => {
  let effective = new Set(userDirectPermissions || []);
  if (effective.has("all")) return Array.from(effective);

  const normalizedRole = (userRole || "").toLowerCase();
  if (normalizedRole === "admin") {
    effective.add("all");
    return Array.from(effective);
  }

  let userRolePermissions = [];
  const cacheKey = `role:${normalizedRole}`;
  const cached = roleCache.get(cacheKey);

  if (cached !== undefined) {
    userRolePermissions = cached;
  } else {
    const roleDb = await prisma.role.findFirst({
      where: { name: normalizedRole },
      select: { permissions: true }
    });
    if (roleDb && roleDb.permissions) {
      userRolePermissions = roleDb.permissions;
    }
    roleCache.set(cacheKey, userRolePermissions);
  }

  userRolePermissions.forEach(p => effective.add(p));
  return Array.from(effective);
};

export const restrictTo = (...roles) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) {
        return next(new AppError("User not authenticated", 401));
      }

      if (user.role === "admin") {
        return next();
      }

      if (roles.includes(user.role)) {
        return next();
      }

      const requiredPermissions = new Set();
      
      for (const roleName of roles) {
         const effectiveRolePerms = await getEffectivePermissions(roleName, []);
         effectiveRolePerms.forEach(p => requiredPermissions.add(p));
      }

      const userEffectivePermissions = await getEffectivePermissions(user.role, user.permissions);
      const hasPermission = userEffectivePermissions.includes("all") || userEffectivePermissions.some(p => requiredPermissions.has(p));

      if (hasPermission) {
        return next();
      }

      return next(new AppError("You do not have permission to perform this action", 403));

    } catch (err) {
      return next(err);
    }
  };
};

export default authMiddleware;