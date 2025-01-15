import { redirect } from "next/navigation";
import ChatInterface from "./chatInterface";
import { getServerSession } from "@/lib/serverAuth";
import { checkUserPaymentStatus } from "@/lib/paymentCheck";

export default async function ChatPage() {
  // Server-side session check
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const { isPaid } = await checkUserPaymentStatus();

  if (!isPaid) {
    redirect("/payments");
  }

  return (
    <main className="container mx-auto md:w-3/5">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <ChatInterface initialThreadId={null} userId={session.uid} />
      </div>
    </main>
  );
}
