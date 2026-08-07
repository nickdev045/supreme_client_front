"use client";

import { useTranslations } from "next-intl";

export function LoginFormFallback() {
  const t = useTranslations("Common");

  return (
    <div className="w-full max-w-[420px] rounded-[14px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow)]">
      <p className="text-center text-sm text-[var(--text-muted)]">{t("loading")}</p>
    </div>
  );
}
