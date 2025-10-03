// ✅ Mock dbConfig BEFORE importing any route handlers
jest.mock("@/dbConfig", () => ({
  connect: async () => {},      // no-op to bypass real connect
  disconnect: async () => {},   // no-op
}));

import User from "@/server/mongodb/models/accountSchema";
import bcrypt from "bcryptjs";
import { POST as deviceHandler } from "@/app/api/users/devices/route";
import { POST as signupHandler } from "@/app/api/users/signup/route";
import { POST as loginHandler } from "@/app/api/users/login/route";
import { DELETE as deleteHandler } from "@/app/api/users/deleteAccount/route";
import { GET as logoutHandler } from "@/app/api/users/logout/route";
import { NextRequest } from "next/server";

// Helper to create NextRequest
function makeRequest(body: any, method = "POST") {
  return new NextRequest("http://localhost/api/test", {
    method,
    body: JSON.stringify(body),
  } as any);
}

describe("Account Service API Handlers (App Router)", () => {
  it("should create a new user", async () => {
    const req = makeRequest({
      name: "Test User",
      email: "test@example.com",
      password: "Password123",
    });

    const res: any = await signupHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.savedUser.email).toBe("test@example.com");
  });

  it("should login a user", async () => {
    const hashed = await bcrypt.hash("Password123", 10);
    await User.create({
      name: "Login User",
      email: "login@test.com",
      password: hashed,
    });

    const req = makeRequest({
      email: "login@test.com",
      password: "Password123",
    });
    const res: any = await loginHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("should logout a user", async () => {
    const req = makeRequest({}, "POST");
    const res: any = await logoutHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("should delete a user by ID", async () => {
    const user = await User.create({
      name: "Delete Me",
      email: "delete@test.com",
      password: "123",
    });

    const userId = user._id.toString();
    const req = makeRequest({ userId }, "DELETE");

    const res: any = await deleteHandler(req);
    const json = await res.json();

    expect(res.status).toBe(200);
    expect(json.success).toBe(true);

    const found = await User.findById(user._id);
    expect(found).toBeNull();
  });
});

// ✅ Mock getDataFromToken for device tests
jest.mock("@/helper/getDataFromToken", () => ({
  getDataFromToken: () => testUserId,
}));

let testUserId: string;

describe("Device API (link device)", () => {
  it("should create and link a device to an account", async () => {
    const account = await User.create({
      name: "Device Owner",
      email: "owner@test.com",
      password: "Password123",
    });
    testUserId = account._id.toString();

    const req = new NextRequest("http://localhost/api/device", {
      method: "POST",
      body: JSON.stringify({
        name: "Smart Lamp",
        color: "Red",
        brightness: 80,
        powered: true,
      }),
    } as any);

    const res: any = await deviceHandler(req);
    const json = await res.json();

    expect(res.status).toBe(201);
    expect(json.message).toBe("Device registered successfully");
    expect(json.device.name).toBe("Smart Lamp");

    const updatedAccount = await User.findById(testUserId).populate(
      "devicesLinked"
    );
    expect(updatedAccount!.devicesLinked.length).toBe(1);
    expect((updatedAccount!.devicesLinked[0] as any).name).toBe("Smart Lamp");
  });
});
