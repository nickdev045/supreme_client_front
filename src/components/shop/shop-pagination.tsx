"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ShopPagination({
  page,
  pageSize,
  total,
}: {
  page: number;
  pageSize: number;
  total: number;
}) {
  const t = useTranslations("Shop"); // O tu namespace correspondiente para la paginación de la tienda
  const currentPathname = usePathname();
  const searchParams = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(page, 1), totalPages);
  if (totalPages <= 1) return null;

  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (targetPage > 1) {
      params.set("page", String(targetPage));
    } else {
      params.delete("page");
    }
    const qs = params.toString();
    return qs ? `${currentPathname}?${qs}` : currentPathname;
  };

  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];

    for (
      let i = Math.max(2, current - delta);
      i <= Math.min(totalPages - 1, current + delta);
      i++
    ) {
      range.push(i);
    }

    if (current - delta > 2) {
      rangeWithDots.push(1, "...");
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (current + delta < totalPages - 1) {
      rangeWithDots.push("...", totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const pages = totalPages <= 5 ? Array.from({ length: totalPages }, (_, i) => i + 1) : getPageNumbers();

  return (
    <nav 
      aria-label="Catalog Pagination" 
      className="flex items-center justify-center gap-1.5 sm:gap-2 my-10 py-4 px-6 w-full text-sm select-none"
    >
      {/* Botón Anterior (traducido con next-intl) */}
      {current > 1 ? (
        <Link
          href={buildHref(current - 1)}
          className="group flex items-center gap-1.5 px-3 py-2 font-medium text-foreground transition-colors hover:text-primary rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span className="hidden sm:inline underline-offset-4 group-hover:underline">
            {t("pagination.previous") || t("previous") || "Anterior"}
          </span>
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-2 font-medium text-muted-foreground/40 cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">
            {t("pagination.previous") || t("previous") || "Anterior"}
          </span>
        </span>
      )}

      {/* Círculos numéricos */}
      <div className="flex items-center gap-1.5 px-2">
        {pages.map((p, index) => {
          if (p === "...") {
            return (
              <span key={`dots-${index}`} className="px-2 text-muted-foreground font-medium">
                ...
              </span>
            );
          }

          const pageNum = Number(p);
          const isCurrent = pageNum === current;

          return isCurrent ? (
            <span
              key={pageNum}
              aria-current="page"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] font-semibold text-white shadow-md text-xs transition-all scale-105"
            >
              {pageNum}
            </span>
          ) : (
            <Link
              key={pageNum}
              href={buildHref(pageNum)}
              className="flex h-9 w-9 items-center justify-center rounded-full font-medium text-foreground hover:bg-black/[0.05] dark:hover:bg-white/[0.08] transition-all text-xs"
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Botón Siguiente (traducido con next-intl) */}
      {current < totalPages ? (
        <Link
          href={buildHref(current + 1)}
          className="group flex items-center gap-1.5 px-3 py-2 font-medium text-foreground transition-colors hover:text-primary rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.03]"
        >
          <span className="hidden sm:inline underline-offset-4 group-hover:underline">
            {t("pagination.next") || t("next") || "Siguiente"}
          </span>
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-2 font-medium text-muted-foreground/40 cursor-not-allowed">
          <span className="hidden sm:inline">
            {t("pagination.next") || t("next") || "Siguiente"}
          </span>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}