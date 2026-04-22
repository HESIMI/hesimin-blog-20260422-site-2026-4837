import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/db";
import { ensureAdminApiAccess } from "@/lib/admin-api";

export async function GET() {
  const unauthorized = await ensureAdminApiAccess();
  if (unauthorized) return unauthorized;
  return NextResponse.json({ tags: await getAllTags() });
}
