import { redirect } from "next/navigation";

import { ApiError } from "@/lib/api/client";

/** Redirect to login when the backend rejects an expired or invalid session. */
export function handleUnauthorized(error: unknown): never {
  if (error instanceof ApiError && error.status === 401) {
    redirect("/login?error=SessionExpired");
  }
  throw error;
}
