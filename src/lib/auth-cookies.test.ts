import { describe, expect, it } from "vitest";

import {
  SESSION_COOKIE_BASE,
  clientSessionCookie,
  sessionCookieName,
  sessionCookieNamesToRead,
} from "@/lib/auth-cookies";

describe("client session cookies", () => {
  it("prefixes the secure cookie that middleware reads on Vercel", () => {
    expect(sessionCookieName(true)).toBe(`__Secure-${SESSION_COOKIE_BASE}`);
    expect(sessionCookieNamesToRead(true)).toEqual([
      `__Secure-${SESSION_COOKIE_BASE}`,
    ]);
  });

  it("keeps the unprefixed name in local development", () => {
    expect(sessionCookieName(false)).toBe(SESSION_COOKIE_BASE);
    expect(sessionCookieNamesToRead(false)).toEqual([SESSION_COOKIE_BASE]);
  });

  it("configures NextAuth with a known client cookie name", () => {
    expect([SESSION_COOKIE_BASE, `__Secure-${SESSION_COOKIE_BASE}`]).toContain(
      clientSessionCookie().name,
    );
  });
});
