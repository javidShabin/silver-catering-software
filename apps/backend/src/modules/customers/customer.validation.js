import { z } from "zod";

export const createCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email format").optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 characters"),
    address: z.string().optional(),
    notes: z.string().optional(),
    isFrequent: z.boolean().optional()})});

export const updateCustomerSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional().or(z.literal("")),
    phone: z.string().min(10, "Phone number must be at least 10 characters").optional(),
    address: z.string().optional(),
    notes: z.string().optional(),
    isFrequent: z.boolean().optional()}),
  params: z.object({
    id: z.string().min(5, "Invalid customer ID format")})});

