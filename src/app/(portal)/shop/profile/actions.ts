"use server";

import { z } from "zod";

import { updateMe, requestPasswordChange } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import type { ApiMeData } from "@/lib/api/types";
import { uploadImage } from "@/lib/api/uploads";
import { getAccessToken } from "@/lib/session";

const profileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(145),
    lastName: z.string().trim().min(1).max(145),
    photoUrl: z.union([z.string().url(), z.literal(""), z.null()]).optional(),
  })
  .strict();

export type ProfileActionErrorKey =
  | "session"
  | "validation"
  | "forbidden"
  | "rateLimited"
  | "noAdmins"
  | "uploadForbidden"
  | "uploadInvalid"
  | "uploadTooLarge"
  | "generic";

export type UpdateProfileResult =
  | { ok: true; profile: ApiMeData }
  | { ok: false; errorKey: ProfileActionErrorKey };

export type UploadPhotoResult =
  | { ok: true; photoUrl: string }
  | { ok: false; errorKey: ProfileActionErrorKey };

export type PasswordRequestActionResult =
  | { ok: true }
  | { ok: false; errorKey: ProfileActionErrorKey };

function mapApiError(error: unknown, upload = false): ProfileActionErrorKey {
  if (error instanceof ApiError) {
    if (error.status === 401) return "session";
    if (error.status === 403) return upload ? "uploadForbidden" : "forbidden";
    if (error.status === 413) return "uploadTooLarge";
    if (error.status === 415) return "uploadInvalid";
    if (error.status === 422) return "noAdmins";
    if (error.status === 429) return "rateLimited";
    if (error.status === 400) return upload ? "uploadInvalid" : "validation";
  }
  return "generic";
}

export async function updateProfileAction(input: {
  firstName: string;
  lastName: string;
  photoUrl?: string | null;
}): Promise<UpdateProfileResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, errorKey: "session" };

  const parsed = profileSchema.safeParse({
    firstName: input.firstName,
    lastName: input.lastName,
    photoUrl: input.photoUrl ?? null,
  });
  if (!parsed.success) {
    return { ok: false, errorKey: "validation" };
  }

  try {
    const photoUrl =
      parsed.data.photoUrl === "" || parsed.data.photoUrl === undefined
        ? null
        : parsed.data.photoUrl;
    const profile = await updateMe(token, {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      photoUrl,
    });
    return { ok: true, profile };
  } catch (error) {
    return { ok: false, errorKey: mapApiError(error) };
  }
}

export async function uploadProfilePhotoAction(
  formData: FormData,
): Promise<UploadPhotoResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, errorKey: "session" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, errorKey: "uploadInvalid" };
  }

  try {
    const uploaded = await uploadImage(token, file);
    return { ok: true, photoUrl: uploaded.url };
  } catch (error) {
    return { ok: false, errorKey: mapApiError(error, true) };
  }
}

export async function requestPasswordChangeAction(): Promise<PasswordRequestActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, errorKey: "session" };

  try {
    await requestPasswordChange(token);
    return { ok: true };
  } catch (error) {
    return { ok: false, errorKey: mapApiError(error) };
  }
}
