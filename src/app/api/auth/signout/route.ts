import { NextRequest, NextResponse } from "next/server";

import { clearSessionCookies, loginAfterSessionExpired } from "@/lib/session-cookies";

function resolveRedirectTarget(req: NextRequest, callbackUrl: string | null) {
  if (callbackUrl?.startsWith("/") && !callbackUrl.startsWith("//")) {
    try {
      return new URL(callbackUrl, req.url);
    } catch {
      // fall through
    }
  }
  return loginAfterSessionExpired(req.url);
}

function finalizeRedirect(req: NextRequest, target: URL, sessionExpired = false) {
  if (sessionExpired && target.pathname === "/login" && !target.searchParams.has("error")) {
    target.searchParams.set("error", "SessionExpired");
  }
  return clearSessionCookies(req, NextResponse.redirect(target));
}

export async function GET(req: NextRequest) {
  const callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
  const target = resolveRedirectTarget(req, callbackUrl);
  const sessionExpired =
    target.pathname === "/login" && target.searchParams.get("error") === "SessionExpired";
  return finalizeRedirect(req, target, sessionExpired);
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") ?? "";
  let callbackUrl = req.nextUrl.searchParams.get("callbackUrl");
  let wantsJson = false;

  if (contentType.includes("application/json")) {
    const body = (await req.json().catch(() => null)) as {
      callbackUrl?: string;
      json?: boolean | string;
    } | null;
    callbackUrl = body?.callbackUrl ?? callbackUrl;
    wantsJson = body?.json === true || body?.json === "true";
  } else {
    const body = await req.formData().catch(() => null);
    callbackUrl = body?.get("callbackUrl")?.toString() ?? callbackUrl;
    wantsJson = body?.get("json")?.toString() === "true";
  }

  const target = resolveRedirectTarget(req, callbackUrl);
  const sessionExpired =
    target.pathname === "/login" && target.searchParams.get("error") === "SessionExpired";

  if (wantsJson) {
    const response = NextResponse.json({ url: target.pathname + target.search + target.hash });
    return clearSessionCookies(req, response);
  }

  return finalizeRedirect(req, target, sessionExpired);
}
