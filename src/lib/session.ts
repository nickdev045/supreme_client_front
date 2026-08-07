import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";

import { authOptions } from "@/lib/auth";
import { getServerEnv } from "@/lib/env";

export function getSession() {
  return getServerSession(authOptions);
}

/** Backend bearer token from the httpOnly JWT cookie. Server-only. */
export async function getAccessToken(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookieEntries = cookieStore.getAll();
  const cookieHeader = cookieEntries
    .map((cookie) => `${cookie.name}=${cookie.value}`)
    .join("; ");
  const cookieMap = Object.fromEntries(
    cookieEntries.map((cookie) => [cookie.name, cookie.value]),
  );

  const secureCookie =
    process.env.VERCEL === "1" ||
    process.env.NODE_ENV === "production" ||
    Boolean(cookieMap["__Secure-next-auth.session-token"]);

  const token = await getToken({
    req: {
      headers: { cookie: cookieHeader },
      cookies: cookieMap,
    } as unknown as Parameters<typeof getToken>[0]["req"],
    secret: getServerEnv().NEXTAUTH_SECRET,
    secureCookie,
    cookieName: secureCookie
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  if (!token?.accessToken || token.error) {
    return null;
  }

  return String(token.accessToken);
}

export async function requireAccessToken(): Promise<string> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    throw new Error("Unauthenticated");
  }
  return accessToken;
}
