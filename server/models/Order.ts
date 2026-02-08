import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  quantity: { type: Number, required: true },
});

const schema = new mongoose.Schema(
  {
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    total: { type: Number, required: true }, // cents
    paymentStatus: { type: String, default: "Pending" }, // Pending, Paid
    items: [orderItemSchema],
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", schema);
