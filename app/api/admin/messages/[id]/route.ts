import { NextResponse } from "next/server";
import { deleteMessageById } from "@/lib/db";
import { ensureAdminApiAccess, parseNumericId } from "@/lib/admin-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;

  const { id } = await context.params;
  const messageId = parseNumericId(id);
  if (!messageId) {
    return NextResponse.json({ error: "Invalid message id" }, { status: 400 });
  }

  const deleted = await deleteMessageById(messageId);
  if (!deleted) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
