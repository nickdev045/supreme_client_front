"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/api/client";
import { acceptTerms } from "@/lib/api/terms";
import { getAccessToken } from "@/lib/session";

export type ActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function acceptPendingTermsAction(
  ids: number[],
): Promise<ActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "Session expired. Please sign in again." };
  try {
    for (const id of ids) {
      await acceptTerms(token, id);
    }
    revalidatePath("/shop", "layout");
    revalidatePath("/shop/terms/accept");
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError) {
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Could not record acceptance. Please try again." };
  }
}
