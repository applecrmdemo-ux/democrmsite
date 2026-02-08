import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: String,
    price: { type: Number, required: true }, // cents
    stock: { type: Number, required: true, default: 0 },
    supplier: String,
  },
  { timestamps: true }
);

export const Product = mongoose.model("Product", schema);
