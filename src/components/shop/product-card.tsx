"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

import { AddToCartControls } from "@/components/shop/add-to-cart-controls";
import { btn } from "@/components/ui/styles";
import type { StoreCatalogCard } from "@/lib/api/types";
import { formatMoney } from "@/lib/format-money";

type ProductCardProps = {
  product: StoreCatalogCard;
  variant: "recommended" | "catalog";
  inCartQuantity?: number;
};

export function ProductCard({ product, variant, inCartQuantity = 0 }: ProductCardProps) {
  const t = useTranslations("Shop");
  const available = product.stock_status === "in_stock";
  const href = `/shop/products/${product.id}`;

  return (
    <article className="flex flex-col overflow-hidden rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
      <Link href={href} className="block text-inherit no-underline">
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
        <div className="px-3 pt-3 sm:px-4 sm:pt-4">
          <h3 className="m-0 line-clamp-2 text-sm font-semibold text-[var(--navy)] sm:text-base">
            {product.name}
          </h3>
        </div>
      </Link>

      <div className="flex flex-1 flex-col px-3 pt-2 pb-3 sm:px-4 sm:pb-4">
        <p className="m-0 text-[0.8rem] text-[var(--text-muted)]">
          {t("stock.quantity", { count: product.stock })}
        </p>

        {product.stock_status === "out_of_stock" && variant === "catalog" ? (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">—</p>
        ) : variant === "recommended" ? (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">
            {formatMoney(product.price)}{" "}
            <span className="text-[0.8rem] font-normal text-[var(--text-muted)]">
              / {product.unit}
            </span>
          </p>
        ) : (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">
            {formatMoney(product.price)} / {product.unit}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <AddToCartControls
            key={`${product.id}-${inCartQuantity}`}
            productId={product.id}
            stock={product.stock}
            available={available}
            inCartQuantity={inCartQuantity}
            layout="stack"
          />
          <Link
            href={href}
            className={`${btn.outline} ${btn.sm} min-h-11 w-full no-underline`}
          >
            {t("productPage.viewDetails")}
          </Link>
        </div>
      </div>
    </article>
  );
}
