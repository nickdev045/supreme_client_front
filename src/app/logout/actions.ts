"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const FALLBACK_AUTH_COOKIE_NAMES = [
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
] as const;

function isAuthCookie(name: string) {
  return name.includes("next-auth");
}

async function clearAuthCookies() {
  const cookieStore = await cookies();
  const seen = new Set<string>();

  for (const cookie of cookieStore.getAll()) {
    if (!isAuthCookie(cookie.name)) continue;
    seen.add(cookie.name);
    cookieStore.delete(cookie.name);
  }

  for (const name of FALLBACK_AUTH_COOKIE_NAMES) {
    if (seen.has(name)) continue;
    cookieStore.delete(name);
  }
}

export async function logoutStoreAction(callbackPath = "/") {
  await clearAuthCookies();
  const target = callbackPath.startsWith("/") && !callbackPath.startsWith("//") ? callbackPath : "/";
  redirect(target);
}
