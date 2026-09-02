import { z } from "zod";

import { apiData, ApiError } from "@/lib/api/client";
import type { ApiLoginData, ApiMeData, ApiTenant } from "@/lib/api/types";

/** Permissions that grant entry to the store / customer portal (mirror backend). */
export const STORE_CLIENT_PERMISSIONS = [
  "catalog.read",
  "carts.read",
  "carts.write",
  "favourites.read",
  "favourites.write",
  "addresses.read",
  "addresses.write",
  "terms.read",
  "notifications.read",
] as const;

export type AuthErrorKey =
  | "invalidCredentials"
  | "tooManyAttempts"
  | "checkEmail"
  | "invalidEmail"
  | "apiUnreachable"
  | "accessDenied"
  | "generic";

/** Normalize /login and /me permission payloads (string[] or { code }[]). */
export function normalizePermissionCodes(permissions: unknown): string[] {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .map((item) => {
      if (typeof item === "string") return item;
      if (
        item &&
        typeof item === "object" &&
        "code" in item &&
        typeof (item as { code: unknown }).code === "string"
      ) {
        return (item as { code: string }).code;
      }
      return null;
    })
    .filter((code): code is string => Boolean(code));
}

/** Codes that admit a user to the store (mirror backend STORE_ENTRY_PERMISSIONS). */
const STORE_ENTRY_PERMISSIONS = [
  "catalog.read",
  "carts.read",
  "carts.write",
  "favourites.read",
  "favourites.write",
] as const;

export function canAccessStorePortal(permissions: string[]): boolean {
  return permissions.some((code) =>
    (STORE_ENTRY_PERMISSIONS as readonly string[]).includes(code),
  );
}

export async function fetchTenants(email: string): Promise<ApiTenant[]> {
  const parsed = emailSchema.parse(email);
  return apiData<ApiTenant[]>("/api/v1/auth/tenants", {
    method: "POST",
    body: { email: parsed },
  });
}

const emailSchema = z.string().trim().email();

export async function loginWithCompany(input: {
  email: string;
  password: string;
  companyId: string;
}): Promise<ApiLoginData> {
  return apiData<ApiLoginData>("/api/v1/auth/login", {
    method: "POST",
    body: {
      email: emailSchema.parse(input.email),
      password: input.password,
      fk_company: input.companyId,
      client: "store",
    },
  });
}

export async function fetchMe(accessToken: string): Promise<ApiMeData> {
  return apiData<ApiMeData>("/api/v1/auth/me", {
    method: "GET",
    token: accessToken,
  });
}

export type UpdateMeInput = {
  firstName?: string;
  lastName?: string;
  photoUrl?: string | null;
};

export async function updateMe(
  accessToken: string,
  input: UpdateMeInput,
): Promise<ApiMeData> {
  return apiData<ApiMeData>("/api/v1/auth/me", {
    method: "PATCH",
    token: accessToken,
    body: input,
  });
}

export type PasswordRequestResult = {
  requested: true;
  notificationId: number;
};

export async function requestPasswordChange(
  accessToken: string,
): Promise<PasswordRequestResult> {
  return apiData<PasswordRequestResult>("/api/v1/auth/me/password-request", {
    method: "POST",
    token: accessToken,
  });
}

export type CredentialChangeType = "EMAIL" | "PASSWORD";

export type PendingCredentialRequest = {
  pk_credential_change_request: string;
  type: CredentialChangeType;
  status: "PENDING" | "APPROVED" | "REJECTED";
  requested_email: string | null;
  created_at: string;
} | null;

export function fetchPendingCredentialRequest(token: string) {
  return apiData<PendingCredentialRequest>("/api/v1/auth/me/credential-requests/pending", {
    method: "GET",
    token,
  });
}

export function createCredentialChangeRequest(
  token: string,
  input: { type: CredentialChangeType; requestedEmail?: string },
) {
  return apiData("/api/v1/auth/me/credential-requests", {
    method: "POST",
    token,
    body: input,
  });
}

export function toAuthErrorKey(error: unknown): AuthErrorKey {
  if (error instanceof ApiError) {
    if (error.status === 401) return "invalidCredentials";
    if (error.status === 403) return "accessDenied";
    if (error.status === 429) return "tooManyAttempts";
    if (error.status === 400) return "checkEmail";
    return "generic";
  }
  if (error instanceof z.ZodError) {
    return "invalidEmail";
  }
  if (error instanceof Error && error.message.includes("fetch")) {
    return "apiUnreachable";
  }
  return "generic";
}

export function toAuthErrorMessage(error: unknown): string {
  const key = toAuthErrorKey(error);
  const messages: Record<AuthErrorKey, string> = {
    invalidCredentials: "Invalid email or password.",
    tooManyAttempts: "Too many attempts. Try again later.",
    checkEmail: "Check your email and try again.",
    invalidEmail: "Enter a valid email address.",
    apiUnreachable: "Cannot reach the API. Is the backend running?",
    accessDenied: "This account cannot access the client portal.",
    generic: "Something went wrong. Please try again.",
  };
  return messages[key];
}
