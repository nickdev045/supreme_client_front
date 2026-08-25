"use server";

import { z } from "zod";

import { ApiError } from "@/lib/api/client";
import { confirmPasswordReset, exchangePasswordResetRef } from "@/lib/api/credentials";
import { requireAccessToken } from "@/lib/session";
import { secureUserPasswordSchema } from "@/lib/user-password";

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: "validation" | "expired" | "generic" };

export async function confirmShopPasswordResetAction(
  input: unknown,
): Promise<ResetPasswordResult> {
  const parsed = z
    .object({
      ref: z.string().uuid(),
      newPassword: secureUserPasswordSchema,
      confirmPassword: z.string().min(1),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      path: ["confirmPassword"],
    })
    .safeParse(input);

  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    const accessToken = await requireAccessToken();
    const reset = await exchangePasswordResetRef(accessToken, parsed.data.ref);
    await confirmPasswordReset({
      token: reset.token,
      newPassword: parsed.data.newPassword,
    });
    return { ok: true };
  } catch (error) {
    if (error instanceof ApiError && error.status === 400) {
      return { ok: false, error: "expired" };
    }
    return { ok: false, error: "generic" };
  }
}
