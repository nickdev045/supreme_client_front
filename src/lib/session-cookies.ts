import { NextRequest, NextResponse } from "next/server";

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

function expireCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    maxAge: 0,
    path: "/",
    ...(name.startsWith("__Secure-") || name.startsWith("__Host-") ? { secure: true } : {}),
  });
}

/** Clear every NextAuth cookie present on the request (including chunked session tokens). */
export function clearSessionCookies(req: NextRequest, response: NextResponse) {
  const seen = new Set<string>();

  for (const cookie of req.cookies.getAll()) {
    if (!isAuthCookie(cookie.name)) continue;
    seen.add(cookie.name);
    expireCookie(response, cookie.name);
  }

  for (const name of FALLBACK_AUTH_COOKIE_NAMES) {
    if (seen.has(name)) continue;
    expireCookie(response, name);
  }

  return response;
}

export function loginAfterSessionExpired(reqUrl: string, callbackUrl?: string | null) {
  const login = new URL("/login", reqUrl);
  login.searchParams.set("error", "SessionExpired");
  if (callbackUrl && callbackUrl.startsWith("/") && !callbackUrl.startsWith("//")) {
    login.searchParams.set("callbackUrl", callbackUrl);
  }
  return login;
}
