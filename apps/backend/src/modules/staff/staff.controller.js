import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import bcrypt from "bcryptjs";
import { invalidateRoleCache } from "../../middleware/auth.middleware.js";
import { enforcePermissionGrantPolicy } from "../../utils/permissionGrantPolicy.js";
import { enforceHierarchy } from "../../utils/roleHierarchy.js";

/**
 * Get all staff members with filtering
 */
export const getAllStaff = catchAsync(async (req, res) => {
  const { role, department, status, search, page = 1, limit = 50 } = req.query;
  const MAX_LIMIT = 100;
  const limitNum = Math.min(Number(limit) || 50, MAX_LIMIT);
  const pageNum = Math.max(Number(page) || 1, 1);
  const skip = (pageNum - 1) * limitNum;
  

  const where = { };
  if (role && role !== "all") where.role = role;
  if (department && department !== "all") where.department = department;
  if (status && status !== "all") where.status = status;

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } }
    ];
  }

  try {
    const [total, staff] = await Promise.all([
      prisma.auth.count({ where }),
      prisma.auth.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          department: true,
          status: true,
          phone: true,
          permissions: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        take: limitNum,
        skip
      })
    ]);

    res.status(200).json({
      status: "success",
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum)
      },
      results: staff.length,
      data: staff});
  } catch (err) {
    console.error("GET_ALL_STAFF_ERROR:", err);
    throw err;
  }
});

/**
 * Add a new staff member
 */
export const addStaff = catchAsync(async (req, res) => {
  const { name, email, password, role, department, phone, permissions } = req.body;
  

  // Check if user already exists
  const existingUser = await prisma.auth.findUnique({ where: { email } });
  if (existingUser) {
    throw new AppError("A user with this email already exists", 400);
  }

  // Prevent creating another admin or super admin user
  if (role === "admin" || role === "super_admin" || role === "super-admin") {
    throw new AppError("You cannot create an admin or super admin account.", 400);
  }

  await enforcePermissionGrantPolicy(req.user.role, req.user.permissions,  role, permissions, req.user.id, null, null, null);

  // Enforce plan-based staff limit
  // No longer checking tenant plan limits in single-tenant mode
  const tenant = { plan: { maxStaff: -1 } };

  if (tenant && tenant.plan && tenant.plan.maxStaff !== -1) {
    const staffCount = await prisma.auth.count({
      where: { 
        
        role: { not: "admin" }
      }
    });

    if (staffCount >= tenant.plan.maxStaff) {
      throw new AppError(`Staff creation limit reached for your subscription plan. Maximum ${tenant.plan.maxStaff} staff members allowed.`, 400);
    }
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  const newStaff = await prisma.auth.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role,
      department,
      phone,
      permissions: permissions || []}
  });

  newStaff.password = undefined;

  res.status(201).json({
    status: "success",
    data: newStaff});
});

/**
 * Update staff member
 */
export const updateStaff = catchAsync(async (req, res) => {
  const { name, role, department, status, phone, permissions } = req.body;
  

  try {
    const existing = await prisma.auth.findFirst({
      where: { id: req.params.id }
    });

    if (!existing) {
      throw new AppError("No staff member found with that ID", 404);
    }

    enforceHierarchy(req.user.role, existing.role);
    await enforcePermissionGrantPolicy(req.user.role, req.user.permissions,  role, permissions, req.user.id, existing.id, existing.role, existing.permissions);

    // Ensure exactly one admin role per tenant
    if (role === "admin" && existing.role !== "admin") {
      throw new AppError("Only one admin account is allowed per company. You cannot promote another user to admin.", 400);
    }
    if ((role === "super_admin" || role === "super-admin") && existing.role !== "super_admin" && existing.role !== "super-admin") {
      throw new AppError("You cannot promote a user to super admin.", 400);
    }
    if (existing.role === "admin" && role && role !== "admin") {
      throw new AppError("You cannot change the role of the primary admin account.", 400);
    }

    const staff = await prisma.auth.update({
      where: { id: req.params.id },
      data: { name, role, department, status, phone, permissions },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        status: true,
        phone: true,
        permissions: true,
        createdAt: true,
        updatedAt: true
      }
    });

    res.status(200).json({
      status: "success",
      data: staff});
  } catch (error) {
    throw error;
  }
});

/**
 * Delete staff member
 */
