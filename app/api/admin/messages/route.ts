import { NextResponse } from "next/server";
import { getAllMessages } from "@/lib/db";
import { ensureAdminApiAccess } from "@/lib/admin-api";

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ messages: await getAllMessages() });
}
