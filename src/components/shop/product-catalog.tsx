import { getTranslations } from "next-intl/server";

import { ProductCard } from "@/components/shop/product-card";
import { ProductCatalogList } from "@/components/shop/product-catalog-list";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/lib/api/client";
import { fetchStoreCatalog, STORE_CATALOG_PAGE_SIZE } from "@/lib/api/catalog";
import { cartQuantitiesByProductId, listStoreCarts } from "@/lib/api/cart";
import { favouriteIdsByProductId, listStoreFavourites } from "@/lib/api/favourites";
import type { StoreCatalogOrderBy } from "@/lib/api/types";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken } from "@/lib/session";

const RECOMMENDED_COUNT = 3;

const ORDER_BY_VALUES = ["name", "sale_price", "created_at"] as const;
const SORT_VALUES = ["asc", "desc"] as const;

function parseOrderBy(value: string | undefined): StoreCatalogOrderBy {
  if (value && (ORDER_BY_VALUES as readonly string[]).includes(value)) {
    return value as StoreCatalogOrderBy;
  }
  return "name";
}

function parseSort(value: string | undefined): "asc" | "desc" {
  if (value && (SORT_VALUES as readonly string[]).includes(value)) {
    return value as "asc" | "desc";
  }
  return "asc";
}

export type ProductCatalogProps = {
  search?: string;
  orderBy?: string;
  sort?: string;
};

export async function ProductCatalog({
  search,
  orderBy: orderByParam,
  sort: sortParam,
}: ProductCatalogProps) {
  const t = await getTranslations("Shop");
  const token = await getAccessToken();

  if (!token) {
    return <Alert tone="error">{t("catalogSessionError")}</Alert>;
  }

  const filters = {
    search: search?.trim() ?? "",
    orderBy: parseOrderBy(orderByParam),
    sort: parseSort(sortParam),
  };

  try {
    const catalogRequest = fetchStoreCatalog(token, {
      page: 1,
      limit: STORE_CATALOG_PAGE_SIZE,
      search: filters.search || undefined,
      orderBy: filters.orderBy,
      sort: filters.sort,
    });

    // Hide recommendations while searching; keep them when only sorting/filtering.
    const recommendedRequest = filters.search
      ? Promise.resolve(null)
      : fetchStoreCatalog(token, {
          page: 1,
          limit: RECOMMENDED_COUNT,
          orderBy: "name",
          sort: "asc",
        });

    const cartRequest = listStoreCarts(token).catch(() => []);
    const favouritesRequest = listStoreFavourites(token).catch(() => []);

    const [response, recommendedResponse, carts, favourites] = await Promise.all([
      catalogRequest,
      recommendedRequest,
      cartRequest,
      favouritesRequest,
    ]);

    const cartQuantities = cartQuantitiesByProductId(carts[0] ?? null);
    const favouriteIds = favouriteIdsByProductId(favourites);

    const products = response.data;
    const total = response.meta.total;
    const hasMore = products.length < total;
    const recommended = recommendedResponse?.data.slice(0, RECOMMENDED_COUNT) ?? [];

    return (
      <div className="space-y-8">
        {recommended.length > 0 ? (
          <section id="recommended" aria-labelledby="recommended-title">
            <h2
              id="recommended-title"
              className="mt-0 mb-4 text-[1.35rem] font-bold text-[var(--navy)]"
            >
              {t("recommendedForYou")}
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {recommended.map((product) => (
                <ProductCard
                  key={`rec-${product.id}`}
                  product={product}
                  variant="recommended"
                  inCartQuantity={cartQuantities[product.id] ?? 0}
                  favouriteId={favouriteIds[product.id] ?? null}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section id="search" aria-labelledby="all-products-title">
          <h2
            id="all-products-title"
            className="mt-0 mb-4 text-[1.35rem] font-bold text-[var(--navy)]"
          >
            {t("allProducts")}
          </h2>

          <ProductCatalogList
            initialProducts={products}
            initialPage={response.meta.page}
            total={total}
            hasMore={hasMore}
            filters={filters}
            cartQuantities={cartQuantities}
            favouriteIds={favouriteIds}
          />
        </section>
      </div>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      handleUnauthorized(error);
    }
    if (error instanceof ApiError && error.status === 403) {
      return <Alert tone="error">{t("catalogForbidden")}</Alert>;
    }
    return <Alert tone="error">{t("catalogLoadError")}</Alert>;
  }
}
