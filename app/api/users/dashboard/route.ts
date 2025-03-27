import { connect } from "@/dbConfig";
import Device from "@/server/mongodb/models/deviceSchema";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Account from "@/server/mongodb/models/accountSchema";

connect();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.TOKEN_SECRET as string;
    const decoded: any = jwt.verify(token, secret);
    const userId = decoded.id;

    const devices = await Device.find({ user: userId });

    return NextResponse.json({ devices });
  } catch (error: any) {
    console.error("Error fetching devices:", error.message);
    return NextResponse.json({ error: "Failed to fetch devices" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.TOKEN_SECRET as string;
    const decoded: any = jwt.verify(token, secret);
    const userId = decoded.id;

    const { id, name, brightness, color, powered } = await request.json();

    const updated = await Device.findOneAndUpdate(
      { _id: id, user: userId },
      {
        ...(name && { name }),
        ...(brightness !== undefined && { brightness, brightnessTimestamp: new Date() }),
        ...(color && { color, colorTimestamp: new Date() }),
        ...(powered !== undefined && { powered, poweredTimestamp: new Date() }),
        lastUpdated: new Date(),
      },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ error: "Device not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ message: "Device updated", device: updated });
  } catch (error: any) {
    console.error("Error updating device:", error.message);
    return NextResponse.json({ error: "Failed to update device" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const secret = process.env.TOKEN_SECRET as string;
    const decoded: any = jwt.verify(token, secret);
    const userId = decoded.id;

    const { deviceId } = await request.json();
    if (!deviceId) return NextResponse.json({ error: "Device ID is required" }, { status: 400 });

    // Step 1: Delete the device from the Device collection
    const deletedDevice = await Device.findOneAndDelete({ _id: deviceId, user: userId });

    if (!deletedDevice) {
      return NextResponse.json({ error: "Device not found or unauthorized" }, { status: 404 });
    }

    // Step 2: Remove the device from the user's devicesLinked array
    await Account.findOneAndUpdate(
      { _id: userId },
      { $pull: { devicesLinked: deviceId } }
    );

    return NextResponse.json({ message: "Device deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting device:", error.message);
    return NextResponse.json({ error: "Failed to delete device" }, { status: 500 });
  }
}
  
