/** Distinct from admin app — browsers share cookies across localhost ports. */
export const SESSION_COOKIE_BASE = "supreme-client.session-token";

export function sessionCookieName(secure: boolean) {
  return secure ? `__Secure-${SESSION_COOKIE_BASE}` : SESSION_COOKIE_BASE;
}

export const AUTH_COOKIE_CLEAR_NAMES = [
  SESSION_COOKIE_BASE,
  `__Secure-${SESSION_COOKIE_BASE}`,
  // Legacy default NextAuth names (pre-rename) — clear on logout/expiry.
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
  "next-auth.callback-url",
  "__Secure-next-auth.callback-url",
  "next-auth.csrf-token",
  "__Host-next-auth.csrf-token",
] as const;
