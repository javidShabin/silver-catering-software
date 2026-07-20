import "dotenv/config";
import { validateEnv } from "./utils/validateEnv.js";
validateEnv();

import http from "http";
import app from "./app.js";
import { initCronJobs } from "./utils/cron.js";
import { initSocket } from "./utils/socket.js";
import { closeSocket } from "./utils/socket.js";
import prisma from "./utils/prisma.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT || 5000;

initCronJobs();

const server = http.createServer(app);
initSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

let isShuttingDown = false;

async function shutdown(signal, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`[Server] Received ${signal} — starting graceful shutdown...`);

  // Force exit failsafe after 10 seconds
  const forceExitTimeout = setTimeout(() => {
    console.warn("[Server] Graceful shutdown timed out — forcing exit");
    process.exit(exitCode);
  }, 10000);
  if (typeof forceExitTimeout.unref === 'function') forceExitTimeout.unref();

  try {
    // 1. Close HTTP server so it stops accepting new connections
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      console.log("[Server] HTTP server closed");
    }

    // 2. Close Socket.IO server & its Redis adapter clients
    await closeSocket();

    // 3. Close Prisma database connections
    await prisma.$disconnect();
    console.log("[Server] Prisma DB connections closed");

  } catch (err) {
    console.error("[Server] Error during graceful shutdown:", err);
  } finally {
    console.log("[Server] Shutdown complete — exiting");
    process.exit(exitCode);
  }
}

// Register listeners
process.on("SIGTERM", () => shutdown("SIGTERM", 0));
process.on("SIGINT", () => shutdown("SIGINT", 0));

process.on("uncaughtException", (err) => {
  logger.fatal(err, "uncaughtException");
  shutdown("uncaughtException", 1);
});

process.on("unhandledRejection", (err) => {
  logger.fatal(err, "unhandledRejection");
  shutdown("unhandledRejection", 1);
});