"use server";

import { z } from "zod";

import { ApiError } from "@/lib/api/client";
import { confirmPasswordReset } from "@/lib/api/credentials";
import { secureUserPasswordSchema } from "@/lib/user-password";

export type ResetPasswordResult =
  | { ok: true }
  | { ok: false; error: "validation" | "expired" | "generic" };

export async function confirmShopPasswordResetAction(
  input: unknown,
): Promise<ResetPasswordResult> {
  const parsed = z
    .object({
      ref: z.string().uuid().optional(),
      token: z.string().trim().min(1).optional(),
      newPassword: secureUserPasswordSchema,
      confirmPassword: z.string().min(1),
    })
    .refine((value) => value.newPassword === value.confirmPassword, {
      path: ["confirmPassword"],
    })
    .refine((value) => Boolean(value.ref || value.token), {
      path: ["ref"],
    })
    .safeParse(input);

  if (!parsed.success) return { ok: false, error: "validation" };

  try {
    await confirmPasswordReset({
      ref: parsed.data.ref,
      token: parsed.data.token,
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
