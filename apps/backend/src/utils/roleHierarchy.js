import AppError from "./AppError.js";

const getRoleRank = (role) => {
  const normalized = (role || "").toLowerCase();
  if (normalized === "super_admin" || normalized === "super-admin") return 3;
  if (normalized === "admin") return 2;
  return 1;
};

/**
 * Validates whether the actor can perform destructive or modifying actions against the target.
 */
export const enforceHierarchy = (actorRole, targetRole) => {
  if (getRoleRank(targetRole) > getRoleRank(actorRole)) {
    throw new AppError("You do not have permission to modify or delete a user with a higher role.", 403);
  }
};
