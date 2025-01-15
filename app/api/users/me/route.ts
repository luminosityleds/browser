import { NextRequest, NextResponse } from "next/server";
import {connect} from "@/dbConfig";
import User from "@/server/mongodb/models/accountSchema";
import { getDataFromToken } from "@/helper/getDataFromToken";

connect(); // Ensure your database connection is established

export async function GET(request: NextRequest) {
    try {
        // Extract user ID from the authentication token
        const userId = await getDataFromToken(request);

        // Find the user in the database based on the user ID
        const user = await User.findOne({ _id: userId }).select("-password");
        return NextResponse.json({
            message: "User found",
            data: user,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
