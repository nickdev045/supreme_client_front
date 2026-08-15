import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { AddToCartControls } from "@/components/shop/add-to-cart-controls";
import { FavouriteToggle } from "@/components/shop/favourite-toggle";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";
import type { StoreCatalogDetail } from "@/lib/api/types";
import { formatMoney } from "@/lib/format-money";

type ProductDetailProps = {
  product: StoreCatalogDetail;
  inCartQuantity?: number;
  favouriteId?: number | null;
};

export async function ProductDetail({
  product,
  inCartQuantity = 0,
  favouriteId = null,
}: ProductDetailProps) {
  const t = await getTranslations("Shop");
  const images = product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : [];
  const available = product.stock_status === "in_stock";

  return (
    <section className="space-y-5">
      <Link
        href="/shop"
        className="inline-flex min-h-11 items-center text-sm font-semibold text-[var(--navy)]"
      >
        ← {t("productPage.back")}
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:items-start">
        <ProductImageGallery images={images} name={product.name} />

        <div className="space-y-4">
          <div>
            <h1 className="mt-0 mb-2 font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--navy)]">
              {product.name}
            </h1>
            <p className="m-0 text-sm text-[var(--text-muted)]">
              {t("productPage.unit")}: {product.unit}
            </p>
          </div>

          <p className="m-0 text-sm text-[var(--text-muted)]">
            {t("stock.quantity", { count: product.stock })}
          </p>

          <p className="m-0 text-2xl font-bold text-[var(--navy)]">
            {available ? `${formatMoney(product.price)} / ${product.unit}` : "—"}
          </p>

          <div>
            <h2 className="mt-0 mb-2 text-base font-semibold text-[var(--navy)]">
              {t("productPage.description")}
            </h2>
            <p className="m-0 whitespace-pre-wrap text-[var(--text)]">
              {product.description.trim() || t("productPage.noDescription")}
            </p>
          </div>

          <AddToCartControls
            key={`${product.id}-${inCartQuantity}`}
            productId={product.id}
            stock={product.stock}
            available={available}
            inCartQuantity={inCartQuantity}
            layout="row"
          />
          <FavouriteToggle productId={product.id} favouriteId={favouriteId} variant="detail" />
        </div>
      </div>
    </section>
  );
}
