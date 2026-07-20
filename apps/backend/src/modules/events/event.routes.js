import express from "express";
import * as eventController from "./event.controller.js";
import * as eventIngredientController from "./eventIngredient.controller.js";
import * as eventLogisticsController from "./event.logistics.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createEventSchema, updateEventSchema } from "./event.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", eventController.getAllEvents);
router.get("/lookup", eventController.getEventLookup);
router.get("/overdue-count", eventController.getOverdueCount);
router.get("/:id", eventController.getEvent);
router.post("/", restrictTo("admin", "manager"), validate(createEventSchema), eventController.createEvent);
router.patch("/:id", restrictTo("admin", "manager"), validate(updateEventSchema), eventController.updateEvent);
router.delete("/:id", restrictTo("admin", "manager"), eventController.deleteEvent);

import * as extraBillController from "./extraBill.controller.js";

// Event Ingredient Routes
router.get("/:id/ingredients", eventIngredientController.getEventIngredients);
router.post("/:id/ingredients", restrictTo("admin", "manager"), eventIngredientController.addEventIngredient);
router.patch("/:id/ingredients/:ingredientId", restrictTo("admin", "manager"), eventIngredientController.updateEventIngredient);
router.delete("/:id/ingredients/:ingredientId", restrictTo("admin", "manager"), eventIngredientController.deleteEventIngredient);

// Event Logistics Tracking Routes
router.get("/:id/logistics", eventLogisticsController.getEventLogistics);
router.post("/:id/logistics/return", restrictTo("admin", "manager"), eventLogisticsController.processLogisticsReturn);

// Extra Bills Routes
router.get("/:id/extra-bills", extraBillController.getExtraBills);
router.post("/:id/extra-bills", restrictTo("admin", "manager"), extraBillController.addExtraBill);
router.patch("/:id/extra-bills/:billId", restrictTo("admin", "manager"), extraBillController.updateExtraBill);
router.delete("/:id/extra-bills/:billId", restrictTo("admin", "manager"), extraBillController.deleteExtraBill);

export default router;
