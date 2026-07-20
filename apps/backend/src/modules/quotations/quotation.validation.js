import { z } from "zod";
import { MAX_PAGE_SIZE, DEFAULT_PAGE_SIZE } from "../../utils/pagination.js";

// ─── Pagination query schema (shared by list endpoint) ───────────────────────

export const listQuotationsQuerySchema = z.object({
  query: z.object({
    limit: z
      .string()
      .optional()
      .transform((v) => (v ? parseInt(v, 10) : DEFAULT_PAGE_SIZE))
      .pipe(z.number().int().min(1).max(MAX_PAGE_SIZE)),
    cursor: z.string().optional(),
    direction: z.enum(["next", "prev"]).optional().default("next"),
    status: z.enum(["draft", "sent", "approved", "rejected"]).optional(),
    customerId: z.string().optional()})});

// ─── Body schemas ─────────────────────────────────────────────────────────────

export const createQuotationSchema = z.object({
  body: z.object({
    customerId: z.string(),
    validUntil: z.string().datetime(),
    guestCount: z.number().positive().optional(),
    durationInDays: z.number().positive().optional(),
    cateringBoysCount: z.number().nonnegative().optional(),
    cateringBoyRate: z.number().nonnegative().optional(),
    menuItems: z.array(z.string()).optional(),
    packageId: z.string().nullable().optional(),
    customMenuPrices: z.record(z.any()).optional(),
    customMenuSelections: z.record(z.object({
      type: z.enum(["PER_HEAD", "PER_UNIT"]),
      price: z.union([z.string(), z.number()]).optional(),
      quantity: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional(),
      packageId: z.string().optional(),
      packageName: z.string().optional(),
      packagePricePerHead: z.union([z.string(), z.number()]).optional()
    })).optional(),
    inventoryAllocations: z.array(z.any()).optional(),
    customItems: z.array(z.any()).optional(),
    subtotal: z.number().nonnegative(),
    taxPercent: z.number().nonnegative().optional(),
    tax: z.number().nonnegative(),
    discountAmount: z.number().nonnegative().default(0),
    totalAmount: z.number().nonnegative(),
    status: z.enum(["draft", "sent", "approved", "rejected"]).optional(),
    notes: z.string().optional()})});

export const updateQuotationSchema = z.object({
  params: z.object({
    id: z.string()}),
  body: z.object({
    customerId: z.string().optional(),
    validUntil: z.string().datetime().optional(),
    guestCount: z.number().positive().optional(),
    durationInDays: z.number().positive().optional(),
    cateringBoysCount: z.number().nonnegative().optional(),
    cateringBoyRate: z.number().nonnegative().optional(),
    menuItems: z.array(z.string()).optional(),
    packageId: z.string().nullable().optional(),
    customMenuPrices: z.record(z.any()).optional(),
    customMenuSelections: z.record(z.object({
      type: z.enum(["PER_HEAD", "PER_UNIT"]),
      price: z.union([z.string(), z.number()]).optional(),
      quantity: z.union([z.string(), z.number()]).optional(),
      unit: z.string().optional(),
      packageId: z.string().optional(),
      packageName: z.string().optional(),
      packagePricePerHead: z.union([z.string(), z.number()]).optional()
    })).optional(),
    inventoryAllocations: z.array(z.any()).optional(),
    customItems: z.array(z.any()).optional(),
    subtotal: z.number().nonnegative().optional(),
    taxPercent: z.number().nonnegative().optional(),
    tax: z.number().nonnegative().optional(),
    discountAmount: z.number().nonnegative().optional(),
    totalAmount: z.number().nonnegative().optional(),
    status: z.enum(["draft", "sent", "approved", "rejected"]).optional(),
    notes: z.string().optional()})});
