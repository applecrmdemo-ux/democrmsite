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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category"),
  price: integer("price").notNull(), // stored in cents
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const repairs = pgTable("repairs", {
  id: serial("id").primaryKey(),
  deviceName: text("device_name").notNull(),
  serialNumber: text("serial_number"),
  issueDescription: text("issue_description").default(''),
  status: text("status").notNull().default('Pending'), // Pending, In Progress, Completed
  technicianNotes: text("technician_notes").default(''),
  amount: integer("amount").default(0), // stored in cents
  customerId: integer("customer_id").references(() => customers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(), // Keeping as string to match legacy schema, though linking to customer would be better
  date: timestamp("date").notNull(),
  time: text("time").notNull(),
  purpose: text("purpose").default(''),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  total: integer("total").notNull(), // stored in cents
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id).notNull(),
  productId: integer("product_id").references(() => products.id).notNull(),
  quantity: integer("quantity").notNull(),
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

// === API CONTRACT TYPES ===

// Create Order Request (Complex)
export const createOrderRequestSchema = z.object({
  customerId: z.number(),
  items: z.array(z.object({
    productId: z.number(),
    quantity: z.number().min(1)
  }))
});
export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

// Responses with Relations
export type OrderWithDetails = Order & {
  customer: Customer;
  items: (OrderItem & { product: Product })[];
};

export type RepairWithCustomer = Repair & {
  customer: Customer | null;
};

// Dashboard Stats
export type DashboardStats = {
  totalCustomers: number;
  totalProducts: number;
  lowStockProducts: number;
  activeRepairs: number;
  totalRevenue: number;
  monthlyRevenue: number;
};
