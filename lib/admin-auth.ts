import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const ADMIN_COOKIE_NAME = "blog_admin_session";
const defaultPassword = "123456";

function getAdminPassword() {
  return (process.env.ADMIN_PASSWORD || defaultPassword).trim();
}

function createSessionTokenFromPassword(password: string) {
  return createHash("sha256").update(`admin:${password}`).digest("hex");
}

function safeCompare(a: string, b: string) {
  const bufferA = Buffer.from(a);
  const bufferB = Buffer.from(b);
  if (bufferA.length !== bufferB.length) return false;
  return timingSafeEqual(bufferA, bufferB);
}

export function isValidAdminPassword(input: string) {
  return safeCompare(input, getAdminPassword());
}

export function createAdminSessionToken() {
  return createSessionTokenFromPassword(getAdminPassword());
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!cookieValue) return false;
  return safeCompare(cookieValue, createAdminSessionToken());
}

