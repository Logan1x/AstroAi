import { NextRequest, NextResponse } from "next/server";
import admin from "firebase-admin";
import ServiceAccount from "../../../lib/ServiceAccountKey.json";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import jwt from "jsonwebtoken";

// Initialize Firebase Admin (if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(ServiceAccount as admin.ServiceAccount),
  });
}

// export async function POST(request: NextRequest) {
//   try {
//     const { token } = await request.json();

//     // Verify the ID token
//     const decodedToken = await admin.auth().verifyIdToken(token);

//     console.log({ decodedToken });

//     const userName = decodedToken.name;
//     const email = decodedToken.email;
//     const userId = decodedToken.uid;

//     await setDoc(doc(db, "usersCollection", userId), {
//       //TODO: change collection name
//       userName,
//       email,
//       userId,
//       role: "user",
//       createdAt: new Date(),
//     });

//     // Set session expiration to 5 days
//     const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

//     // Create session cookie
//     const sessionCookie = await admin
//       .auth()
//       .createSessionCookie(token, { expiresIn });

//     console.log("\n\n\n\nyaaaaay");

//     // Set cookie in response
//     const response = NextResponse.json({ status: "success" });
//     response.cookies.set("__session", sessionCookie, {
//       maxAge: expiresIn,
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     });

//     return response;
//   } catch (error) {
//     console.error("Session creation error:", error);
//     return NextResponse.json({ status: "error", error }, { status: 500 });
//   }
// }

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    const decodedToken = await admin.auth().verifyIdToken(token);

    // if decodedToekn is null redirect to login page
    if (!decodedToken) {
      return NextResponse.redirect("/login");
    }

    // Create a custom JWT session token
    const sessionToken = jwt.sign(
      {
        token: decodedToken,
        // Add any additional claims
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5, // 5 days
      },
      process.env.NEXT_PUBLIC_JWT_SECRET!
    );

    // Create response with cookie
    const response = NextResponse.json({
      status: "success",
    });

    // Set cookie
    response.cookies.set("session", sessionToken, {
      maxAge: 60 * 60 * 24 * 5, // 5 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
