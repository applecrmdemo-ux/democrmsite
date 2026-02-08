/**
 * API types and Zod validation schemas (no Drizzle).
 * IDs are strings (MongoDB ObjectId).
 */
import { z } from "zod";

// Helper to serialize MongoDB doc to API shape (id as string)
export function toApiDoc(doc: Record<string, unknown> & { _id?: unknown }): Record<string, unknown> & { id: string } {
  if (!doc) return { id: "" } as any;
  const obj = typeof (doc as any).toObject === "function" ? (doc as any).toObject() : { ...doc };
  const { _id, createdAt, updatedAt, ...rest } = obj;
  const out: Record<string, unknown> = { ...rest, id: _id != null ? String(_id) : "" };
  if (createdAt != null) out.createdAt = new Date(createdAt as string).toISOString();
  if (updatedAt != null) out.updatedAt = new Date(updatedAt as string).toISOString();
  return out as any;
}

// === INSERT SCHEMAS (for API validation) ===

export const insertCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().optional(),
  notes: z.string().optional(),
  segment: z.enum(["New", "Repeat", "VIP"]).optional(),
  warrantyInfo: z.string().optional(),
  warrantyExpiry: z.union([z.string(), z.date()]).optional(),
  reminderFlag: z.boolean().optional(),
});
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export const insertProductSchema = z.object({
  name: z.string().min(1),
  category: z.string().optional(),
  price: z.number().int().min(0),
  stock: z.number().int().min(0),
  supplier: z.string().optional(),
});
export type InsertProduct = z.infer<typeof insertProductSchema>;

export const insertRepairSchema = z.object({
  deviceName: z.string().min(1),
  serialNumber: z.string().optional(),
  imei: z.string().optional(),
  issueDescription: z.string().optional(),
  status: z.string().optional(),
  technicianNotes: z.string().optional(),
  technicianId: z.string().optional(),
  amount: z.number().optional(),
  customerId: z.union([z.string(), z.number()]).optional().nullable(),
});
export type InsertRepair = z.infer<typeof insertRepairSchema>;

export const insertAppointmentSchema = z.object({
  customerName: z.string().min(1),
  date: z.union([z.string(), z.date()]),
  time: z.string().min(1),
  purpose: z.string().optional(),
  staffId: z.string().optional(),
});
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export const insertLeadSchema = z.object({
  name: z.string().min(1),
  email: z.string().optional(),
  phone: z.string().optional(),
  interest: z.string().optional(),
  status: z.string().optional(),
  callbackRequested: z.boolean().optional(),
  notes: z.string().optional(),
});
export type InsertLead = z.infer<typeof insertLeadSchema>;

// === API RESPONSE TYPES ===

export type Customer = InsertCustomer & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
};
export type Product = InsertProduct & { id: string; createdAt?: string; updatedAt?: string };
export type Repair = Omit<InsertRepair, "customerId"> & {
  id: string;
  customerId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};
export type Appointment = InsertAppointment & { id: string; createdAt?: string; updatedAt?: string };
export type Lead = InsertLead & { id: string; createdAt?: string };
export type OrderItem = { productId: string; quantity: number };
export type Order = {
  id: string;
  customerId: string;
  total: number;
  paymentStatus?: string;
  items?: Array<{ productId: string; quantity: number }>;
  createdAt?: string;
  updatedAt?: string;
};

export const createOrderRequestSchema = z.object({
  customerId: z.union([z.string(), z.number()]),
  items: z.array(
    z.object({
      productId: z.union([z.string(), z.number()]),
      quantity: z.number().int().min(1),
    })
  ),
  paymentStatus: z.string().optional(),
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export type OrderWithDetails = Order & {
  customer: Customer;
  items: Array<OrderItem & { product?: Product }>;
};

export type DashboardStats = {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  activeRepairs: number;
  totalRevenue: number;
  monthlyRevenue: number;
  newLeads: number;
};
