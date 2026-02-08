import { z } from 'zod';
import {
  insertCustomerSchema,
  insertProductSchema,
  insertRepairSchema,
  insertAppointmentSchema,
  insertLeadSchema,
  createOrderRequestSchema,
} from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

const customerResponse = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  segment: z.string().optional().nullable(),
  warrantyInfo: z.string().optional().nullable(),
  warrantyExpiry: z.string().optional().nullable(),
  reminderFlag: z.boolean().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
const productResponse = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional().nullable(),
  price: z.number(),
  stock: z.number(),
  supplier: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
const repairResponse = z.object({
  id: z.string(),
  deviceName: z.string(),
  serialNumber: z.string().optional().nullable(),
  imei: z.string().optional().nullable(),
  issueDescription: z.string().optional().nullable(),
  status: z.string(),
  technicianNotes: z.string().optional().nullable(),
  technicianId: z.string().optional().nullable(),
  amount: z.number().optional(),
  customerId: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
const appointmentResponse = z.object({
  id: z.string(),
  customerName: z.string(),
  date: z.string(),
  time: z.string(),
  purpose: z.string().optional().nullable(),
  staffId: z.string().optional().nullable(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
const orderResponse = z.object({
  id: z.string(),
  customerId: z.string(),
  total: z.number(),
  paymentStatus: z.string().optional().nullable(),
  items: z.array(z.object({ productId: z.string(), quantity: z.number() })).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});
const leadResponse = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  interest: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  callbackRequested: z.boolean().optional(),
  notes: z.string().optional().nullable(),
  createdAt: z.string().optional(),
});

export const api = {
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/auth/login' as const,
      input: z.object({ username: z.string(), password: z.string() }),
      responses: {
        200: z.object({ user: z.object({ username: z.string(), role: z.string() }) }),
        401: z.object({ message: z.string() }),
      },
    },
  },
  customers: {
    list: { method: 'GET' as const, path: '/api/customers' as const, input: z.object({ search: z.string().optional() }).optional(), responses: { 200: z.array(customerResponse) } },
    get: { method: 'GET' as const, path: '/api/customers/:id' as const, responses: { 200: customerResponse, 404: errorSchemas.notFound } },
    create: { method: 'POST' as const, path: '/api/customers' as const, input: insertCustomerSchema, responses: { 201: customerResponse, 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/customers/:id' as const, input: insertCustomerSchema.partial(), responses: { 200: customerResponse, 404: errorSchemas.notFound } },
    delete: { method: 'DELETE' as const, path: '/api/customers/:id' as const, responses: { 204: z.void(), 404: errorSchemas.notFound } },
  },
  products: {
    list: { method: 'GET' as const, path: '/api/products' as const, input: z.object({ search: z.string().optional(), lowStock: z.boolean().optional() }).optional(), responses: { 200: z.array(productResponse) } },
    get: { method: 'GET' as const, path: '/api/products/:id' as const, responses: { 200: productResponse, 404: errorSchemas.notFound } },
    create: { method: 'POST' as const, path: '/api/products' as const, input: insertProductSchema, responses: { 201: productResponse, 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/products/:id' as const, input: insertProductSchema.partial(), responses: { 200: productResponse, 404: errorSchemas.notFound } },
    delete: { method: 'DELETE' as const, path: '/api/products/:id' as const, responses: { 204: z.void(), 404: errorSchemas.notFound } },
  },
  repairs: {
    list: { method: 'GET' as const, path: '/api/repairs' as const, input: z.object({ status: z.string().optional(), search: z.string().optional() }).optional(), responses: { 200: z.array(repairResponse) } },
    get: { method: 'GET' as const, path: '/api/repairs/:id' as const, responses: { 200: repairResponse, 404: errorSchemas.notFound } },
    create: { method: 'POST' as const, path: '/api/repairs' as const, input: insertRepairSchema, responses: { 201: repairResponse, 400: errorSchemas.validation } },
    update: { method: 'PUT' as const, path: '/api/repairs/:id' as const, input: insertRepairSchema.partial(), responses: { 200: repairResponse, 404: errorSchemas.notFound } },
    delete: { method: 'DELETE' as const, path: '/api/repairs/:id' as const, responses: { 204: z.void(), 404: errorSchemas.notFound } },
  },
  leads: {
    list: { method: 'GET' as const, path: '/api/leads' as const, responses: { 200: z.array(leadResponse) } },
    create: { method: 'POST' as const, path: '/api/leads' as const, input: insertLeadSchema, responses: { 201: leadResponse, 400: errorSchemas.validation } },
    get: { method: 'GET' as const, path: '/api/leads/:id' as const, responses: { 200: leadResponse, 404: errorSchemas.notFound } },
    update: { method: 'PUT' as const, path: '/api/leads/:id' as const, input: insertLeadSchema.partial(), responses: { 200: leadResponse, 404: errorSchemas.notFound } },
    convert: { method: 'POST' as const, path: '/api/leads/:id/convert' as const, responses: { 200: z.object({ customerId: z.string() }) } },
  },
  appointments: {
    list: { method: 'GET' as const, path: '/api/appointments' as const, responses: { 200: z.array(appointmentResponse) } },
    create: { method: 'POST' as const, path: '/api/appointments' as const, input: insertAppointmentSchema, responses: { 201: appointmentResponse, 400: errorSchemas.validation } },
    delete: { method: 'DELETE' as const, path: '/api/appointments/:id' as const, responses: { 204: z.void(), 404: errorSchemas.notFound } },
  },
  orders: {
    list: { method: 'GET' as const, path: '/api/orders' as const, responses: { 200: z.array(orderResponse) } },
    create: { method: 'POST' as const, path: '/api/orders' as const, input: createOrderRequestSchema, responses: { 201: orderResponse, 400: errorSchemas.validation } },
    getInvoice: { method: 'GET' as const, path: '/api/orders/:id/invoice' as const, responses: { 200: z.any() } },
  },
  dashboard: {
    stats: {
      method: 'GET' as const,
      path: '/api/dashboard/stats' as const,
      responses: {
        200: z.object({
          totalCustomers: z.number(),
          totalProducts: z.number(),
          lowStockProducts: z.number(),
          activeRepairs: z.number(),
          totalRevenue: z.number(),
          monthlyRevenue: z.number(),
          newLeads: z.number(),
        }),
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) url = url.replace(`:${key}`, String(value));
    });
  }
  return url;
}
