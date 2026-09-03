import { getToken } from "next-auth/jwt";
import { NextResponse, type NextRequest } from "next/server";

import { sessionCookieName } from "@/lib/auth-cookies";
import { clearSessionCookies, loginAfterSessionExpired } from "@/lib/session-cookies";

const PUBLIC_PATHS = new Set(["/", "/login", "/request", "/reset-password"]);
const AUTH_ENTRY_PATHS = new Set(["/login"]);

function isSecureRequest(req: NextRequest) {
  return (
    req.nextUrl.protocol === "https:" ||
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production"
  );
}

function isAccessTokenFresh(token: {
  accessToken?: unknown;
  accessTokenExpires?: unknown;
  error?: unknown;
} | null) {
  if (!token?.accessToken || token.error === "AccessTokenExpired") return false;
  const expiresAt = Number(token.accessTokenExpires);
  if (!Number.isFinite(expiresAt)) return false;
  return Date.now() < expiresAt - 30_000;
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isPublic = PUBLIC_PATHS.has(path);
  const sessionExpiredOnLogin = path === "/login" && req.nextUrl.searchParams.get("error") === "SessionExpired";
  const secureCookie = isSecureRequest(req);

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie,
    cookieName: sessionCookieName(secureCookie),
  });

  const signedIn = Boolean(token?.sub) && isAccessTokenFresh(token);

  if (sessionExpiredOnLogin) {
    return clearSessionCookies(req, NextResponse.next());
  }

  if (token?.sub && !isAccessTokenFresh(token) && !isPublic) {
    const login = loginAfterSessionExpired(req.url);
    return clearSessionCookies(req, NextResponse.redirect(login));
  }

  if (!isPublic && !signedIn) {
    const login = new URL("/login", req.url);
    login.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(login);
  }

  if (AUTH_ENTRY_PATHS.has(path) && signedIn) {
    return NextResponse.redirect(new URL("/shop", req.url));
  }

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", path);
  return NextResponse.next({
    request: { headers: requestHeaders },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
