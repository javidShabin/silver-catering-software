import { z } from "zod";

export const createPurchaseSchema = z.object({
  body: z.object({
    itemName: z.string().min(1),
    supplier: z.string().min(1),
    quantityPurchased: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val > 0, "Quantity must be positive"),
    unitCost: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 0, "Unit cost cannot be negative"),
    paymentStatus: z.enum(["pending", "partial", "paid"]).optional(),
    purchaseDate: z.string().optional(),
    notes: z.string().optional()})});

export const updatePurchaseSchema = z.object({
  body: z.object({
    itemName: z.string().min(1).optional(),
    supplier: z.string().min(1).optional(),
    quantityPurchased: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val > 0).optional(),
    unitCost: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 0).optional(),
    paymentStatus: z.enum(["pending", "partial", "paid"]).optional(),
    purchaseDate: z.string().optional(),
    notes: z.string().optional()}),
  params: z.object({
    id: z.string().min(1)})});
