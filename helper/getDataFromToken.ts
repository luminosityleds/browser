import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  iat?: number;
  exp?: number;
}

export const getDataFromToken = (request: NextRequest): string => {
  try {
    // Retrieve the token from the cookies
    const token = request.cookies.get("token")?.value || "";
    if (!token) {
      throw new Error("Unauthorized: Missing token");
    }

    const secret = process.env.TOKEN_SECRET;
    if (!secret) {
      throw new Error("Server error: Missing JWT secret");
    }

    // ✅ Verify with a typed payload instead of `any`
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded.id) {
      throw new Error("Unauthorized: Invalid token payload");
    }

    return decoded.id;
  } catch (error: unknown) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unknown authentication error");
  }
};
