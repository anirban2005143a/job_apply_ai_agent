import { NextResponse } from "next/server";
import demoUser from "@/data/demoUser";

export async function GET() {
  // simulate delay
  await new Promise((r) => setTimeout(r, 1800));

  // Return demo user data as if processed by a backend resume parsing service
  return NextResponse.json({ ok: true, user: demoUser });
}
