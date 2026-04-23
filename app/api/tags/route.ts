import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/db";

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("[/api/tags] failed to query tags:", error);
    return NextResponse.json({ tags: [], error: "Tags unavailable" }, { status: 200 });
  }
}
