import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: String,
    email: String,
    notes: { type: String, default: "" },
    segment: { type: String, default: "New" }, // New, Repeat, VIP
    warrantyExpiry: Date,
    reminderFlag: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Customer = mongoose.model("Customer", schema);
