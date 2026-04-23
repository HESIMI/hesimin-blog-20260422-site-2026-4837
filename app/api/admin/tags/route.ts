import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/db";
import { ensureAdminApiAccess } from "@/lib/admin-api";

export async function GET() {
  try {
    const unauthorized = await ensureAdminApiAccess();
    if (unauthorized) return unauthorized;
    return NextResponse.json({ tags: await getAllTags() });
  } catch (error) {
    console.error("[/api/admin/tags] failed to query tags:", error);
    return NextResponse.json({ tags: [], error: "Tags unavailable" }, { status: 200 });
  }
}
