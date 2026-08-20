"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
import { FormEvent, useRef, useState, type ChangeEvent } from "react";

import { confirmShopPasswordResetAction } from "@/app/reset-password/actions";
import { Alert } from "@/components/ui/alert";
import { PasswordVisibilityButton } from "@/components/ui/password-visibility-button";
import { btn, fieldClass, labelClass } from "@/components/ui/styles";
import {
  USER_PASSWORD_MAX_LENGTH,
  USER_PASSWORD_MIN_LENGTH,
  USER_PASSWORD_PATTERN,
} from "@/lib/user-password";

function RequirementIcon({ met }: { met: boolean }) {
  return met ? (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2">
      <path d="M3 8.5l3 3 7-7" />
    </svg>
  ) : (
    <svg aria-hidden="true" viewBox="0 0 16 16" className="h-3.5 w-3.5 fill-current">
      <circle cx="8" cy="8" r="2" />
    </svg>
  );
}

export function ShopResetPasswordForm({ refId, token }: { refId?: string; token?: string }) {
  const t = useTranslations("Shop");
  const confirmationRef = useRef<HTMLInputElement>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const requirements = [
    { key: "length", met: newPassword.length >= USER_PASSWORD_MIN_LENGTH },
    { key: "uppercase", met: /[A-Z]/.test(newPassword) },
    { key: "lowercase", met: /[a-z]/.test(newPassword) },
    { key: "number", met: /\d/.test(newPassword) },
    { key: "symbol", met: /[^A-Za-z0-9]/.test(newPassword) },
  ] as const;

  function updatePassword(nextPassword: string) {
    confirmationRef.current?.setCustomValidity(
      confirmPassword && confirmPassword !== nextPassword ? t("passwordMismatch") : "",
    );
    setNewPassword(nextPassword);
  }

  function updateConfirmation(event: ChangeEvent<HTMLInputElement>) {
    const nextConfirmation = event.target.value;
    event.target.setCustomValidity(nextConfirmation === newPassword ? "" : t("passwordMismatch"));
    setConfirmPassword(nextConfirmation);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setBusy(true);
    setErrorKey(null);
    try {
      const result = await confirmShopPasswordResetAction({
        ref: refId,
        token,
        newPassword,
        confirmPassword,
      });
      if (!result.ok) {
        setErrorKey(result.error);
        return;
      }
      setDone(true);
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
      await signOut({ callbackUrl: "/login?passwordReset=1", redirect: true });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {done ? <Alert tone="success">{t("resetSuccess")}</Alert> : null}
      {errorKey ? <Alert tone="error">{t(`resetPasswordErrors.${errorKey}`)}</Alert> : null}

      <div className="space-y-1.5">
        <label htmlFor="reset-new-password" className={labelClass}>
          {t("resetNewPassword")}
        </label>
        <div className="relative">
          <input
            id="reset-new-password"
            type={showNewPassword ? "text" : "password"}
            required
            minLength={USER_PASSWORD_MIN_LENGTH}
            maxLength={USER_PASSWORD_MAX_LENGTH}
            pattern={USER_PASSWORD_PATTERN}
            autoComplete="new-password"
            value={newPassword}
            onChange={(event) => updatePassword(event.target.value)}
            disabled={busy || done}
            aria-describedby="reset-password-requirements"
            className={`${fieldClass} pr-12`}
          />
          <PasswordVisibilityButton
            visible={showNewPassword}
            onClick={() => setShowNewPassword((current) => !current)}
            label={showNewPassword ? t("hidePassword") : t("showPassword")}
            disabled={busy}
          />
        </div>
        <ul
          id="reset-password-requirements"
          className="grid gap-x-4 gap-y-1 text-xs sm:grid-cols-2"
          aria-live="polite"
        >
          {requirements.map((requirement) => (
            <li
              key={requirement.key}
              className={`flex items-center gap-1.5 ${
                requirement.met ? "text-emerald-700" : "text-[var(--text-muted)]"
              }`}
            >
              <RequirementIcon met={requirement.met} />
              {t(`passwordRequirements.${requirement.key}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="reset-confirm-password" className={labelClass}>
          {t("resetConfirmPassword")}
        </label>
        <div className="relative">
          <input
            ref={confirmationRef}
            id="reset-confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            required
            minLength={USER_PASSWORD_MIN_LENGTH}
            maxLength={USER_PASSWORD_MAX_LENGTH}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={updateConfirmation}
            disabled={busy || done}
            className={`${fieldClass} pr-12`}
          />
          <PasswordVisibilityButton
            visible={showConfirmPassword}
            onClick={() => setShowConfirmPassword((current) => !current)}
            label={showConfirmPassword ? t("hidePassword") : t("showPassword")}
            disabled={busy}
          />
        </div>
      </div>

      <button type="submit" disabled={busy || done} className={`${btn.primary} w-full`}>
        {busy ? t("resetSaving") : t("resetSubmit")}
      </button>
      <p className="text-center text-sm">
        <Link href="/login" className="font-semibold text-[var(--navy)] underline">
          {t("backToLogin")}
        </Link>
      </p>
    </form>
  );
}
