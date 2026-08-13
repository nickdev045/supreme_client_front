"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { loadCatalogPageAction } from "@/app/(portal)/shop/actions";
import {
  CatalogSortMenu,
  type CatalogSortValue,
} from "@/components/shop/catalog-sort-menu";
import { ProductCard } from "@/components/shop/product-card";
import { Alert } from "@/components/ui/alert";
import { btn } from "@/components/ui/styles";
import type { StoreCatalogCard, StoreCatalogOrderBy } from "@/lib/api/types";

type CatalogFilters = {
  search: string;
  orderBy: StoreCatalogOrderBy;
  sort: "asc" | "desc";
};

type ProductCatalogListProps = {
  initialProducts: StoreCatalogCard[];
  initialPage: number;
  total: number;
  hasMore: boolean;
  filters: CatalogFilters;
  cartQuantities?: Record<string, number>;
};

function buildShopQuery(filters: CatalogFilters) {
  const params = new URLSearchParams();
  if (filters.search.trim()) params.set("q", filters.search.trim());
  const isDefaultSort = filters.orderBy === "name" && filters.sort === "asc";
  if (!isDefaultSort) {
    params.set("orderBy", filters.orderBy);
    params.set("sort", filters.sort);
  }
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

export function ProductCatalogList({
  initialProducts,
  initialPage,
  total,
  hasMore: initialHasMore,
  filters,
  cartQuantities = {},
}: ProductCatalogListProps) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setProducts(initialProducts);
    setPage(initialPage);
    setHasMore(initialHasMore);
    setError(null);
  }, [
    initialProducts,
    initialPage,
    initialHasMore,
    filters.orderBy,
    filters.sort,
    filters.search,
  ]);

  function applyFilters(next: Partial<CatalogFilters>) {
    const merged: CatalogFilters = {
      search: filters.search,
      orderBy: filters.orderBy,
      sort: filters.sort,
      ...next,
    };
    router.push(buildShopQuery(merged));
  }

  function onSortChange(value: CatalogSortValue) {
    applyFilters(value);
  }

  function onLoadMore() {
    setError(null);
    startTransition(async () => {
      const result = await loadCatalogPageAction({
        page: page + 1,
        search: filters.search || undefined,
        orderBy: filters.orderBy,
        sort: filters.sort,
      });
      if (!result.ok) {
        setError(
          result.error === "session"
            ? t("catalogSessionError")
            : result.error === "forbidden"
              ? t("catalogForbidden")
              : t("catalogLoadError"),
        );
        return;
      }
      setProducts((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        const appended = result.products.filter((item) => !seen.has(item.id));
        return [...prev, ...appended];
      });
      setPage(result.page);
      setHasMore(result.hasMore);
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <CatalogSortMenu
          orderBy={filters.orderBy}
          sort={filters.sort}
          onChange={onSortChange}
        />
        {filters.search.trim() ? (
          <button
            type="button"
            className={`${btn.outline} ${btn.sm}`}
            onClick={() => applyFilters({ search: "" })}
          >
            {t("filters.clearSearch")}
          </button>
        ) : null}
      </div>

      {filters.search.trim() ? (
        <p className="m-0 text-sm text-[var(--text-muted)]">
          {t("filters.resultsFor", { query: filters.search.trim(), count: total })}
        </p>
      ) : (
        <p className="m-0 text-sm text-[var(--text-muted)]">
          {t("filters.showingCount", { shown: products.length, total })}
        </p>
      )}

      {error ? <Alert tone="error">{error}</Alert> : null}

      {products.length === 0 ? (
        <p className="m-0 text-[var(--text-muted)]">{t("catalogEmpty")}</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              variant="catalog"
              inCartQuantity={cartQuantities[product.id] ?? 0}
            />
          ))}
        </div>
      )}

      {hasMore ? (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            disabled={pending}
            onClick={onLoadMore}
            className={btn.primary}
          >
            {pending ? t("filters.loadingMore") : t("filters.loadMore")}
          </button>
        </div>
      ) : null}
    </div>
  );
}
