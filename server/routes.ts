import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Customers
  app.get(api.customers.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const customers = await storage.getCustomers(search);
    res.json(customers);
  });

  app.get(api.customers.get.path, async (req, res) => {
    const customer = await storage.getCustomer(Number(req.params.id));
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  });

  app.post(api.customers.create.path, async (req, res) => {
    try {
      const input = api.customers.create.input.parse(req.body);
      const customer = await storage.createCustomer(input);
      res.status(201).json(customer);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.customers.update.path, async (req, res) => {
    try {
      const input = api.customers.update.input.parse(req.body);
      const customer = await storage.updateCustomer(Number(req.params.id), input);
      if (!customer) return res.status(404).json({ message: 'Customer not found' });
      res.json(customer);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.customers.delete.path, async (req, res) => {
    await storage.deleteCustomer(Number(req.params.id));
    res.status(204).end();
  });

  // Products
  app.get(api.products.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    const lowStock = req.query.lowStock === 'true';
    const products = await storage.getProducts(search, lowStock);
    res.json(products);
  });

  app.get(api.products.get.path, async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  });

  app.post(api.products.create.path, async (req, res) => {
    try {
      const input = api.products.create.input.parse(req.body);
      const product = await storage.createProduct(input);
      res.status(201).json(product);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.products.update.path, async (req, res) => {
    try {
      const input = api.products.update.input.parse(req.body);
      const product = await storage.updateProduct(Number(req.params.id), input);
      if (!product) return res.status(404).json({ message: 'Product not found' });
      res.json(product);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.products.delete.path, async (req, res) => {
    await storage.deleteProduct(Number(req.params.id));
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
    const repair = await storage.getRepair(Number(req.params.id));
    if (!repair) return res.status(404).json({ message: 'Repair not found' });
    res.json(repair);
  });

  app.post(api.repairs.create.path, async (req, res) => {
    try {
      const input = api.repairs.create.input.parse(req.body);
      const repair = await storage.createRepair(input);
      res.status(201).json(repair);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.repairs.update.path, async (req, res) => {
    try {
      const input = api.repairs.update.input.parse(req.body);
      const repair = await storage.updateRepair(Number(req.params.id), input);
      if (!repair) return res.status(404).json({ message: 'Repair not found' });
      res.json(repair);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.repairs.delete.path, async (req, res) => {
    await storage.deleteRepair(Number(req.params.id));
    res.status(204).end();
  });

  // Appointments
  app.get(api.appointments.list.path, async (req, res) => {
    const appointments = await storage.getAppointments();
    res.json(appointments);
  });

  app.post(api.appointments.create.path, async (req, res) => {
    try {
      const input = api.appointments.create.input.parse(req.body);
      const appointment = await storage.createAppointment(input);
      res.status(201).json(appointment);
    } catch (err) {
       if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.appointments.delete.path, async (req, res) => {
    await storage.deleteAppointment(Number(req.params.id));
    res.status(204).end();
  });

  // Orders
  app.get(api.orders.list.path, async (req, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  app.post(api.orders.create.path, async (req, res) => {
    try {
      const input = api.orders.create.input.parse(req.body);
      const order = await storage.createOrder(input);
      res.status(201).json(order);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      // Handle business logic errors (e.g. insufficient stock)
      if (err instanceof Error) {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  });

  // Dashboard
  app.get(api.dashboard.stats.path, async (req, res) => {
    const stats = await storage.getDashboardStats();
    res.json(stats);
  });

  // SEED DATA
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCustomers = await storage.getCustomers();
  if (existingCustomers.length > 0) return;

  console.log("Seeding database...");

  const c1 = await storage.createCustomer({
    name: "John Doe",
    email: "john@example.com",
    phone: "555-0101",
    notes: "VIP Client"
  });

  const c2 = await storage.createCustomer({
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-0102",
    notes: "Regular"
  });

  const p1 = await storage.createProduct({
    name: "iPhone 15 Pro Case",
    category: "Accessories",
    price: 4999, // $49.99
    stock: 50
  });

  const p2 = await storage.createProduct({
    name: "Screen Protector",
    category: "Accessories",
    price: 1999, // $19.99
    stock: 100
  });

  const p3 = await storage.createProduct({
    name: "Charging Cable",
    category: "Cables",
    price: 2999, // $29.99
    stock: 4 // Low stock
  });

  await storage.createRepair({
    deviceName: "MacBook Pro M1",
    serialNumber: "C02XXXXX",
    issueDescription: "Screen flickering",
    status: "In Progress",
    technicianNotes: "Diagnostic running",
    customerId: c1.id,
    amount: 0
  });

  await storage.createAppointment({
    customerName: "Alice Wonderland",
    date: new Date(Date.now() + 86400000), // tomorrow
    time: "14:00",
    purpose: "Consultation"
  });

  // Create an order
  await storage.createOrder({
    customerId: c2.id,
    items: [
      { productId: p1.id, quantity: 1 },
      { productId: p2.id, quantity: 2 }
    ]
  });

  console.log("Database seeded!");
}
