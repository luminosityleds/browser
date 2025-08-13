import { connect } from "@/dbConfig";
import User from "@/server/mongodb/models/accountSchema";
import Device from "@/server/mongodb/models/deviceSchema";
import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

connect();

const allowedColors = ["Red", "Green", "Blue", "Yellow", "Purple", "Orange", "White", "Black"];

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const secret = process.env.TOKEN_SECRET as string;
        if (!secret) {
            return NextResponse.json({ error: "Server error: Missing JWT secret" }, { status: 500 });
        }

        const decoded: any = jwt.verify(token, secret);
        const userId = decoded.id;

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, color, brightness } = await request.json();

        if (!name) {
            return NextResponse.json({ error: "Device name is required" }, { status: 400 });
        }

        if (!allowedColors.includes(color)) {
            return NextResponse.json({ error: "Invalid color selected" }, { status: 400 });
        }

        if (typeof brightness !== "number" || brightness < 0 || brightness > 100) {
            return NextResponse.json({ error: "Brightness must be a number between 0 and 100" }, { status: 400 });
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

        return NextResponse.json({ message: "Device registered successfully", device: newDevice }, { status: 201 });

    } catch (error: any) {
        console.error("Error in device registration:", JSON.stringify(error, null, 2));
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
