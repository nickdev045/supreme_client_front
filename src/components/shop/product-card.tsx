"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye } from "lucide-react";

import { AddToCartControls } from "@/components/shop/add-to-cart-controls";
import { CatalogInitialMark } from "@/components/shop/catalog-initial";
import { FavouriteToggle } from "@/components/shop/favourite-toggle";
import { btn } from "@/components/ui/styles";
import type { StoreCatalogCard } from "@/lib/api/types";
import { formatMoney, hasSellablePrice } from "@/lib/format-money";
import { formatClassificationLabel } from "@/lib/shop-query";

type ProductCardProps = {
  product: StoreCatalogCard;
  variant: "recommended" | "catalog";
  inCartQuantity?: number;
  favouriteId?: number | null;
};

export function ProductCard({
  product,
  variant,
  inCartQuantity = 0,
  favouriteId = null,
}: ProductCardProps) {
  const t = useTranslations("Shop");
  const available = product.stock_status === "in_stock";
  const priced = hasSellablePrice(product.price);
  const href = `/shop/products/${product.id}`;
  const classification = formatClassificationLabel(product.category, product.subcategory);

  return (
    <article className="relative flex flex-col rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg">
      <FavouriteToggle productId={product.id} favouriteId={favouriteId} />
      <Link href={href} className="block text-inherit no-underline">
        <div className="flex h-[110px] items-center justify-center overflow-hidden rounded-t-[14px] bg-[var(--shop-surface-muted)] sm:h-[140px]">
          {product.image ? (
            <img
              src={product.image}
              alt=""
              className="h-full w-full object-cover transition-transform duration-500 ease-out hover:scale-105"
            />
          ) : (
            <CatalogInitialMark name={product.name} />
          )}
        </div>
        <div className="px-2.5 pt-3 sm:px-4 sm:pt-4">
          <h3 className="m-0 line-clamp-2 text-sm font-semibold text-[var(--navy)] sm:text-base">
            {product.name}
          </h3>
          {classification ? (
            <p className="mt-1 mb-0 line-clamp-1 text-[0.75rem] text-[var(--text-muted)] sm:text-[0.8rem]">
              {classification}
            </p>
          ) : null}
        </div>
      </Link>

      <div className="flex min-w-0 flex-1 flex-col px-2.5 pt-2 pb-3 sm:px-4 sm:pb-4">
        <p className="m-0 text-[0.8rem] text-[var(--text-muted)]">
          {t("stock.quantity", { count: product.stock })}
        </p>

        {!priced || (product.stock_status === "out_of_stock" && variant === "catalog") ? (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">—</p>
        ) : variant === "recommended" ? (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">
            {product.list_price != null && product.list_price > product.price ? (
              <span className="mr-1 text-[0.8rem] font-normal text-[var(--text-muted)] line-through">
                {formatMoney(product.list_price)}
              </span>
            ) : null}
            {formatMoney(product.price)}{" "}
            <span className="text-[0.8rem] font-normal text-[var(--text-muted)]">
              / {product.unit}
            </span>
          </p>
        ) : (
          <p className="mt-2 mb-0 font-bold text-[var(--navy)]">
            {product.list_price != null && product.list_price > product.price ? (
              <span className="mr-1 text-[0.8rem] font-normal text-[var(--text-muted)] line-through">
                {formatMoney(product.list_price)}
              </span>
            ) : null}
            {formatMoney(product.price)} / {product.unit}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-3">
          <AddToCartControls
            key={`${product.id}-${inCartQuantity}`}
            productId={product.id}
            stock={product.stock}
            available={available}
            hasPrice={priced}
            inCartQuantity={inCartQuantity}
            layout="stack"
          />
          
          <Link
            href={href}
            className={`${btn.outline} ${btn.sm} min-h-11 w-full px-2 inline-flex items-center justify-center gap-2 text-center leading-tight no-underline transition-all duration-200 ease-in-out hover:border-[var(--navy)] hover:bg-[var(--navy)]/20 hover:text-[var(--navy)] group`}
          >
            <Eye className="h-4 w-4 shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
            <span>{t("productPage.viewDetails")}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}