import express from "express";
import authMiddleware from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import AppError from "../../utils/AppError.js";
import {
  getAllAgencies,
  getAgency,
  createAgency,
  updateAgency,
  deleteAgency,
  getAllAssignments,
  getEventAssignments,
  assignAgency,
  updateAssignment,
  deleteAssignment
} from "./agencies.controller.js";
import {
  createAgencySchema,
  updateAgencySchema,
  assignAgencySchema,
  updateAssignmentSchema
} from "./agencies.validation.js";

const router = express.Router();

router.use(authMiddleware);

router
  .route("/")
  .get(getAllAgencies)
  .post(validate(createAgencySchema), createAgency);

router
  .route("/assignments")
  .get(getAllAssignments)
  .post(validate(assignAgencySchema), assignAgency);

router
  .route("/assignments/:id")
  .patch(validate(updateAssignmentSchema), updateAssignment)
  .delete(deleteAssignment);

router.route("/event/:eventId/assignments").get(getEventAssignments);

router
  .route("/:id")
  .get(getAgency)
  .patch(validate(updateAgencySchema), updateAgency)
  .delete(deleteAgency);

export default router;
