"use client";

import { useTranslations } from "next-intl";

import type { StoreCatalogCard, StoreStockStatus } from "@/lib/api/types";

const stockBadgeClass: Record<StoreStockStatus, string> = {
  in_stock: "bg-[rgba(61,122,74,0.15)] text-[var(--leaf)]",
  out_of_stock: "bg-[rgba(199,62,46,0.12)] text-[var(--tomato)]",
};

type ProductCardProps = {
  product: StoreCatalogCard;
  /** Recommended cards omit stock badge; catalog cards show it. */
  variant: "recommended" | "catalog";
};

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export function ProductCard({ product, variant }: ProductCardProps) {
  const t = useTranslations("Shop");

  return (
    <article className="overflow-hidden rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
      <div className="flex h-[110px] items-center justify-center bg-[var(--shop-surface-muted)] sm:h-[140px]">
        {product.image ? (
          // Product image hosts vary by upload/CDN config.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-white text-lg font-bold text-[var(--navy)] sm:h-16 sm:w-16 sm:text-xl"
          >
            {product.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="p-3 sm:p-4">
        <h3 className="m-0 line-clamp-2 text-sm font-semibold text-[var(--navy)] sm:text-base">
          {product.name}
        </h3>

        {variant === "catalog" ? (
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={`inline-block rounded-full px-[0.55rem] py-[0.2rem] text-[0.72rem] font-semibold tracking-wide uppercase ${stockBadgeClass[product.stock_status]}`}
            >
              {t(`stock.${product.stock_status}`)}
            </span>
            <span className="text-[0.8rem] text-[var(--text-muted)]">
              {t("stock.quantity", { count: product.stock })}
            </span>
          </div>
        ) : (
          <p className="mt-1 mb-0 text-[0.8rem] text-[var(--text-muted)]">
            {t("stock.quantity", { count: product.stock })}
          </p>
        )}

        {product.stock_status === "out_of_stock" && variant === "catalog" ? (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">—</p>
        ) : variant === "recommended" ? (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">
            {formatPrice(product.price)}{" "}
            <span className="text-[0.8rem] font-normal text-[var(--text-muted)]">
              / {product.unit}
            </span>
          </p>
        ) : (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">
            {formatPrice(product.price)} / {product.unit}
          </p>
        )}
      </div>
    </article>
  );
}
