import { apiData } from "@/lib/api/client";

export function exchangePasswordResetRef(token: string, ref: string) {
  return apiData<{ token: string; expiresAt: string }>(
    "/api/v1/auth/password-reset/exchange",
    { method: "POST", token, body: { ref } },
  );
}

export function confirmPasswordReset(input: { token: string; newPassword: string }) {
  return apiData<{ updated: true; requiresReauth: boolean }>(
    "/api/v1/auth/password-reset/confirm",
    { method: "POST", body: input },
  );
}
