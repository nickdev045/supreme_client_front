"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

import type { StoreCatalogOrderBy } from "@/lib/api/types";

export type CatalogSortOptionId = "relevant" | "price_asc" | "price_desc";

export type CatalogSortValue = {
  orderBy: StoreCatalogOrderBy;
  sort: "asc" | "desc";
};

const SORT_OPTIONS: CatalogSortOptionId[] = ["relevant", "price_asc", "price_desc"];

export function toCatalogSortOption(
  orderBy: StoreCatalogOrderBy,
  sort: "asc" | "desc",
): CatalogSortOptionId {
  if (orderBy === "sale_price" && sort === "asc") return "price_asc";
  if (orderBy === "sale_price" && sort === "desc") return "price_desc";
  return "relevant";
}

export function fromCatalogSortOption(option: CatalogSortOptionId): CatalogSortValue {
  if (option === "price_asc") return { orderBy: "sale_price", sort: "asc" };
  if (option === "price_desc") return { orderBy: "sale_price", sort: "desc" };
  return { orderBy: "name", sort: "asc" };
}

type CatalogSortMenuProps = {
  orderBy: StoreCatalogOrderBy;
  sort: "asc" | "desc";
  onChange: (value: CatalogSortValue) => void;
};

export function CatalogSortMenu({ orderBy, sort, onChange }: CatalogSortMenuProps) {
  const t = useTranslations("Shop.filters");
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const selected = toCatalogSortOption(orderBy, sort);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex flex-wrap items-center gap-2 text-[0.95rem]">
      <span className="font-semibold text-[var(--text)]">{t("sortBy")}</span>
      <button
        type="button"
        className="inline-flex items-center gap-2 rounded-[10px] border-2 border-[var(--navy)] bg-[var(--navy)] px-3.5 py-2 text-sm font-semibold text-[var(--cream)] transition hover:bg-[var(--navy-light)] hover:border-[var(--navy-light)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--navy)]"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{t(`sortOptions.${selected}`)}</span>
        <span aria-hidden className="text-[0.7rem] leading-none opacity-90">
          {open ? "▴" : "▾"}
        </span>
      </button>

      {open ? (
        <div
          id={menuId}
          role="listbox"
          aria-label={t("sortBy")}
          className="absolute top-[calc(100%+0.35rem)] left-0 z-[40] w-[min(220px,calc(100vw-2rem))] overflow-hidden rounded-[10px] border border-[var(--border)] bg-white shadow-[var(--shadow)] divide-y divide-[var(--border)]"
        >
          {SORT_OPTIONS.map((option) => {
            const active = option === selected;
            return (
              <button
                key={option}
                type="button"
                role="option"
                aria-selected={active}
                className={[
                  "relative flex w-full items-center border-0 bg-transparent px-4 py-3 text-left text-[0.95rem] transition",
                  active
                    ? "bg-[rgba(26,43,76,0.06)] font-semibold text-[var(--navy)]"
                    : "font-normal text-[var(--text)] hover:bg-[var(--cream)]",
                ].join(" ")}
                onClick={() => {
                  onChange(fromCatalogSortOption(option));
                  setOpen(false);
                }}
              >
                {active ? (
                  <span
                    aria-hidden
                    className="absolute top-0 bottom-0 left-0 w-[3px] bg-[var(--navy)]"
                  />
                ) : null}
                {t(`sortOptions.${option}`)}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
