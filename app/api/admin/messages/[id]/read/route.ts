import { NextResponse } from "next/server";
import { markMessageAsRead } from "@/lib/db";
import { ensureAdminApiAccess, parseNumericId } from "@/lib/admin-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(_: Request, context: RouteContext) {
  try {
    const unauthorized = await ensureAdminApiAccess();
    if (unauthorized) return unauthorized;

    const { id } = await context.params;
    const messageId = parseNumericId(id);
    if (!messageId) {
      return NextResponse.json({ error: "Invalid message id" }, { status: 400 });
    }

    const updated = await markMessageAsRead(messageId);
    if (!updated) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/admin/messages/:id/read] failed to mark as read:", error);
    return NextResponse.json({ error: "Mark read failed" }, { status: 503 });
  }
}
