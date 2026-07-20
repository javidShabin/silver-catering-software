import { z } from "zod";

export const createPackageSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Package name is required").max(100),
    description: z.string().optional(),
    pricePerHead: z.number().min(0, "Price per head cannot be negative"),
    minGuests: z.number().int().min(1, "Minimum guests must be at least 1").default(50),
    isActive: z.boolean().default(true),
    menuItemIds: z.array(z.string().uuid()).default([])})
});

export const updatePackageSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Package name is required").max(100).optional(),
    description: z.string().optional(),
    pricePerHead: z.number().min(0, "Price per head cannot be negative").optional(),
    minGuests: z.number().int().min(1, "Minimum guests must be at least 1").optional(),
    isActive: z.boolean().optional(),
    menuItemIds: z.array(z.string().uuid()).optional()})
});
