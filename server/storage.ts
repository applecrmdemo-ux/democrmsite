import { db } from "./db";
import { 
  customers, products, repairs, appointments, orders, orderItems,
  type Customer, type InsertCustomer,
  type Product, type InsertProduct,
  type Repair, type InsertRepair,
  type Appointment, type InsertAppointment,
  type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem,
  type CreateOrderRequest,
  type DashboardStats
} from "@shared/schema";
import { eq, like, desc, sql, and, gte, lt } from "drizzle-orm";

export interface IStorage {
  // Customers
  getCustomers(search?: string): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  updateCustomer(id: number, customer: Partial<InsertCustomer>): Promise<Customer | undefined>;
  deleteCustomer(id: number): Promise<void>;

  // Products
  getProducts(search?: string, lowStock?: boolean): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  // Repairs
  getRepairs(search?: string, status?: string): Promise<Repair[]>;
  getRepair(id: number): Promise<Repair | undefined>;
  createRepair(repair: InsertRepair): Promise<Repair>;
  updateRepair(id: number, repair: Partial<InsertRepair>): Promise<Repair | undefined>;
  deleteRepair(id: number): Promise<void>;

  // Appointments
  getAppointments(): Promise<Appointment[]>;
  createAppointment(appointment: InsertAppointment): Promise<Appointment>;
  deleteAppointment(id: number): Promise<void>;

  // Orders
  getOrders(): Promise<Order[]>;
  createOrder(orderRequest: CreateOrderRequest): Promise<Order>;

  // Dashboard
  getDashboardStats(): Promise<DashboardStats>;
}

export class DatabaseStorage implements IStorage {
  // Customers
  async getCustomers(search?: string): Promise<Customer[]> {
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      return await db.select().from(customers)
        .where(
          sql`lower(${customers.name}) LIKE ${searchLower} OR lower(${customers.email}) LIKE ${searchLower}`
        );
    }
    return await db.select().from(customers).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [updated] = await db.update(customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  async deleteCustomer(id: number): Promise<void> {
    await db.delete(customers).where(eq(customers.id, id));
  }

  // Products
  async getProducts(search?: string, lowStock?: boolean): Promise<Product[]> {
    let query = db.select().from(products);
    
    const conditions = [];
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(sql`lower(${products.name}) LIKE ${searchLower}`);
    }
    if (lowStock) {
      conditions.push(lt(products.stock, 5));
    }

    if (conditions.length > 0) {
      // @ts-ignore - weird drizzle typing with dynamic where
      return await query.where(and(...conditions)).orderBy(products.name);
    }
    
    return await query.orderBy(products.name);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [updated] = await db.update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  // Repairs
  async getRepairs(search?: string, status?: string): Promise<Repair[]> {
    let query = db.select().from(repairs);
    
    const conditions = [];
    if (search) {
      const searchLower = `%${search.toLowerCase()}%`;
      conditions.push(sql`lower(${repairs.deviceName}) LIKE ${searchLower} OR lower(${repairs.serialNumber}) LIKE ${searchLower}`);
    }
    if (status) {
      conditions.push(eq(repairs.status, status));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      return await query.where(and(...conditions)).orderBy(desc(repairs.createdAt));
    }
    
    return await query.orderBy(desc(repairs.createdAt));
  }

  async getRepair(id: number): Promise<Repair | undefined> {
    const [repair] = await db.select().from(repairs).where(eq(repairs.id, id));
    return repair;
  }

  async createRepair(repair: InsertRepair): Promise<Repair> {
    const [newRepair] = await db.insert(repairs).values(repair).returning();
    return newRepair;
  }

  async updateRepair(id: number, updates: Partial<InsertRepair>): Promise<Repair | undefined> {
    const [updated] = await db.update(repairs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(repairs.id, id))
      .returning();
    return updated;
  }

  async deleteRepair(id: number): Promise<void> {
    await db.delete(repairs).where(eq(repairs.id, id));
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return await db.select().from(appointments).orderBy(appointments.date);
  }

  async createAppointment(appointment: InsertAppointment): Promise<Appointment> {
    const [newAppointment] = await db.insert(appointments).values(appointment).returning();
    return newAppointment;
  }

  async deleteAppointment(id: number): Promise<void> {
    await db.delete(appointments).where(eq(appointments.id, id));
  }

  // Orders
  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async createOrder(orderRequest: CreateOrderRequest): Promise<Order> {
    // Transaction-like logic (though not strict transaction for simplicity in this demo unless needed)
    // 1. Calculate total and verify stock
    let total = 0;
    
    // We need to fetch products to get prices and check stock
    for (const item of orderRequest.items) {
      const product = await this.getProduct(item.productId);
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      
      total += product.price * item.quantity;
    }

    // 2. Reduce stock
    for (const item of orderRequest.items) {
      const product = await this.getProduct(item.productId);
      if (product) {
        await this.updateProduct(product.id, { stock: product.stock - item.quantity });
      }
    }

    // 3. Create Order
    const [order] = await db.insert(orders).values({
      customerId: orderRequest.customerId,
      total: total
    }).returning();

    // 4. Create Order Items
    for (const item of orderRequest.items) {
      await db.insert(orderItems).values({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity
      });
    }

    return order;
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    const [customerCount] = await db.select({ count: sql<number>`count(*)` }).from(customers);
    const [productCount] = await db.select({ count: sql<number>`count(*)` }).from(products);
    const [lowStockCount] = await db.select({ count: sql<number>`count(*)` }).from(products).where(lt(products.stock, 5));
    const [activeRepairCount] = await db.select({ count: sql<number>`count(*)` }).from(repairs).where(eq(repairs.status, 'In Progress'));
    
    // Revenue logic
    const [totalRevenueResult] = await db.select({ sum: sql<number>`sum(${orders.total})` }).from(orders);
    
    // Monthly revenue (simplified - just all time for now or mock if date filtering is complex in raw sql without helpers)
    // Let's filter by current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0,0,0,0);
    
    const [monthlyRevenueResult] = await db.select({ sum: sql<number>`sum(${orders.total})` }).from(orders).where(gte(orders.createdAt, startOfMonth));

    return {
      totalCustomers: Number(customerCount.count),
      totalProducts: Number(productCount.count),
      lowStockProducts: Number(lowStockCount.count),
      activeRepairs: Number(activeRepairCount.count),
      totalRevenue: Number(totalRevenueResult?.sum || 0),
      monthlyRevenue: Number(monthlyRevenueResult?.sum || 0)
    };
  }
}

export const storage = new DatabaseStorage();
