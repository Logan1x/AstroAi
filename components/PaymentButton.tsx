// app/components/PaymentButton.tsx
"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const PaymentButton = ({ amount }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const makePayment = async () => {
    setIsLoading(true);
    const data = await fetch("/api/order/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ amount }),
    });

    const { order } = await data.json();
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Your Razorpay key id
      amount: order.amount,
      currency: order.currency,
      order_id: order.id,
      handler: async function (response) {
        const verificationResponse = await fetch("/api/order/verify", {
          method: "POST",
          body: JSON.stringify({
            razorpayPaymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            razorpaySignature: response.razorpay_signature,
            email: "customer@example.com", // Replace with actual email
          }),
        });

        const res = await verificationResponse.json();
        if (res.error === false) {
          router.push("/chat"); // Redirect to success page
        }
      },
      prefill: {
        email: "customer@example.com", // Replace with actual email
      },
    };

    const paymentObject = new window.Razorpay(options);
    paymentObject.open();

    paymentObject.on("payment.failed", function (response) {
      alert(`Payment failed: ${response.error.description}`);
    });

    setIsLoading(false);
  };

  return (
    <button
      onClick={makePayment}
      disabled={isLoading}
      className="border-2 border-gray-500 rounded m-2 px-2 py-1 "
    >
      {isLoading ? "Loading..." : "Pay Now"}
    </button>
  );
};

export default PaymentButton;
