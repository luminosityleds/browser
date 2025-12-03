// tests/setup.ts
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongo: MongoMemoryServer;

beforeAll(async () => {
  // Start in-memory MongoDB
  mongo = await MongoMemoryServer.create();

  // Set test DB URL
  process.env.MONGO_DB_URL = mongo.getUri();

  // Set TOKEN_SECRET for JWT signing in tests
  process.env.TOKEN_SECRET = "test-secret-key-for-jwt-signing";

  // Connect mongoose directly
  await mongoose.connect(process.env.MONGO_DB_URL);
  console.log("✅ Connected to in-memory MongoDB");
});

afterAll(async () => {
  // Disconnect mongoose and stop Mongo
  await mongoose.disconnect();
  if (mongo) await mongo.stop();
  console.log("🛑 Disconnected from in-memory MongoDB");
});

afterEach(async () => {
  // Clear all collections
  if (!mongoose.connection.db) return;
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
});
