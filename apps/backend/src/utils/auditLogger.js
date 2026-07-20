import prisma from "./prisma.js";

/**
 * Log an activity performed by a Super Admin.
 * Runs asynchronously and fails silently to avoid disrupting core requests.
 * 
 * @param {Object} req - The Express request object containing req.user
 * @param {string} action - The action type (e.g., "CREATE_TENANT", "SUSPEND_USER")
 * @param {string} details - Detailed description of the action
 */
export const logSuperAdminActivity = async (req, action, details) => {
  try {
    const user = req.user;
    if (!user) return;

    await prisma.superAdminActivityLog.create({
      data: {
        adminId: user.id || "system",
        adminName: user.name || "Unknown Admin",
        adminEmail: user.email || "unknown@system.com",
        action,
        details}});
  } catch (error) {
    console.error("Failed to log super admin activity:", error);
  }
};
