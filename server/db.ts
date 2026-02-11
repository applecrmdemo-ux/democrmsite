/**
 * MongoDB connection for CRM backend.
 * Requires MONGO_URI to be set in environment.
 */
import mongoose from "mongoose";

export async function connectDb(): Promise<void> {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    throw new Error("MONGO_URI is required");
  }

  try {
    await mongoose.connect(mongoUri);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    throw err;
  }
}

export { mongoose };
