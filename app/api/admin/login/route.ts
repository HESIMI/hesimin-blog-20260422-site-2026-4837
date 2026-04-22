import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE_NAME,
  createAdminSessionToken,
  isValidAdminPassword,
} from "@/lib/admin-auth";

type LoginPayload = {
  password?: string;
};

export async function POST(request: Request) {
  const body = (await request.json()) as LoginPayload;
  const password = body.password?.trim() || "";

  if (!isValidAdminPassword(password)) {
    return NextResponse.json({ error: "密码错误" }, { status: 401 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_COOKIE_NAME, createAdminSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}