export const deleteStaff = catchAsync(async (req, res) => {
  if (req.params.id === req.user.id) {
    throw new AppError("You cannot remove your own account", 400);
  }

  
  const existing = await prisma.auth.findFirst({
    where: { id: req.params.id }
  });

  if (!existing) {
    throw new AppError("No staff member found with that ID", 404);
  }

  enforceHierarchy(req.user.role, existing.role);

  try {
    // Clear relations to prevent P2003 foreign key constraint errors
    await prisma.notification.deleteMany({
      where: { recipientId: req.params.id }
    });

    await prisma.inventory.updateMany({
      where: { lastUpdatedById: req.params.id },
      data: { lastUpdatedById: null }
    });

    await prisma.stockHistory.updateMany({
      where: { performedById: req.params.id },
      data: { performedById: null }
    });

    // Disconnect from all assigned events
    await prisma.auth.update({
      where: { id: req.params.id },
      data: {
        eventsAssigned: {
          set: []
        }
      }
    });

    // Delete all duty roster entries
    await prisma.dutyRoster.deleteMany({
      where: { staffId: req.params.id }
    });

    await prisma.auth.delete({
      where: { id: req.params.id }
    });

    res.status(204).json({
      status: "success",
      data: null});
  } catch (error) {
    if (error.code === 'P2003') {
      throw new AppError("Cannot remove staff member because they are linked to active events or tasks.", 400);
    }
    throw error;
  }
});

/**
 * Get all roles (predefined defaults + custom)
 */
export const getAllRoles = catchAsync(async (req, res) => {
  
  const customRoles = await prisma.role.findMany({
    orderBy: { createdAt: "asc" }
  });
  
  const systemDefaults = [
    { id: "admin", name: "admin", label: "Administrator", description: "Full system access", permissions: ["all"], isSystemDefault: true }
  ];

  const allRoles = [...systemDefaults, ...customRoles];

  res.status(200).json({
    status: "success",
    data: allRoles
  });
});

/**
 * Add a new custom role
 */
export const addRole = catchAsync(async (req, res) => {
  const { name, label, description, permissions } = req.body;
  

  const lowercaseName = name.trim().toLowerCase().replace(/\s+/g, '-');
  
  await enforcePermissionGrantPolicy(req.user.role, req.user.permissions,  null, permissions, req.user.id, null, null, null);

  // Guard against recreating system defaults
  const defaults = ["admin", "super_admin", "super-admin"];
  if (defaults.includes(lowercaseName)) {
    throw new AppError("Cannot recreate default system roles", 400);
  }

  // Check if role already exists for this tenant
  const existingRole = await prisma.role.findUnique({ 
    where: { _name: {  name: lowercaseName } } 
  });
  if (existingRole) {
    throw new AppError("A role with this name already exists", 400);
  }

  const newRole = await prisma.role.create({
    data: {
      name: lowercaseName,
      label: label.trim(),
      description: description || "",
      permissions: permissions || [],
      isSystemDefault: false}
  });

  invalidateRoleCache(lowercaseName);

  res.status(201).json({
    status: "success",
    data: newRole
  });
});

/**
 * Update custom role
 */
export const updateRole = catchAsync(async (req, res) => {
  const { label, description, permissions } = req.body;
  

  const role = await prisma.role.findFirst({ where: { id: req.params.id} });
  if (!role) {
    throw new AppError("No role found with that ID", 404);
  }

  if (role.isSystemDefault) {
    throw new AppError("System default roles cannot be updated", 400);
  }

  await enforcePermissionGrantPolicy(req.user.role, req.user.permissions,  null, permissions, req.user.id, null, null, role.permissions);

  const updatedRole = await prisma.role.update({
    where: { id: req.params.id },
    data: {
      label: label || role.label,
      description: description !== undefined ? description : role.description,
      permissions: permissions || role.permissions
    }
  });

  invalidateRoleCache(role.name);

  res.status(200).json({
    status: "success",
    data: updatedRole
  });
});

/**
 * Delete custom role
 */
export const deleteRole = catchAsync(async (req, res) => {
  
  const role = await prisma.role.findFirst({ where: { id: req.params.id } });
  if (!role) {
    throw new AppError("No role found with that ID", 404);
  }

  if (role.isSystemDefault) {
    throw new AppError("System default roles cannot be deleted", 400);
  }

  await prisma.role.delete({ where: { id: req.params.id } });

  invalidateRoleCache(role.name);

  res.status(204).json({
    status: "success",
    data: null
  });
});
