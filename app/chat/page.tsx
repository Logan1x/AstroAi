import { redirect } from "next/navigation";
import ChatInterface from "./chatInterface";
import { createThread } from "@/lib/openai";
import { getServerSession } from "@/lib/serverAuth";
import { checkUserPaymentStatus } from "@/lib/paymentCheck";

export default async function Home() {
  // Server-side session check
  const session = await getServerSession();

  if (!session) {
    redirect("/login");
  }

  const { isPaid } = await checkUserPaymentStatus();

  if (!isPaid) {
    redirect("/payments");
  }

  const thread = await createThread();

  return (
    <main className="container mx-auto max-w-2xl p-4">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <ChatInterface initialThreadId={thread.id} userId={session.uid} />
      </div>
    </main>
  );
}
