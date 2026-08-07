"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setLocaleAction } from "@/i18n/actions";
import { locales, type Locale } from "@/i18n/config";

type LanguageSwitcherProps = {
  variant?: "light" | "dark";
};

export function LanguageSwitcher({ variant = "light" }: LanguageSwitcherProps) {
  const t = useTranslations("Language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const selectClass =
    variant === "dark"
      ? "rounded-md border border-[var(--cream)]/40 bg-transparent px-2 py-1 text-xs text-[var(--cream)] outline-none focus:border-[var(--cream)]"
      : "rounded-md border border-[var(--border)] bg-white px-2 py-1 text-xs text-[var(--text)] outline-none focus:border-[var(--navy)]";

  function onChange(next: string) {
    if (next === locale || !locales.includes(next as Locale)) return;
    startTransition(async () => {
      await setLocaleAction(next as Locale);
      router.refresh();
    });
  }

  return (
    <label className="inline-flex items-center gap-2">
      <span className="sr-only">{t("label")}</span>
      <select
        aria-label={t("label")}
        className={selectClass}
        disabled={pending}
        value={locale}
        onChange={(event) => onChange(event.target.value)}
      >
        {locales.map((code) => (
          <option key={code} value={code}>
            {t(code)}
          </option>
        ))}
      </select>
    </label>
  );
}
