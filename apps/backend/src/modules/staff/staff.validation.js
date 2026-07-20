import { z } from "zod";

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name is required").max(100),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    status: z.string().optional(),
    permissions: z.array(z.string()).optional()})});

export const updateStaffSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.string().optional(),
    phone: z.string().optional(),
    department: z.string().optional(),
    status: z.string().optional(),
    permissions: z.array(z.string()).optional()}),
  params: z.object({
    id: z.string().min(5, "Invalid staff ID format").or(z.string())})});
