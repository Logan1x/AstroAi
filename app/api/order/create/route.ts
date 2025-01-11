import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { v4 as uuid } from "uuid";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Your Razorpay key id
  key_secret: process.env.RAZORPAY_KEY_SECRET, // Your Razorpay key secret
});

export async function POST(request: Request) {
  const { amount } = await request.json(); // Amount in paisa

  const options = {
    amount: amount * 100, // Convert to paise
    currency: "INR",
    receipt: uuid(),
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json({ message: "success", order });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
