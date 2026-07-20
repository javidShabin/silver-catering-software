import { z } from "zod";

export const createMenuSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    description: z.string().optional(),
    category: z.string().min(1, "Category is required"),
    minPrice: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 0, { message: "Min Price cannot be negative" }),
    maxPrice: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 0, { message: "Max Price cannot be negative" }),
    isAvailable: z.boolean().optional(),
    dietaryTags: z.array(z.string()).optional(),
    recipeIngredients: z.array(z.any()).optional()})});

export const updateMenuSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().optional(),
    category: z.string().min(1).optional(),
    minPrice: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 0, { message: "Min Price cannot be negative" }).optional(),
    maxPrice: z.union([z.number(), z.string()]).transform(val => Number(val)).refine(val => val >= 0, { message: "Max Price cannot be negative" }).optional(),
    isAvailable: z.boolean().optional(),
    dietaryTags: z.array(z.string()).optional(),
    recipeIngredients: z.array(z.any()).optional()}),
  params: z.object({
    id: z.string().uuid("Invalid menu ID format").or(z.string())})});

