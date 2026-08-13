import { ApiError } from "@/lib/api/client";
import { getServerEnv } from "@/lib/env";

export type UploadedImage = {
  key: string;
  url: string;
};

function toAbsoluteUrl(url: string) {
  if (/^https?:\/\//i.test(url)) return url;
  const { API_URL } = getServerEnv();
  const base = API_URL.replace(/\/$/, "");
  return `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

/** Upload an image via multipart to the API storage. */
export async function uploadImage(token: string, file: File): Promise<UploadedImage> {
  const { API_URL } = getServerEnv();
  const url = `${API_URL.replace(/\/$/, "")}/api/v1/uploads/images`;

  const body = new FormData();
  body.append("file", file);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    body,
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
    const err = payload as { message?: string; error?: string } | null;
    throw new ApiError(
      response.status,
      err?.message ?? `Upload failed (${response.status})`,
      err?.error,
    );
  }

  const envelope = payload as { data: UploadedImage };
  return {
    key: envelope.data.key,
    url: toAbsoluteUrl(envelope.data.url),
  };
}
