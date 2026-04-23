import { NextResponse } from "next/server";
import { deleteTagById } from "@/lib/db";
import { ensureAdminApiAccess, parseNumericId } from "@/lib/admin-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  try {
    const unauthorized = await ensureAdminApiAccess();
    if (unauthorized) return unauthorized;

    const { id } = await context.params;
    const tagId = parseNumericId(id);
    if (!tagId) {
      return NextResponse.json({ error: "Invalid tag id" }, { status: 400 });
    }

    const deleted = await deleteTagById(tagId);
    if (!deleted) {
      return NextResponse.json({ error: "Tag not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[/api/admin/tags/:id] failed to delete tag:", error);
    return NextResponse.json({ error: "Delete tag failed" }, { status: 503 });
  }
}
