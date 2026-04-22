import { NextResponse } from "next/server";
import { addMessage, MessageType } from "@/lib/db";

type MessagePayload = {
  type?: string;
  content?: string;
  isAnonymous?: boolean;
};

const validTypes = new Set<MessageType>(["SUGGESTION", "WHISPER"]);

export async function POST(request: Request) {
  const body = (await request.json()) as MessagePayload;
  const content = body.content?.trim();
  const type = body.type as MessageType | undefined;

  if (!content) {
    return NextResponse.json({ error: "Message content is required." }, { status: 400 });
  }

  if (content.length > 200) {
    return NextResponse.json({ error: "Message content is too long." }, { status: 400 });
  }

  if (!type || !validTypes.has(type)) {
    return NextResponse.json({ error: "Invalid message type." }, { status: 400 });
  }

  const id = await addMessage(type, content, body.isAnonymous ?? true);
  return NextResponse.json({ id });
}
