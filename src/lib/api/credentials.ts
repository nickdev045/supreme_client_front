import { apiData } from "@/lib/api/client";

export function confirmPasswordReset(input: {
  ref?: string;
  token?: string;
  newPassword: string;
}) {
  return apiData<{ updated: true; requiresReauth: boolean }>(
    "/api/v1/auth/password-reset/confirm",
    { method: "POST", body: input },
  );
}
