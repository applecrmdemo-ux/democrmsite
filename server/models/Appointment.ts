import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    customerName: { type: String, required: true },
    date: { type: Date, required: true },
    time: { type: String, required: true },
    purpose: { type: String, default: "" },
    staffId: String,
  },
  { timestamps: true }
);

export const Appointment = mongoose.model("Appointment", schema);
