import { z } from "zod";

export const createAgencySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Agency name is required"),
    phone: z.string().optional().nullable(),
    serviceType: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    isActive: z.boolean().default(true)
  }),
  query: z.any().optional(),
  params: z.any().optional()
});

export const updateAgencySchema = z.object({
  body: z.object({
    name: z.string().min(1, "Agency name is required").optional(),
    phone: z.string().optional().nullable(),
    serviceType: z.string().optional().nullable(),
    address: z.string().optional().nullable(),
    isActive: z.boolean().optional()
  }),
  query: z.any().optional(),
  params: z.any().optional()
});

export const assignAgencySchema = z.object({
  body: z.object({
    agencyId: z.string().uuid("Invalid agency ID"),
    eventId: z.string().uuid("Invalid event ID"),
    numberOfStaff: z.number().int().min(0).optional().default(0),
    rentalItems: z.array(z.object({
      name: z.string(),
      quantity: z.number().min(1)
    })).optional().default([]),
    numberOfDays: z.number().int().min(1).default(1),
    totalAmount: z.number().min(0),
    advancePaid: z.number().min(0).default(0),
    status: z.enum(["pending", "active", "completed", "paid", "cancelled"]).default("pending"),
    notes: z.string().optional().nullable()
  }),
  query: z.any().optional(),
  params: z.any().optional()
});

export const updateAssignmentSchema = z.object({
  body: z.object({
    numberOfStaff: z.number().int().min(0).optional(),
    rentalItems: z.array(z.object({
      name: z.string(),
      quantity: z.number().min(1)
    })).optional(),
    numberOfDays: z.number().int().min(1).optional(),
    totalAmount: z.number().min(0).optional(),
    advancePaid: z.number().min(0).optional(),
    status: z.enum(["pending", "active", "completed", "paid", "cancelled"]).optional(),
    notes: z.string().optional().nullable()
  }),
  query: z.any().optional(),
  params: z.any().optional()
});
