import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

const DEMO_USERS: Record<string, { password: string; role: string }> = {
  admin: { password: "password", role: "Admin" },
  salesman: { password: "password", role: "Sales" },
  tech: { password: "password", role: "Technician" },
  manager: { password: "password", role: "Manager" },
  customer: { password: "password", role: "Customer" },
};

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  // Auth (demo only, no JWT)
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const { username, password } = api.auth.login.input.parse(req.body);
      const user = DEMO_USERS[username];
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const payload: { username: string; role: string; customerId?: string } = { username, role: user.role };
      // For Customer role, attach first customer id for demo (own-data filtering)
      if (user.role === "Customer") {
        const customers = await storage.getCustomers();
        if (customers.length > 0) payload.customerId = customers[0].id;
      }
      return res.json({ user: payload });
    } catch {
      return res.status(401).json({ message: "Invalid credentials" });
    }
  });

  const idParam = (v: string) => v;

  // Customers
  app.get(api.customers.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const customers = await storage.getCustomers(search);
    res.json(customers);
  });
  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(idParam(req.params.id));
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  });
  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.put(api.customers.update.path, async (req, res) => {
    try {
      const input = api.customers.update.input.parse(req.body);
      const customer = await storage.updateCustomer(idParam(req.params.id), input);
      if (!customer) return res.status(404).json({ message: "Customer not found" });
      res.json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.delete(api.customers.delete.path, async (req, res) => {
    await storage.deleteCustomer(idParam(req.params.id));
    res.status(204).end();
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const lowStock = req.query.lowStock === "true";
    const products = await storage.getProducts(search, lowStock);
    res.json(products);
  });
  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(idParam(req.params.id));
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  });
  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.put(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(idParam(req.params.id), input);
      if (!product) return res.status(404).json({ message: "Product not found" });
      res.json(product);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(idParam(req.params.id));
    res.status(204).end();
  });

  // Repairs
  app.get(api.repairs.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const repairs = await storage.getRepairs(search, status);
    res.json(repairs);
  });
  app.get(api.repairs.get.path, async (req, res) => {
    const repair = await storage.getRepair(idParam(req.params.id));
    if (!repair) return res.status(404).json({ message: "Repair not found" });
    res.json(repair);
  });
  app.post(api.repairs.create.path, async (req, res) => {
    try {
      const input = api.repairs.create.input.parse(req.body);
      const repair = await storage.createRepair(input);
      res.status(201).json(repair);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.put(api.repairs.update.path, async (req, res) => {
    try {
      const input = api.repairs.update.input.parse(req.body);
      const repair = await storage.updateRepair(idParam(req.params.id), input);
      if (!repair) return res.status(404).json({ message: "Repair not found" });
      res.json(repair);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.delete(api.repairs.delete.path, async (req, res) => {
    await storage.deleteRepair(idParam(req.params.id));
    res.status(204).end();
  });

  // Leads
  app.get(api.leads.list.path, async (_req, res) => {
    const leads = await storage.getLeads();
    res.json(leads);
  });
  app.get(api.leads.get.path, async (req, res) => {
    const lead = await storage.getLead(idParam(req.params.id));
    if (!lead) return res.status(404).json({ message: "Lead not found" });
    res.json(lead);
  });
  app.post(api.leads.create.path, async (req, res) => {
    try {
      const input = api.leads.create.input.parse(req.body);
      const lead = await storage.createLead(input);
      res.status(201).json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.put(api.leads.update.path, async (req, res) => {
    try {
      const input = api.leads.update.input.parse(req.body);
      const lead = await storage.updateLead(idParam(req.params.id), input);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      res.json(lead);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.post(api.leads.convert.path, async (req, res) => {
    try {
      const result = await storage.convertLead(idParam(req.params.id));
      res.json(result);
    } catch (e) {
      return res.status(400).json({ message: e instanceof Error ? e.message : "Failed to convert" });
    }
  });

  // Appointments
  app.get(api.appointments.list.path, async (_req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });
  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      throw err;
    }
  });
  app.delete(api.appointments.delete.path, async (req, res) => {
    await storage.deleteAppointment(idParam(req.params.id));
    res.status(204).end();
  });

  // Orders
  app.get(api.orders.list.path, async (_req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });
  app.get(api.orders.getInvoice.path, async (req, res) => {
    const invoice = await storage.getOrderInvoice(idParam(req.params.id));
    if (!invoice) return res.status(404).json({ message: "Order not found" });
    res.json(invoice);
  });
  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ message: err.errors[0].message });
      if (err instanceof Error) return res.status(400).json({ message: err.message });
      throw err;
    }
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (_req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  await seedDatabase();
  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getCustomers();
  if (existing.length > 0) return;
  console.log("Seeding database...");
  const c1 = await storage.createCustomer({ name: "John Doe", email: "john@example.com", phone: "555-0101", notes: "VIP Client", segment: "VIP" });
  const c2 = await storage.createCustomer({ name: "Jane Smith", email: "jane@example.com", phone: "555-0102", notes: "Regular", segment: "Repeat" });
  const p1 = await storage.createProduct({ name: "iPhone 15 Pro Case", category: "Accessories", price: 4999, stock: 50 });
  const p2 = await storage.createProduct({ name: "Screen Protector", category: "Accessories", price: 1999, stock: 100 });
  const p3 = await storage.createProduct({ name: "Charging Cable", category: "Cables", price: 2999, stock: 4 });
  const r1 = await storage.createRepair({
    deviceName: "MacBook Pro M1",
    serialNumber: "C02XXXXX",
    issueDescription: "Screen flickering",
    status: "In Repair",
    technicianNotes: "Diagnostic running",
    technicianId: "tech",
    customerId: c1.id,
    amount: 0,
  });
  await storage.createAppointment({
    customerName: "Alice Wonderland",
    date: new Date(Date.now() + 86400000),
    time: "14:00",
    purpose: "Consultation",
  });
  await storage.createOrder({
    customerId: c2.id,
    items: [
      { productId: p1.id, quantity: 1 },
      { productId: p2.id, quantity: 2 },
    ],
  });
  console.log("Database seeded!");
}
