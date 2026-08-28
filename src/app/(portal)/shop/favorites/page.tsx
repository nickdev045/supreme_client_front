import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ProductCard } from "@/components/shop/product-card";
import { Alert } from "@/components/ui/alert";
import { btn } from "@/components/ui/styles";
import { cartQuantitiesByProductId, listStoreCarts } from "@/lib/api/cart";
import { ApiError } from "@/lib/api/client";
import {
  favouriteToCatalogCard,
  listStoreFavourites,
} from "@/lib/api/favourites";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken } from "@/lib/session";
import Link from "next/link";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("favoritesTitle"),
    description: t("favoritesDescription"),
  };
}

export default async function ShopFavoritesPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");
  const t = await getTranslations("Shop");

  try {
    const [favourites, carts] = await Promise.all([
      listStoreFavourites(token),
      listStoreCarts(token).catch(() => []),
    ]);
    const cartQuantities = cartQuantitiesByProductId(carts[0] ?? null);
    const products = favourites.map((favourite) => ({
      product: favouriteToCatalogCard(favourite),
      favouriteId: favourite.pk_user_favourite,
    }));

    return (
      <section className="space-y-4">
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-[var(--navy)] sm:text-2xl">
            {t("favoritesPage.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t("favoritesPage.subtitle")}</p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] px-4 py-10 text-center">
            <p className="m-0 text-sm text-[var(--text-muted)]">{t("favoritesPage.empty")}</p>
            <Link href="/shop" className={`${btn.primary} mt-4 inline-flex min-h-11 no-underline`}>
              {t("cartPage.emptyCta")}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map(({ product, favouriteId }) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="catalog"
                inCartQuantity={cartQuantities[product.id] ?? 0}
                favouriteId={favouriteId}
              />
            ))}
          </div>
        )}
      </section>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleUnauthorized(error);
    }
    if (error instanceof ApiError && error.status === 403) {
      return <Alert tone="error">{t("favoritesPage.forbidden")}</Alert>;
    }
    return <Alert tone="error">{t("favoritesPage.loadError")}</Alert>;
  }
}
