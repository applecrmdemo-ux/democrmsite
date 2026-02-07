import { pgTable, text, serial, integer, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===

export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  notes: text("notes").default(''),
  segment: text("segment").default('New'), // New, VIP, Regular
  warrantyInfo: text("warranty_info"),
  reminderFlag: boolean("reminder_flag").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  price: integer("price").notNull(), 
  stock: integer("stock").notNull().default(0),
  supplier: text("supplier"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  deviceName: text("device_name").notNull(),
  serialNumber: text("serial_number"),
  issueDescription: text("issue_description").default(''),
  status: text("status").notNull().default('Received'), // Received, Diagnosing, In Repair, Completed, Delivered
  technicianNotes: text("technician_notes").default(''),
  technicianId: text("technician_id"), // Simulated tech assignment
  amount: integer("amount").default(0),
  customerId: integer("customer_id").references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  purpose: text("purpose").default(''),
  staffId: text("staff_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  total: integer("total").notNull(),
  paymentStatus: text("payment_status").default('Pending'), // Pending, Paid
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  interest: text("interest"), // Product or Service
  status: text("status").default('New'), // New, Contacted, Converted, Lost
  callbackRequested: boolean("callback_requested").default(false),
  notes: text("notes").default(''),
  createdAt: timestamp("created_at").defaultNow(),
});

// === RELATIONS ===

export const customersRelations = relations(customers, ({ many }) => ({
  repairs: many(repairs),
  orders: many(orders),
}));

export const repairsRelations = relations(repairs, ({ one }) => ({
  customer: one(customers, {
    fields: [repairs.customerId],
    references: [customers.id],
  }),
}));

export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// === BASE SCHEMAS ===

export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true });
export const insertRepairSchema = createInsertSchema(repairs).omit({ id: true, createdAt: true, updatedAt: true });
export const insertAppointmentSchema = createInsertSchema(appointments).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });

// === TYPES ===

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Repair = typeof repairs.$inferSelect;
export type InsertRepair = z.infer<typeof insertRepairSchema>;

export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type Lead = typeof leads.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;

// === API CONTRACT TYPES ===

export const createOrderRequestSchema = z.object({
  customerId: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1)
  })),
  paymentStatus: z.string().optional()
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export type OrderWithDetails = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

export type RepairWithCustomer = Repair & {
  customer: Customer | null;
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
