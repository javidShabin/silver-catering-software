import { z } from "zod";

export const dateRangeQuerySchema = z.object({
  query: z.object({
    startDate: z.string().datetime({ message: "Invalid startDate format" }).optional(),
    endDate: z.string().datetime({ message: "Invalid endDate format" }).optional()})});
