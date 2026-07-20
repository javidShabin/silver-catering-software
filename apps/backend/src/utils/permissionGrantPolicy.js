import AppError from "./AppError.js";
import prisma from "./prisma.js";
import { getEffectivePermissions } from "../middleware/auth.middleware.js";

/**
 * Validates whether an actor is authorized to grant specific permissions or assign a role.
 * An actor can only grant permissions they inherently possess.
 */
export const enforcePermissionGrantPolicy = async (actorRole, actorDirectPermissions,  requestedRole, requestedPermissions = [], actorId = null, targetId = null, existingRole = null, existingPermissions = null) => {
  // Check if a privilege mutation is actually occurring to safely bypass self-profile updates
  const isRoleMutated = requestedRole !== undefined && requestedRole !== existingRole;
  
  let isPermissionsMutated = false;
  if (requestedPermissions !== undefined) {
    const existingStr = existingPermissions ? [...existingPermissions].sort().join(',') : "";
    const requestedStr = [...requestedPermissions].sort().join(',');
    isPermissionsMutated = requestedStr !== existingStr;
  }

  const isPrivilegeMutation = isRoleMutated || isPermissionsMutated;

  if (!isPrivilegeMutation) return;

  // 1. Prevent self privilege escalation
  if (actorId && targetId && actorId === targetId) {
    throw new AppError("You cannot modify your own role or privileges.", 403);
  }

  let requiredPermissions = requestedPermissions ? [...requestedPermissions] : [];
  
  // 2. If assigning a role, determine the permissions attached to that role
  if (requestedRole && isRoleMutated) {
    const normalizedTarget = requestedRole.toLowerCase();
    const systemAdmins = ["admin", "super_admin", "super-admin"];
    
    if (systemAdmins.includes(normalizedTarget)) {
      requiredPermissions.push("all");
    } else {
      const targetRoleDb = await prisma.role.findFirst({
        where: { name: normalizedTarget}
      });
      if (targetRoleDb && targetRoleDb.permissions) {
        requiredPermissions = [...requiredPermissions, ...targetRoleDb.permissions];
      }
    }
  }

  if (requiredPermissions.length === 0) return;

  // 3. Determine actor's authority using the shared resolver
  const actorPermissions = await getEffectivePermissions(actorRole, actorDirectPermissions, );
  const actorHasAll = actorPermissions.includes("all");

  if (actorHasAll) return; // Actor has universal authority

  // 4. Prevent privilege escalation beyond authority
  for (const perm of requiredPermissions) {
    if (!actorPermissions.includes(perm)) {
      throw new AppError("You do not have the authority to grant privileges you do not possess.", 403);
    }
  }
};
