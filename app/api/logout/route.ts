import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json({ status: "success" });

  // Clear the session cookie
  response.cookies.delete("__session");

  return response;
}
