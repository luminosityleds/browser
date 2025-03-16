import { connect } from "@/dbConfig";
import User from "@/server/mongodb/models/accountSchema";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/app/helpers/mailer";

connect();
// Calls the connect function to establish a connection to the database.

export async function POST(request: NextRequest) {
    // Defines an asynchronous POST request handler.
    try {
        const reqBody = await request.json();
        const { name, email, password } = reqBody; // Parses the request body to extract name, email, and password.

        // Checks if a user with the provided email already exists. 
        const user = await User.findOne({ email });

        // If yes, returns a 409 response.
        if (user) {
            return NextResponse.json({ error: "User already exists" }, { status: 409 });
        }

        // Hash password using bcryptjs.
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
        });

        // Saves the new user to the database.
        const savedUser = await newUser.save();

        // Send verification email
        await sendEmail({
            email,
            emailType: "VERIFY",
            userId: savedUser._id,
        });

        return NextResponse.json({
            message: "User created successfully",
            success: true,
            savedUser,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
