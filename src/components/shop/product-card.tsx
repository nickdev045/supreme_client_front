import { getTranslations } from "next-intl/server";

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

export async function ProductCard({ product, variant }: ProductCardProps) {
  const t = await getTranslations("Shop");

  return (
    <article className="overflow-hidden rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)]">
      <div className="flex h-[140px] items-center justify-center bg-[var(--shop-surface-muted)]">
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
            className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-bold text-[var(--navy)]"
          >
            {product.name.trim().charAt(0).toUpperCase() || "?"}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="m-0 text-base font-semibold text-[var(--navy)]">{product.name}</h3>

        {variant === "catalog" ? (
          <span
            className={`mt-2 inline-block rounded-full px-[0.55rem] py-[0.2rem] text-[0.72rem] font-semibold tracking-wide uppercase ${stockBadgeClass[product.stock_status]}`}
          >
            {t(`stock.${product.stock_status}`)}
          </span>
        ) : null}

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
