// dbConfig.ts
import mongoose from "mongoose";

let isConnected = false; // track connection status

export async function connect() {
  if (isConnected) return; // singleton pattern

  const uri = process.env.MONGO_DB_URL;
  if (!uri) throw new Error("MONGO_DB_URL is not defined");

  try {
    await mongoose.connect(uri);
    console.log("MongoDB connected");
    isConnected = true;
  } catch (err) {
    console.error("MongoDB connection error:", err);
    throw err;
  }
}

export async function disconnect() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
}
