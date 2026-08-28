"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { FormEvent, useState } from "react";

import { btn, fieldClass, labelClass } from "@/components/ui/styles";

export function RequestForm() {
  const t = useTranslations("Request");
  const tBrand = useTranslations("Brand");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    // UI-only for now — team reviews requests offline until an API exists.
    await new Promise((resolve) => setTimeout(resolve, 400));
    setSubmitted(true);
    setBusy(false);
  }

  if (submitted) {
    return (
      <div className="w-full max-w-[480px] rounded-[14px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow)]">
        <div className="mb-4 text-center">
          <Image
            src="/logo.png"
            alt={tBrand("name")}
            width={72}
            height={72}
            className="mx-auto mb-3 h-[72px] w-[72px] rounded-full object-cover"
            priority
          />
          <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--navy)]">
            {t("successTitle")}
          </h1>
          <p className="mt-2 text-[0.9rem] text-[var(--text-muted)]">{t("successBody")}</p>
        </div>
        <Link href="/login" className={`${btn.primary} w-full`}>
          {t("backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[480px] rounded-[14px] border border-[var(--border)] bg-white p-8 shadow-[var(--shadow)]">
      <div className="mb-6 text-center">
        <Image
          src="/logo.png"
          alt={tBrand("name")}
          width={72}
          height={72}
          className="mx-auto mb-3 h-[72px] w-[72px] rounded-full object-cover"
          priority
        />
        <h1 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--navy)]">
          {t("title")}
        </h1>
        <p className="mt-1 text-[0.9rem] text-[var(--text-muted)]">{t("subtitle")}</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="businessName" className={labelClass}>
            {t("businessName")}
          </label>
          <input
            id="businessName"
            name="businessName"
            type="text"
            required
            placeholder={t("businessNamePlaceholder")}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="contactName" className={labelClass}>
            {t("contactName")}
          </label>
          <input
            id="contactName"
            name="contactName"
            type="text"
            required
            placeholder={t("contactNamePlaceholder")}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="contactEmail" className={labelClass}>
            {t("contactEmail")}
          </label>
          <input
            id="contactEmail"
            name="contactEmail"
            type="email"
            required
            autoComplete="email"
            placeholder={t("contactEmailPlaceholder")}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="phone" className={labelClass}>
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder={t("phonePlaceholder")}
            className={fieldClass}
          />
        </div>

        <div>
          <label htmlFor="notes" className={labelClass}>
            {t("notes")}
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder={t("notesPlaceholder")}
            className={fieldClass}
          />
        </div>

        <button type="submit" disabled={busy} className={`${btn.primary} w-full`}>
          {busy ? t("submitting") : t("submit")}
        </button>
      </form>

      <p className="mt-4 mb-0 text-center text-[0.88rem] text-[var(--text-muted)]">
        {t("haveAccount")}{" "}
        <Link href="/login" className="font-semibold text-[var(--navy)]">
          {t("signInLink")}
        </Link>
      </p>
    </div>
  );
}
