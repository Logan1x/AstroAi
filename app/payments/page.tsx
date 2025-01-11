import PaymentButton from "@/components/PaymentButton";
import React from "react";

type Props = {};

export default function Payments({}: Props) {
  return (
    <div>
      <PaymentButton amount={500} />
    </div>
  );
}
