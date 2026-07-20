import express from "express";
import * as ticketController from "./ticket.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ─── Ticket Routes ──────────────────────────────────────────────────────────
router.get("/my-tickets", restrictTo("admin", "manager"), ticketController.getMyTickets);
router.post("/", restrictTo("admin", "manager"), ticketController.createTicket);
router.get("/:id", restrictTo("admin", "manager"), ticketController.getTicketDetails);
router.post("/:id/messages", restrictTo("admin", "manager"), ticketController.replyToTicket);
router.patch("/:id/close", restrictTo("admin", "manager"), ticketController.closeTicket);

export default router;
