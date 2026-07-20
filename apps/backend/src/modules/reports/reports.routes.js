import express from "express";
import * as reportsController from "./reports.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/summary", restrictTo("admin", "manager", "accountant"), reportsController.getSummaryStats);
router.get("/trends", restrictTo("admin", "manager", "accountant"), reportsController.getMonthlyTrends);
router.get("/top-items", restrictTo("admin", "manager", "accountant"), reportsController.getTopItems);
router.get("/dashboard-summary", restrictTo("admin", "manager", "accountant"), reportsController.getDashboardSummary);
router.get("/financial-analytics", restrictTo("admin", "manager", "accountant"), reportsController.getFinancialAnalytics);

export default router;
