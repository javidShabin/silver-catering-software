import { Server } from "socket.io";
import * as cookie from "cookie";
import jwt from "jsonwebtoken";

let io;

/**
 * Initialize Socket.io on the HTTP server
 */
export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow localhost, 127.0.0.1, and private IP ranges
        if (
          !origin ||
          /^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+)(:\d+)?$/.test(origin)
        ) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true}});

  io.use((socket, next) => {
    try {
      const cookies = cookie.parse(socket.handshake.headers.cookie || "");
      const token = cookies.token;

      if (!token) {
        return next(new Error("Authentication error: No token provided"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded || !decoded.id) {
        return next(new Error("Authentication error: Invalid token structure"));
      }

      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`Socket.io client connected: ${socket.id}, User: ${socket.user.id}`);

    // Automatically join the authenticated user's room
    socket.join(socket.user.id.toString());
    console.log(`Socket.io client ${socket.id} automatically joined user room: ${socket.user.id}`);

    // Listen for join events but ignore the client-provided ID to prevent hijacking
    socket.on("join", (requestedUserId) => {
      console.log(`Socket.io client ${socket.id} attempted to join room ${requestedUserId}, but is locked to ${socket.user.id}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket.io client disconnected: ${socket.id}`);
    });
  });

  return io;
};

/**
 * Emit a live event to a specific user's connected socket sessions
 */
export const emitToUser = (userId, eventName, data) => {
  if (io && userId) {
    io.to(userId.toString()).emit(eventName, data);
    console.log(`Socket.io: Emitted ${eventName} to user room: ${userId}`);
  }
};

/**
 * Gracefully close Socket.io
 */
export const closeSocket = async () => {
  if (io) {
    await new Promise((resolve) => io.close(resolve));
    console.log("[Socket.io] Server closed");
  }
};

