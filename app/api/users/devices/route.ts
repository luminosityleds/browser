import { NextRequest, NextResponse } from "next/server";

import Device from "@/server/mongodb/models/deviceSchema";
import User from "@/server/mongodb/models/accountSchema";
import { colors } from "@/app/utils/colorMap"; // full color list
import { connect } from "@/dbConfig";
// Update the import path to the correct location of getDataFromToken
import { getDataFromToken } from "@/helper/getDataFromToken";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

connect();

// ✅ Use names from color library
const allowedColors = colors.map((c) => c.name);

export async function POST(request: NextRequest) {
  try {
    const userId = getDataFromToken(request); // ✅ use helper

    const { name, color, brightness } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Device name is required" },
        { status: 400 }
      );
    }

    // ✅ Validate against full color list
    if (!allowedColors.includes(color)) {
      return NextResponse.json(
        { error: "Invalid color selected" },
        { status: 400 }
      );
    }

    if (typeof brightness !== "number" || brightness < 0 || brightness > 100) {
      return NextResponse.json(
        { error: "Brightness must be a number between 0 and 100" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const newDevice = await Device.create({
      name,
      uuid: uuidv4(),
      connected: true,
      connectedTimestamp: new Date(),
      user: userId,
      lastUpdated: new Date(),
      powered: false,
      poweredTimestamp: new Date(),
      color,
      colorTimestamp: new Date(),
      brightness,
      brightnessTimestamp: new Date(),
    });

    if (!Array.isArray(user.devicesLinked)) {
      user.devicesLinked = [];
    }

    user.devicesLinked.push(newDevice._id as mongoose.Types.ObjectId);
    await user.save();

    return NextResponse.json(
      { message: "Device registered successfully", device: newDevice },
      { status: 201 }
    );
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in device registration:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.error("Unknown error in device registration:", error);
    return NextResponse.json(
      { error: "An unknown error occurred" },
      { status: 500 }
    );
  }
}
