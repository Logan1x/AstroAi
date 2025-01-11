// lib/paymentCheck.ts
import { getServerSession } from "./serverAuth";
import { db } from "./firebase"; // Adjust import based on your Firebase setup
import { doc, getDoc } from "firebase/firestore";

export async function checkUserPaymentStatus() {
  const session = await getServerSession();

  if (!session) {
    return {
      isLoggedIn: false,
      isPaid: false,
    };
  }

  try {
    // Fetch user payment document
    // const userPaymentRef = doc(db, "userPayments", session.uid);
    console.log({ db, session });
    const paymentDoc = await getDoc(doc(db, "userPayments", session.uid));

    return {
      isLoggedIn: true,
      isPaid: paymentDoc.exists() && paymentDoc.data()?.isPaid === true,
    };
  } catch (error) {
    console.error("Payment status check error:", error);
    return {
      isLoggedIn: true,
      isPaid: false,
    };
  }
}
