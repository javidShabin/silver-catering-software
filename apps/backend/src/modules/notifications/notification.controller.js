import prisma from "../../utils/prisma.js";
import catchAsync from "../../utils/catchAsync.js";
import AppError from "../../utils/AppError.js";
import { emitToUser } from "../../utils/socket.js";

/**
 * Get notifications for the authenticated user
 */
export const getMyNotifications = catchAsync(async (req, res) => {
  const where = { 
    recipientId: req.user.id,
    title: { notIn: ['Promised Payment Today', 'Overdue Promised Payment'] }
  };


  const notifications = await prisma.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50
  });

  const unreadCount = await prisma.notification.count({
    where: {
      ...where,
      isRead: false}
  });

  res.status(200).json({
    status: "success",
    unreadCount,
    results: notifications.length,
    data: notifications});
});

/**
 * Mark a specific notification as read
 */
export const markAsRead = catchAsync(async (req, res) => {
  const where = { id: req.params.id };


  const existing = await prisma.notification.findFirst({
    where
  });

  if (!existing || existing.recipientId !== req.user.id) {
    throw new AppError("No notification found with that ID or unauthorized", 404);
  }

  const notification = await prisma.notification.update({
    where: { id: req.params.id },
    data: { isRead: true }
  });

  res.status(200).json({
    status: "success",
    data: notification});
});

/**
 * Mark all notifications as read for the user
 */
export const markAllAsRead = catchAsync(async (req, res) => {
  const where = { 
    recipientId: req.user.id, 
    isRead: false 
  };


  await prisma.notification.updateMany({
    where,
    data: { isRead: true }
  });

  res.status(200).json({
    status: "success",
    message: "All notifications marked as read"});
});

/**
 * Internal helper to create notifications from other modules
 * Not exported as a route, but used by controllers
 */
export const createNotification = async (data) => {
  try {
    const notification = await prisma.notification.create({ data });
    emitToUser(data.recipientId, "notification", notification);
    return true;
  } catch (err) {
    console.error(JSON.stringify({
      level: "error",
      message: "Failed to create internal notification",
      recipientId: data.recipientId,
      error: err.message
    }));
    throw err;
  }
};

/**
 * Delete a notification
 */
export const deleteNotification = catchAsync(async (req, res) => {
  const where = { id: req.params.id };


  const existing = await prisma.notification.findFirst({
    where
  });

  if (!existing || existing.recipientId !== req.user.id) {
    throw new AppError("No notification found with that ID or unauthorized", 404);
  }

  await prisma.notification.delete({
    where: { id: req.params.id }
  });

  res.status(204).json({
    status: "success",
    data: null});
});

/**
 * Get active global announcements for tenants
 */
export const getActiveAnnouncements = catchAsync(async (req, res) => {
  const now = new Date();
  const announcements = await prisma.announcement.findMany({
    where: {
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: now } }
      ]
    },
    orderBy: { createdAt: "desc" }
  });

  res.status(200).json({
    status: "success",
    results: announcements.length,
    data: announcements
  });
});
