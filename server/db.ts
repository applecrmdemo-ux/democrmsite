/**
 * MongoDB connection for CRM demo.
 * Uses MongoDB Atlas; overridable via MONGO_URI or MONGODB_URI.
 */
import mongoose from "mongoose";

const ATLAS_URI =
  "mongodb+srv://applecrmdemo_db_user:ireallydontknow@cluster0.eiailbv.mongodb.net/?appName=Cluster0";
const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || ATLAS_URI;

export async function connectDb(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    throw err;
  }
}

export { mongoose };
