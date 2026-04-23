import { NextResponse } from "next/server";
import { getAllMessages } from "@/lib/db";
import { ensureAdminApiAccess } from "@/lib/admin-api";

export async function GET() {
  try {
    const unauthorized = await ensureAdminApiAccess();
    if (unauthorized) return unauthorized;
    return NextResponse.json({ messages: await getAllMessages() });
  } catch (error) {
    console.error("[/api/admin/messages] failed to query messages:", error);
    return NextResponse.json({ messages: [], error: "Messages unavailable" }, { status: 200 });
  }
}
