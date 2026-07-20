import { z } from "zod";

export const createInvoiceSchema = z.object({
  body: z.object({
    eventId: z.string().min(5, "Invalid event ID format").or(z.string()),
    customerId: z.string().min(5, "Invalid customer ID format").or(z.string()),
    subtotal: z.union([z.number(), z.string()]),
    tax: z.union([z.number(), z.string()]).optional(),
    taxRate: z.union([z.number(), z.string()]).optional(),
    discountAmount: z.union([z.number(), z.string()]).optional(),
    totalAmount: z.union([z.number(), z.string()]),
    advancePaid: z.union([z.number(), z.string()]).optional(),
    balanceAmount: z.union([z.number(), z.string()]),
    status: z.string().optional(),
    dueDate: z.string().datetime().or(z.date()),
    notes: z.string().optional(),
    items: z.object({
      create: z.array(z.object({
        description: z.string(),
        quantity: z.union([z.number(), z.string()]),
        unitPrice: z.union([z.number(), z.string()]),
        total: z.union([z.number(), z.string()])}))
    }).optional()
  })});

export const updateInvoiceStatusSchema = z.object({
  body: z.object({
    status: z.enum(["draft", "sent", "partially-paid", "paid", "cancelled", "overdue"])}),
  params: z.object({
    id: z.string().min(5, "Invalid invoice ID format").or(z.string())})});

export const recordPaymentSchema = z.object({
  body: z.object({
    amount: z.union([
      z.number().gt(0, "Payment amount must be greater than 0"),
      z.string().refine(
        (val) => {
          const num = parseFloat(val);
          return !isNaN(num) && num > 0;
        },
        { message: "Payment amount must be a positive number" }
      )
    ]),
    method: z.string(),
    reference: z.string().optional()}),
  params: z.object({
    id: z.string().min(5, "Invalid invoice ID format").or(z.string())})});

export const applyDiscountSchema = z.object({
  body: z.object({
    discountType: z.enum(["fixed", "percentage"]),
    discountValue: z.union([z.number(), z.string()])}),
  params: z.object({
    id: z.string().min(5, "Invalid invoice ID format").or(z.string())})});
