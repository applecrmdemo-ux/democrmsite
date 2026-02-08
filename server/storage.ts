/**
 * MongoDB storage layer using Mongoose.
 * All ids are string (MongoDB ObjectId).
 */
import mongoose from "mongoose";
import { Customer as CustomerModel, Product, Repair, Appointment, Order, Lead } from "./models";
import { toApiDoc } from "@shared/schema";
import type {
  Customer,
  InsertCustomer,
  Product as ProductType,
  InsertProduct,
  Repair as RepairType,
  InsertRepair,
  Appointment as AppointmentType,
  InsertAppointment,
  Order as OrderType,
  Lead as LeadType,
  InsertLead,
  CreateOrderRequest,
  DashboardStats,
} from "@shared/schema";

function idToObjectId(id: string | number): mongoose.Types.ObjectId | null {
  if (id == null) return null;
  if (typeof id === "number") return null;
  if (mongoose.Types.ObjectId.isValid(id)) return new mongoose.Types.ObjectId(id);
  return null;
}

export const storage = {
  async getCustomers(search?: string): Promise<Customer[]> {
    const filter: Record<string, unknown> = {};
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [
        { name: re },
        { email: re },
        { phone: re },
      ];
    }
    const list = await CustomerModel.find(filter).sort({ createdAt: -1 }).lean();
    return list.map((d: any) => toApiDoc({ ...d, _id: d._id }));
  },

  async getCustomer(id: string): Promise<Customer | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await CustomerModel.findById(id).lean();
    if (!doc) return undefined;
    return toApiDoc({ ...doc, _id: doc._id }) as Customer;
  },

  async createCustomer(data: InsertCustomer): Promise<Customer> {
    const payload: Record<string, unknown> = { ...data };
    if ((data as any).warrantyExpiry) {
      payload.warrantyExpiry = new Date((data as any).warrantyExpiry);
    }
    const doc = await CustomerModel.create(payload);
    return toApiDoc(doc) as Customer;
  },

  async updateCustomer(id: string, data: Partial<InsertCustomer>): Promise<Customer | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const payload = { ...data } as any;
    if (payload.warrantyExpiry !== undefined) payload.warrantyExpiry = new Date(payload.warrantyExpiry);
    const doc = await CustomerModel.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean();
    if (!doc) return undefined;
    return toApiDoc({ ...doc, _id: doc._id }) as Customer;
  },

  async deleteCustomer(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) await CustomerModel.findByIdAndDelete(id);
  },

  async getProducts(search?: string, lowStock?: boolean): Promise<ProductType[]> {
    const filter: Record<string, unknown> = {};
    if (search && search.trim()) {
      filter.name = new RegExp(search.trim(), "i");
    }
    if (lowStock) filter.stock = { $lt: 5 };
    const list = await Product.find(filter).sort({ name: 1 }).lean();
    return list.map((d: any) => toApiDoc({ ...d, _id: d._id }));
  },

  async getProduct(id: string): Promise<ProductType | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await Product.findById(id).lean();
    if (!doc) return undefined;
    return toApiDoc({ ...doc, _id: doc._id }) as ProductType;
  },

  async createProduct(data: InsertProduct): Promise<ProductType> {
    const doc = await Product.create(data);
    return toApiDoc(doc) as ProductType;
  },

  async updateProduct(id: string, data: Partial<InsertProduct>): Promise<ProductType | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await Product.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return undefined;
    return toApiDoc({ ...doc, _id: doc._id }) as ProductType;
  },

  async deleteProduct(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) await Product.findByIdAndDelete(id);
  },

  async getRepairs(search?: string, status?: string): Promise<RepairType[]> {
    const filter: Record<string, unknown> = {};
    if (search && search.trim()) {
      const re = new RegExp(search.trim(), "i");
      filter.$or = [{ deviceName: re }, { serialNumber: re }];
    }
    if (status) filter.status = status;
    const list = await Repair.find(filter).sort({ createdAt: -1 }).lean();
    return list.map((d: any) => ({
      ...toApiDoc({ ...d, _id: d._id }),
      customerId: d.customerId ? String(d.customerId) : null,
    }));
  },

  async getRepair(id: string): Promise<RepairType | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await Repair.findById(id).lean();
    if (!doc) return undefined;
    return { ...toApiDoc({ ...doc, _id: doc._id }), customerId: doc.customerId ? String(doc.customerId) : null } as RepairType;
  },

  async createRepair(data: InsertRepair): Promise<RepairType> {
    const payload: any = { ...data };
    payload.customerId = data.customerId != null ? idToObjectId(String(data.customerId)) : undefined;
    const doc = await Repair.create(payload);
    return { ...toApiDoc(doc), customerId: doc.customerId ? String(doc.customerId) : null } as RepairType;
  },

  async updateRepair(id: string, data: Partial<InsertRepair>): Promise<RepairType | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const payload: any = { ...data };
    if (data.customerId !== undefined) payload.customerId = data.customerId != null ? idToObjectId(String(data.customerId)) : null;
    const doc = await Repair.findByIdAndUpdate(id, { $set: payload }, { new: true }).lean();
    if (!doc) return undefined;
    return { ...toApiDoc({ ...doc, _id: doc._id }), customerId: doc.customerId ? String(doc.customerId) : null } as RepairType;
  },

  async deleteRepair(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) await Repair.findByIdAndDelete(id);
  },

  async getAppointments(): Promise<AppointmentType[]> {
    const list = await Appointment.find({}).sort({ date: 1 }).lean();
    return list.map((d: any) => ({ ...toApiDoc({ ...d, _id: d._id }), date: d.date ? new Date(d.date).toISOString() : (d as any).date }));
  },

  async createAppointment(data: InsertAppointment): Promise<AppointmentType> {
    const payload = { ...data, date: new Date(data.date as any) };
    const doc = await Appointment.create(payload);
    const out = toApiDoc(doc) as any;
    out.date = doc.date ? new Date(doc.date).toISOString() : undefined;
    return out;
  },

  async deleteAppointment(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) await Appointment.findByIdAndDelete(id);
  },

  async getOrders(): Promise<OrderType[]> {
    const list = await Order.find({}).sort({ createdAt: -1 }).lean();
    return list.map((d: any) => ({
      ...toApiDoc({ ...d, _id: d._id }),
      customerId: String(d.customerId),
      items: (d.items || []).map((i: any) => ({ productId: String(i.productId), quantity: i.quantity })),
    }));
  },

  async getOrderInvoice(id: string): Promise<OrderType & { customer?: Customer; items?: Array<{ productId: string; quantity: number; product?: ProductType }> } | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await Order.findById(id).populate("customerId").populate("items.productId").lean();
    if (!doc) return undefined;
    const order: any = {
      ...toApiDoc({ ...doc, _id: doc._id }),
      customerId: String(doc.customerId),
      items: (doc.items || []).map((i: any) => ({
        productId: String(i.productId?._id || i.productId),
        quantity: i.quantity,
        product: i.productId && typeof i.productId === "object" ? toApiDoc(i.productId) : undefined,
      })),
    };
    if (doc.customerId && typeof doc.customerId === "object") order.customer = toApiDoc(doc.customerId);
    return order;
  },

  async createOrder(req: CreateOrderRequest): Promise<OrderType> {
    const customerId = idToObjectId(String(req.customerId));
    if (!customerId) throw new Error("Invalid customer");
    let total = 0;
    const items: Array<{ productId: mongoose.Types.ObjectId; quantity: number }> = [];
    for (const item of req.items) {
      const pid = idToObjectId(String(item.productId));
      if (!pid) throw new Error(`Product ${item.productId} not found`);
      const product = await Product.findById(pid).lean();
      if (!product) throw new Error(`Product ${item.productId} not found`);
      if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.name}`);
      total += product.price * item.quantity;
      items.push({ productId: pid, quantity: item.quantity });
    }
    for (const item of items) {
      await Product.findByIdAndUpdate(item.productId, { $inc: { stock: -item.quantity } });
    }
    const doc = await Order.create({ customerId, total, paymentStatus: req.paymentStatus || "Pending", items });
    return {
      ...toApiDoc(doc),
      customerId: String(doc.customerId),
      items: doc.items.map((i: any) => ({ productId: String(i.productId), quantity: i.quantity })),
    } as OrderType;
  },

  async getLeads(): Promise<LeadType[]> {
    const list = await Lead.find({}).sort({ createdAt: -1 }).lean();
    return list.map((d: any) => toApiDoc({ ...d, _id: d._id }));
  },

  async getLead(id: string): Promise<LeadType | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await Lead.findById(id).lean();
    if (!doc) return undefined;
    return toApiDoc({ ...doc, _id: doc._id }) as LeadType;
  },

  async createLead(data: InsertLead): Promise<LeadType> {
    const doc = await Lead.create(data);
    return toApiDoc(doc) as LeadType;
  },

  async updateLead(id: string, data: Partial<InsertLead>): Promise<LeadType | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) return undefined;
    const doc = await Lead.findByIdAndUpdate(id, { $set: data }, { new: true }).lean();
    if (!doc) return undefined;
    return toApiDoc({ ...doc, _id: doc._id }) as LeadType;
  },

  async deleteLead(id: string): Promise<void> {
    if (mongoose.Types.ObjectId.isValid(id)) await Lead.findByIdAndDelete(id);
  },

  async convertLead(id: string): Promise<{ customerId: string }> {
    const lead = await Lead.findById(id).lean();
    if (!lead) throw new Error("Lead not found");
    const customer = await CustomerModel.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      notes: `Converted from lead. Interest: ${lead.interest || ""}`,
      segment: "New",
    });
    await Lead.findByIdAndUpdate(id, { $set: { status: "Converted" } });
    return { customerId: String(customer._id) };
  },

  async getDashboardStats(): Promise<DashboardStats> {
    const [totalCustomers, totalProducts, lowStockProducts, activeRepairs, newLeads, orders, ordersThisMonth] = await Promise.all([
      CustomerModel.countDocuments(),
      Product.countDocuments(),
      Product.countDocuments({ stock: { $lt: 5 } }),
      Repair.countDocuments({ status: { $in: ["Received", "Diagnosing", "In Repair"] } }),
      Lead.countDocuments({ status: "New" }),
      Order.find({}).lean(),
      Order.find({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }).lean(),
    ]);
    const totalRevenue = orders.reduce((s: number, o: any) => s + (o.total || 0), 0);
    const monthlyRevenue = ordersThisMonth.reduce((s: number, o: any) => s + (o.total || 0), 0);
    return {
      totalCustomers,
      totalProducts,
      lowStockProducts,
      activeRepairs,
      totalRevenue,
      monthlyRevenue,
      newLeads,
    };
  },
};
