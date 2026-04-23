import { NextResponse } from "next/server";
import { DEFAULT_TAG_NAMES } from "@/lib/default-tags";
import { getAllTags, incrementTag } from "@/lib/db";

type VotePayload = {
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as VotePayload;
    const name = body.name?.trim();

    if (!name) {
      return NextResponse.json({ error: "Tag name is required." }, { status: 400 });
    }

    await incrementTag(name, DEFAULT_TAG_NAMES.includes(name as (typeof DEFAULT_TAG_NAMES)[number]));
    return NextResponse.json({ tags: await getAllTags() });
  } catch (error) {
    console.error("[/api/tags/vote] failed to vote:", error);
    return NextResponse.json({ error: "Vote failed" }, { status: 503 });
  }
}
