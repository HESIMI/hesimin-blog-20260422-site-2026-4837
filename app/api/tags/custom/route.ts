import { NextResponse } from "next/server";
import { getAllTags, incrementTag } from "@/lib/db";

type CustomTagPayload = {
  name?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CustomTagPayload;
    const name = body.name?.trim().slice(0, 12);

    if (!name) {
      return NextResponse.json({ error: "Tag name is required." }, { status: 400 });
    }

    await incrementTag(name, false);
    return NextResponse.json({ tags: await getAllTags() });
  } catch (error) {
    console.error("[/api/tags/custom] failed to create tag:", error);
    return NextResponse.json({ error: "Create tag failed" }, { status: 503 });
  }
}
