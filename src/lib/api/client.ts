import { getServerEnv } from "@/lib/env";
import type { ApiEnvelope, ApiErrorBody } from "@/lib/api/types";

export class ApiError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

type RequestOptions = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  token?: string;
  signal?: AbortSignal;
};

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { API_URL } = getServerEnv();
  const url = `${API_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;

  const headers: HeadersInit = {
    Accept: "application/json",
  };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(url, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    cache: "no-store",
  });

  const text = await response.text();
  let payload: unknown = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = null;
    }
  }

  if (!response.ok) {
    const err = payload as ApiErrorBody | null;
    throw new ApiError(
      response.status,
      err?.message ?? `Request failed (${response.status})`,
      err?.error,
    );
  }

  return payload as T;
}

export async function apiData<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  const envelope = await apiRequest<ApiEnvelope<T>>(path, options);
  return envelope.data;
}
