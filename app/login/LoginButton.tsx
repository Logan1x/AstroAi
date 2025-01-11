"use client";

import { useState } from "react";
import { signInWithGoogle, signOut } from "@/lib/firebase";
import { useFirebaseAuth } from "@/hooks/useFirebaseAuth";
import { useRouter } from "next/navigation";

export function LoginButton() {
  const { user } = useFirebaseAuth();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      await signInWithGoogle();
      router.push("/payments");
    } catch (error) {
      console.error("Sign in failed", error);
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Sign out failed", error);
    }
  };

  if (user) {
    return (
      <div className="flex items-center space-x-4">
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
        )}
        <div>
          <p>{user.displayName}</p>
          <button
            onClick={handleSignOut}
            className="text-red-500 hover:underline"
            disabled={isLoading}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleSignIn}
      disabled={isLoading}
      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
    >
      {isLoading ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
