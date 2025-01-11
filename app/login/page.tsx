import { LoginButton } from "@/app/login/LoginButton";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export default async function LoginPage() {
  // Check for existing Firebase session

  const cookieStore = await cookies();
  const session = cookieStore.get("session");

  if (session) {
    redirect("/chat");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl mb-4">Welcome to Chat App</h1>
        <LoginButton />
      </div>
    </div>
  );
}
