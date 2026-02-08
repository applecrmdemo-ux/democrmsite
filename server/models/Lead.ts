import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    interest: String, // Product or Service
    status: { type: String, default: "New" }, // New, Contacted, Converted, Lost
    callbackRequested: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export const Lead = mongoose.model("Lead", schema);
