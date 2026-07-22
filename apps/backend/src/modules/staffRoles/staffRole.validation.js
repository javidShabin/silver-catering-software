import { z } from "zod";

export const createStaffRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    defaultRate: z.number().min(0, "Default rate cannot be negative").default(0),
  }),
});

export const updateStaffRoleSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required").optional(),
    defaultRate: z.number().min(0, "Default rate cannot be negative").optional(),
  }),
});
