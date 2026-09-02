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
  | "generic"
  | "Configuration";

export type DiscoverTenantsResult =
  | { ok: true; tenants: ApiTenant[] }
  | { ok: false; errorKey: AuthErrorKey };

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

function isApiError(error: unknown): error is ApiError {
  return (
    error instanceof ApiError ||
    (typeof error === "object" &&
      error !== null &&
      (error as { name?: string }).name === "ApiError" &&
      typeof (error as { status?: unknown }).status === "number")
  );
}

function isUnreachableError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    error.name === "TimeoutError" ||
    error.name === "AbortError" ||
    message.includes("fetch") ||
    message.includes("timeout") ||
    message.includes("aborted") ||
    message.includes("econnrefused") ||
    message.includes("enotfound")
  );
}

export function toAuthErrorKey(error: unknown): AuthErrorKey {
  if (isApiError(error)) {
    if (error.status === 401) return "invalidCredentials";
    if (error.status === 403) return "accessDenied";
    if (error.status === 429) return "tooManyAttempts";
    if (error.status === 400) return "checkEmail";
    if (error.status === 404 || error.status >= 500) return "apiUnreachable";
    return "generic";
  }
  if (error instanceof z.ZodError) {
    return "invalidEmail";
  }
  if (error instanceof Error) {
    if (error.message.startsWith("Invalid environment")) return "Configuration";
    if (isUnreachableError(error)) return "apiUnreachable";
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
    Configuration: "Authentication is not configured. Check environment variables.",
  };
  return messages[key];
}
