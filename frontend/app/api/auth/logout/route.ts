import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("token", "", { path: "/", maxAge: 0 });
  res.cookies.set("userEmail", "", { path: "/", maxAge: 0 });
  return res;
}
