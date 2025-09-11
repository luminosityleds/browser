import { connect } from "@/dbConfig";
import User from "@/server/mongodb/models/accountSchema";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import { sendEmail } from "@/app/helpers/mailer";

connect();
// Calls the connect function to establish a connection to the database.

export async function POST(request: NextRequest) {
    try {
      const reqBody = await request.json();
      const { name, email, password } = reqBody;
  
      // Validate email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
      }
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (user) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 });
      }
  
      // Hash password
      const hashedPassword = await bcryptjs.hash(password, 10);
  
      const newUser = new User({ name, email, password: hashedPassword });
      const savedUser = await newUser.save();
  
      await sendEmail({ email, emailType: "VERIFY", userId: savedUser._id });
  
      return NextResponse.json({
        message: "User created successfully",
        success: true,
        savedUser,
      });
    } catch (error: any) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
  
