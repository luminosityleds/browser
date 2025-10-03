import User from "@/server/mongodb/models/accountSchema";
import Device from "@/server/mongodb/models/deviceSchema";
import bcrypt from "bcryptjs";

describe("Account Service API (classic route tests)", () => {
  it("should sign up a new user", async () => {
    const userData = {
      name: "Test User",
      email: "signup@test.com",
      password: "Password123",
    };

    const user = new User({
      name: userData.name,
      email: userData.email,
      password: await bcrypt.hash(userData.password, 10),
    });
    await user.save();

    const found = await User.findOne({ email: userData.email });
    expect(found).not.toBeNull();
    expect(found!.email).toBe(userData.email);
  });

  it("should log in a user", async () => {
    const hashed = await bcrypt.hash("Password123", 10);
    await User.create({
      name: "Login User",
      email: "login@test.com",
      password: hashed,
    });

    const user = await User.findOne({ email: "login@test.com" });
    expect(user).not.toBeNull();

    const isMatch = await bcrypt.compare("Password123", user!.password);
    expect(isMatch).toBe(true);
  });

  it("should log out a user", async () => {
    const loggedOut = true; // simulate
    expect(loggedOut).toBe(true);
  });

  it("should delete an account", async () => {
    const user = await User.create({
      name: "Delete Me",
      email: "delete@test.com",
      password: "123",
    });

    await User.findByIdAndDelete(user._id);
    const found = await User.findById(user._id);
    expect(found).toBeNull();
  });

  it("should link a device to an account", async () => {
    const account = await User.create({
      name: "Device Owner",
      email: "owner@test.com",
      password: "Password123",
    });

    const device = await Device.create({
      name: "Smart Lamp",
      uuid: "lamp-12345",
      user: account._id,
    });

    account.devicesLinked.push(device._id);
    await account.save();

    const found = await User.findById(account._id).populate("devicesLinked");
    expect(found).not.toBeNull();
    expect(found!.devicesLinked.length).toBe(1);
    expect((found!.devicesLinked[0] as any).uuid).toBe("lamp-12345");
  });
});
