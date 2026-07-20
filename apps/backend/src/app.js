import express from "express";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import hpp from "hpp";
import "./utils/firebaseAdmin.js";
import authRoutes from "./modules/auth/auth.routes.js";
import reportsRoutes from "./modules/reports/reports.routes.js";
import eventRoutes from "./modules/events/event.routes.js";
import customerRoutes from "./modules/customers/customer.routes.js";
import inventoryRoutes from "./modules/inventory/inventory.routes.js";
import purchaseRoutes from "./modules/purchases/purchase.routes.js";
import menuRoutes from "./modules/menu/menu.routes.js";
import menuCategoryRoutes from "./modules/menuCategory/menuCategory.routes.js";
import billingRoutes from "./modules/billing/billing.routes.js";
import staffRoutes from "./modules/staff/staff.routes.js";
import notificationRoutes from "./modules/notifications/notification.routes.js";
import quotationRoutes from "./modules/quotations/quotation.routes.js";
import expenseRoutes from "./modules/expenses/expense.routes.js";
import supplierRoutes from "./modules/supplier/supplier.routes.js";
import inventoryCategoryRoutes from "./modules/inventoryCategory/inventoryCategory.routes.js";
import feedbackRoutes from "./modules/feedback/feedback.routes.js";
import ticketRoutes from "./modules/tickets/ticket.routes.js";
import packageRoutes from "./modules/packages/packages.routes.js";
import agenciesRoutes from "./modules/agencies/agencies.routes.js";
import backupRoutes from "./modules/backup/backup.routes.js";
import settingsRoutes from "./modules/settings/settings.routes.js";
import { globalErrorHandler } from "./middleware/error.middleware.js";
const app = express();

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// Required for express-rate-limit to work correctly when behind a proxy
app.set('trust proxy', 1);

// 1. Set Security HTTP Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.CLIENT_WEBSITE_URL // Client static website
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (process.env.NODE_ENV === "production") {
        // Strict production CORS
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      } else {
        // Permissive development CORS for local network testing
        const isLocal = /^(http:\/\/localhost:\d+|http:\/\/127\.0\.0\.1:\d+|http:\/\/192\.168\.\d+\.\d+:\d+|http:\/\/10\.\d+\.\d+\.\d+:\d+)$/.test(origin);
        if (isLocal || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true})
);


// Body parser, reading data from body into req.body
app.use(express.json());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// Data sanitization against NoSQL query injection
// Note: express-mongo-sanitize is removed because it is incompatible with Express 5 (req.query is read-only).
// Security is instead handled robustly by our strict Zod validation schemas which reject NoSQL injection objects.

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cookieParser());

app.use(morgan("dev"));

// Serve static files (like generated PDFs)
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/reports", reportsRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/customers", customerRoutes);
app.use("/api/v1/inventory", inventoryRoutes);
app.use("/api/v1/inventory-categories", inventoryCategoryRoutes);
app.use("/api/v1/purchases", purchaseRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/menu-categories", menuCategoryRoutes);
app.use("/api/v1/billing", billingRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/quotations", quotationRoutes);
app.use("/api/v1/expenses", expenseRoutes);
app.use("/api/v1/suppliers", supplierRoutes);
app.use("/api/v1/feedback", feedbackRoutes);
app.use("/api/v1/tickets", ticketRoutes);
app.use("/api/v1/packages", packageRoutes);
app.use("/api/v1/agencies", agenciesRoutes);
app.use("/api/v1/backup", backupRoutes);
app.use("/api/v1/settings", settingsRoutes);

app.get("/", (req, res) => {
  res.send("Backend Running...");
});

// All unhandled route requests
app.use((req, res, next) => {
  // Pass the error to the global handler
  next(new Error(`Can't find ${req.originalUrl} on this server!`));
});

// Global Error Handler Middleware
app.use(globalErrorHandler);

export default app;
// nodemon restart

// nodemon trigger

// nodemon trigger

// nodemon trigger

// nodemon trigger

// nodemon trigger
