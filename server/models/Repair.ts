import mongoose from "mongoose";

const schema = new mongoose.Schema(
  {
    deviceName: { type: String, required: true },
    serialNumber: String,
    imei: String,
    issueDescription: { type: String, default: "" },
    status: { type: String, default: "Received" }, // Received, Diagnosing, In Repair, Completed, Delivered
    technicianNotes: { type: String, default: "" },
    technicianId: String,
    amount: { type: Number, default: 0 }, // cents
    customerId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
    notesHistory: [{ content: String, createdAt: { type: Date, default: Date.now } }],
  },
  { timestamps: true }
);

export const Repair = mongoose.model("Repair", schema);
