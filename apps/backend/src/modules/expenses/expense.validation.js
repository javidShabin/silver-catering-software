import { z } from "zod";

export const createExpenseSchema = z.object({
  body: z.object({
    category: z.enum(["wage", "fuel", "maintenance", "vendor", "other"]),
    amount: z.number().positive(),
    date: z.string().datetime().optional(),
    description: z.string().min(1),
    receiptUrl: z.string().url().optional(),
    eventId: z.string().min(5).optional()})});

export const updateExpenseSchema = z.object({
  body: z.object({
    category: z.enum(["wage", "fuel", "maintenance", "vendor", "other"]).optional(),
    amount: z.number().positive().optional(),
    date: z.string().datetime().optional(),
    description: z.string().min(1).optional(),
    receiptUrl: z.string().url().optional(),
    eventId: z.string().min(5).optional()})});
