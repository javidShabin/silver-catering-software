import { z } from "zod";

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3, "Title must be at least 3 characters").max(100),
    description: z.string().optional(),
    date: z.string().datetime({ message: "Invalid date format. Must be ISO string" }),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)"),
    location: z.string().min(5, "Location must be at least 5 characters"),
    guestCount: z.number().int().positive("Guest count must be at least 1"),
    status: z.enum(["pending", "confirmed", "in-progress", "completed", "cancelled"]).optional(),
    customer: z.string().min(5, "Invalid customer ID format"),
    assignedStaff: z.array(z.string().min(5, "Invalid staff ID format")).optional(),
    menuItems: z.array(z.string().min(5, "Invalid menu ID format")).optional(),
    inventoryItems: z.array(z.string().min(5)).optional(),
    inventoryAllocations: z.array(z.object({
      inventoryId: z.string().min(5),
      name: z.string().optional(),
      quantity: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional(),
      isDeducted: z.boolean().optional()
    })).optional(),
    notes: z.string().optional(),
    durationInDays: z.number().int().positive("Duration must be at least 1 day").optional(),
    cateringBoysCount: z.coerce.number().int().nonnegative().optional(),
    cateringBoyRate: z.coerce.number().nonnegative().optional(),
    staffAllocations: z.array(z.any()).optional(),
    eventFee: z.number().nonnegative("Event fee cannot be negative").optional(),
    advanceAmount: z.number().nonnegative("Advance amount cannot be negative").optional(),
    taxRate: z.coerce.number().nonnegative().max(100).optional(),
    discountValue: z.coerce.number().nonnegative().optional(),
    customMenuPrices: z.record(z.number()).optional(),
    customMenuSelections: z.record(z.object({
      type: z.enum(["PER_HEAD", "PER_UNIT"]),
      price: z.union([z.string(), z.number()]).optional(),
      quantity: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional()
    })).optional(),
    dutyRoster: z.array(z.object({
      staffId: z.string().min(5),
      days: z.array(z.number())
    })).optional(),
    extraBills: z.array(z.object({
      id: z.string(),
      description: z.string(),
      amount: z.number().nonnegative()
    })).optional()})});

export const updateEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(100).optional(),
    description: z.string().optional(),
    date: z.string().datetime().optional(),
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:MM)").optional(),
    location: z.string().min(5).optional(),
    guestCount: z.number().int().positive().optional(),
    status: z.enum(["pending", "confirmed", "in-progress", "completed", "cancelled"]).optional(),
    customer: z.string().min(5).optional(),
    assignedStaff: z.array(z.string().min(5)).optional(),
    menuItems: z.array(z.string().min(5)).optional(),
    inventoryItems: z.array(z.string().min(5)).optional(),
    inventoryAllocations: z.array(z.object({
      inventoryId: z.string().min(5),
      name: z.string().optional(),
      quantity: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional(),
      isDeducted: z.boolean().optional()
    })).optional(),
    notes: z.string().optional(),
    durationInDays: z.number().int().positive().optional(),
    cateringBoysCount: z.coerce.number().int().nonnegative().optional(),
    cateringBoyRate: z.coerce.number().nonnegative().optional(),
    staffAllocations: z.array(z.any()).optional(),
    eventFee: z.number().nonnegative().optional(),
    advanceAmount: z.number().nonnegative().optional(),
    taxRate: z.coerce.number().nonnegative().max(100).optional(),
    discountValue: z.coerce.number().nonnegative().optional(),
    customMenuPrices: z.record(z.number()).optional(),
    customMenuSelections: z.record(z.object({
      type: z.enum(["PER_HEAD", "PER_UNIT"]),
      price: z.union([z.string(), z.number()]).optional(),
      quantity: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional()
    })).optional(),
    dutyRoster: z.array(z.object({
      staffId: z.string().min(5),
      days: z.array(z.number())
    })).optional(),
    extraBills: z.array(z.object({
      id: z.string(),
      description: z.string(),
      amount: z.number().nonnegative()
    })).optional()}),
  params: z.object({
    id: z.string().min(5, "Invalid event ID format")})});
