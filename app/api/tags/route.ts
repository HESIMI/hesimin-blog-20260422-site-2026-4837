import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/db";
import { DEFAULT_TAG_NAMES } from "@/lib/default-tags";

export async function GET() {
  try {
    const tags = await getAllTags();
    return NextResponse.json({ tags });
  } catch (error) {
    console.error("[/api/tags] failed to query tags:", error);
    return NextResponse.json(
      {
        tags: DEFAULT_TAG_NAMES.map((name, index) => ({
          id: index + 1,
          name,
          count: 0,
        })),
        error: "Tags unavailable",
      },
      { status: 200 },
    );
  }
}
