import { z } from "zod";

export const createInventorySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").max(100),
    category: z.string().optional(),
    quantity: z.union([z.number(), z.string()]).optional(),
    unit: z.string().optional(),
    minStockLevel: z.union([z.number(), z.string()]).optional(),
    rentPerDay: z.union([z.number(), z.string()]).optional(),
    status: z.string().optional(),
    notes: z.string().optional(),
    expiryDate: z.string().datetime().optional().or(z.date().optional())})});

export const updateInventorySchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    category: z.string().optional(),
    quantity: z.union([z.number(), z.string()]).optional(),
    unit: z.string().optional(),
    minStockLevel: z.union([z.number(), z.string()]).optional(),
    rentPerDay: z.union([z.number(), z.string()]).optional(),
    status: z.string().optional(),
    notes: z.string().optional(),
    expiryDate: z.string().datetime().optional().or(z.date().optional())}),
  params: z.object({
    id: z.string().min(5, "Invalid inventory ID format").or(z.string())})});

export const updateStockSchema = z.object({
  body: z.object({
    quantity: z.union([z.number(), z.string()]),
    type: z.enum(["add", "subtract"]),
    reason: z.string().optional()}),
  params: z.object({
    id: z.string().min(5, "Invalid inventory ID format").or(z.string())})});
