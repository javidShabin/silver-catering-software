import prisma from "../../utils/prisma.js";
import { emitToUser } from "../../utils/socket.js";

class NotificationService {
  /**
   * Send a notification to a user and save it in database
   */
  async sendNotification(recipientId, title, message, type = "info", category = "system", tx = prisma) {
    try {
      const data = {
        recipientId,
        title,
        message,
        type,
        category
      };

      const notification = await tx.notification.create({ data });
      emitToUser(recipientId, "notification", notification);
      return notification;
    } catch (err) {
      console.error(JSON.stringify({
        level: "error",
        message: "Failed to send notification",
        recipientId,
        type,
        error: err.message
      }));
      throw err;
    }
  }
}

export default new NotificationService();
