// app/api/order/verify/route.ts
import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import crypto from "crypto";
import { getServerSession } from "@/lib/serverAuth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
// import { connectDB } from "@/lib/mongodb"; // Ensure you have a MongoDB connection setup
// import Order from "@/models/OrderModel"; // Your Order model

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request: Request) {
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } =
    await request.json();
  const body = razorpayOrderId + "|" + razorpayPaymentId;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpaySignature;

  if (!isAuthentic) {
    return NextResponse.json(
      { message: "invalid payment signature", error: true },
      { status: 400 }
    );
  }

  if (isAuthentic) {
    // Get current user from session
    const session = await getServerSession();

    if (session && session.uid) {
      // Update user payment status in Firestore
      // const userPaymentRef = doc(db, "userPayments", session.uid);
      await setDoc(doc(db, "userPayments", session.uid), {
        userId: session.uid,
        isPaid: true,
        paymentId: razorpayPaymentId,
        paidAt: new Date(),
      });
    }
  }

  // Connect to the database and update the order status
  //   await connectDB();
  //   await Order.findOneAndUpdate({ email: email }, { hasPaid: true });

  return NextResponse.json(
    { message: "payment success", error: false },
    { status: 200 }
  );
}
