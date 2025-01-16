import { NextResponse } from "next/server";
import { connect } from "@/dbConfig";
import User from "@/server/mongodb/models/accountSchema";

// DELETE method for deleting a user account
export async function DELETE(req: Request) {
  try {
    // Parse the request body to get the user ID
    const { userId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Connect to the database
    await connect();

    // Delete the user from the database
    const result = await User.findByIdAndDelete(userId);

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Respond with a success message
    return NextResponse.json({ message: "Account successfully deleted" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
