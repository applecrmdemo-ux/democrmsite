/**
 * MongoDB connection for CRM demo.
 * Uses environment variables only.
 */
import fs from "fs";
import path from "path";
import mongoose from "mongoose";

function loadDotEnvFile(): void {
  const envPath = path.resolve(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;

  const lines = fs.readFileSync(envPath, "utf-8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex <= 0) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    const rawValue = trimmed.slice(eqIndex + 1).trim();
    const value = rawValue.replace(/^['"]|['"]$/g, "");

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadDotEnvFile();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

function isValidMongoUri(uri: string): boolean {
  return uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://");
}

export async function connectDb(): Promise<void> {
  if (!MONGODB_URI) {
    throw new Error("[db] Missing MongoDB connection string. Set MONGODB_URI.");
  }
  if (!isValidMongoUri(MONGODB_URI)) {
    throw new Error(
      "[db] Invalid MongoDB URI scheme. MONGODB_URI must start with mongodb:// or mongodb+srv://"
    );
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("[db] Connected to MongoDB");
  } catch (err) {
    console.error("[db] MongoDB connection error:", err);
    throw err;
  }
}

export { mongoose };
