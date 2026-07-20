import express from "express";
import * as expenseController from "./expense.controller.js";
import authMiddleware, { restrictTo } from "../../middleware/auth.middleware.js";
import validate from "../../middleware/validate.middleware.js";
import { createExpenseSchema, updateExpenseSchema } from "./expense.validation.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", expenseController.getAllExpenses);
router.get("/:id", expenseController.getExpense);
router.post("/", restrictTo("admin", "manager", "accountant"), validate(createExpenseSchema), expenseController.createExpense);
router.patch("/:id", restrictTo("admin", "manager", "accountant"), validate(updateExpenseSchema), expenseController.updateExpense);
router.delete("/:id", restrictTo("admin", "manager", "accountant"), expenseController.deleteExpense);

export default router;
