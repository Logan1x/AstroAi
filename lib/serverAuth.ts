import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// Define a type for the token payload
interface TokenPayload {
  token: any;
  exp: number;
}

export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get("session");

    // Log for debugging
    // console.log({ session });

    if (!session) return null;

    // Verify and decode the JWT
    const decodedToken = jwt.verify(
      session.value,
      process.env.NEXT_PUBLIC_JWT_SECRET!,
      {
        algorithms: ["HS256"],
      }
    ) as TokenPayload;

    // Check if token is expired
    if (decodedToken.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    // console.log({ decodedToken });

    return {
      uid: decodedToken.token.uid,
      email: decodedToken.token.email,
    };
  } catch (error) {
    // Log specific error for debugging
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Session token expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token", error.message);
    } else {
      console.error("Server session verification error:", error);
    }
    return null;
  }
}
