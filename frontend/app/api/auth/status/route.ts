import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const store = await cookies(); 
  const token = store.get("token")?.value;
  const email = store.get("userEmail")?.value ?? null;

  return NextResponse.json({
    loggedIn: Boolean(token),
    email,
  });
}
