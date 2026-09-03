"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { acceptPendingTermsAction } from "@/app/(portal)/shop/terms/actions";
import type { ApiTermsCondition } from "@/lib/api/terms";

export function StoreTermsAcceptClient({
  pending,
}: {
  pending: ApiTermsCondition[];
}) {
  const t = useTranslations("Terms");
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingSubmit, startTransition] = useTransition();
  const [activeId, setActiveId] = useState(pending[0]?.pk_terms_condition ?? null);
  const active = pending.find((row) => row.pk_terms_condition === activeId) ?? pending[0];

  function onAccept() {
    if (!checked) {
      setError(t("mustCheck"));
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await acceptPendingTermsAction(
        pending.map((row) => row.pk_terms_condition),
      );
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.replace("/shop");
      router.refresh();
    });
  }

  if (!active) {
    return (
      <div className="rounded-xl border border-[var(--border)] bg-white p-6">
        <p>{t("nonePending")}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <div className="space-y-4 rounded-xl border border-[var(--border)] bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-xl font-semibold text-[var(--navy)]">{t("acceptTitle")}</h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t("acceptSubtitle")}</p>
        </div>
        {error ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-2">
          {pending.map((row) => (
            <button
              key={row.pk_terms_condition}
              type="button"
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                row.pk_terms_condition === active.pk_terms_condition
                  ? "border-[var(--navy)] bg-[var(--cream)] font-semibold text-[var(--navy)]"
                  : "border-[var(--border)] text-[var(--text)]"
              }`}
              onClick={() => setActiveId(row.pk_terms_condition)}
            >
              {row.title}
              <span className="ml-1 text-xs text-[var(--text-muted)]">
                ({row.jurisdiction})
              </span>
            </button>
          ))}
        </div>
        <article className="max-h-[45vh] overflow-y-auto whitespace-pre-wrap rounded-lg border border-[var(--border)] bg-[var(--shop-surface)] p-4 text-sm leading-relaxed text-[var(--text)]">
          {active.description}
        </article>
        <label className="flex items-start gap-2 text-sm text-[var(--text)]">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 accent-[var(--navy)]"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            disabled={pendingSubmit}
          />
          <span>{t("acceptCheckbox", { count: pending.length })}</span>
        </label>
        <button
          type="button"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-[10px] bg-[var(--navy)] px-4 py-2.5 text-sm font-semibold text-[var(--cream)] transition-colors hover:bg-[var(--navy-hover)] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          disabled={pendingSubmit || !checked}
          onClick={onAccept}
        >
          {pendingSubmit ? t("accepting") : t("acceptCta")}
        </button>
      </div>
    </div>
  );
}
