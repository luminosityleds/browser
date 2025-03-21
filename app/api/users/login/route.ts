import {connect} from "@/dbConfig";
import User from "@/server/mongodb/models/accountSchema";
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken"

import dotenv from "dotenv";
dotenv.config();


connect()
// Calls the connect function to establish a connection to the database.

export async function POST(request: NextRequest){
    try {
        const reqBody = await request.json()
        const {email, password} = reqBody

        //check if user exists
        const user = await User.findOne({email})

        if(!user){
            return NextResponse.json({error: "User does not exist"}, {status: 400})
        }
        
        //check if password is correct
        const validPassword = await bcryptjs.compare(password, user.password);
        if(!validPassword){
            return NextResponse.json({error: "Invalid password"}, {status: 400})
        }

//create token data
// A JavaScript object (tokenData) is created to store essential user 
// information. In this case, it includes the user's unique identifier (id), 
// username, and email.

        const tokenData = {
            id: user._id,
            username: user.name,
            email: user.email
        }

        // Create a token with expiration of 1 day
        const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, {expiresIn: "1d"})

        // Create a JSON response indicating successful login
        const response = NextResponse.json({
            message: "Login successful",
            success: true,
        })

        // Set the token as an HTTP-only cookie
        response.cookies.set("token", token, {
            httpOnly: true,
        })

        return response;

    } catch (error: any) {
        return NextResponse.json({error: error.message}, {status: 500})

    }
}