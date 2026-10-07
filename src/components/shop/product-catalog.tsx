import { getTranslations } from "next-intl/server";

import { ProductCatalogList } from "@/components/shop/product-catalog-list";
import { StoreDepartmentNav } from "@/components/shop/store-department-nav";
import { Alert } from "@/components/ui/alert";
import { ApiError } from "@/lib/api/client";
import {
  fetchStoreCatalog,
  fetchStoreCatalogDepartments,
  STORE_CATALOG_PAGE_SIZE,
} from "@/lib/api/catalog";
import { cartQuantitiesByProductId, listStoreCarts } from "@/lib/api/cart";
import { favouriteIdsByProductId, listStoreFavourites } from "@/lib/api/favourites";
import type { StoreCatalogDepartment, StoreCatalogOrderBy } from "@/lib/api/types";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken } from "@/lib/session";
import { parseShopUuid, type ShopCatalogQuery } from "@/lib/shop-query";

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
  fk_product_category?: string;
  fk_product_subcategory?: string;
};

export async function ProductCatalog({
  search,
  orderBy: orderByParam,
  sort: sortParam,
  fk_product_category,
  fk_product_subcategory,
}: ProductCatalogProps) {
  const t = await getTranslations("Shop");
  const token = await getAccessToken();

  if (!token) {
    return <Alert tone="error">{t("catalogSessionError")}</Alert>;
  }

  const categoryId = parseShopUuid(fk_product_category);
  const subcategoryId = parseShopUuid(fk_product_subcategory);
  const filters: ShopCatalogQuery & { search: string; orderBy: StoreCatalogOrderBy; sort: "asc" | "desc" } = {
    search: search?.trim() ?? "",
    orderBy: parseOrderBy(orderByParam),
    sort: parseSort(sortParam),
    fk_product_category: categoryId,
    fk_product_subcategory: categoryId ? subcategoryId : undefined,
  };

  try {
    const catalogRequest = fetchStoreCatalog(token, {
      page: 1,
      limit: STORE_CATALOG_PAGE_SIZE,
      search: filters.search || undefined,
      orderBy: filters.orderBy,
      sort: filters.sort,
      fk_product_category: filters.fk_product_category,
      fk_product_subcategory: filters.fk_product_subcategory,
    });

    const departmentsRequest = fetchStoreCatalogDepartments(token).catch(
      (): StoreCatalogDepartment[] => [],
    );
    const cartRequest = listStoreCarts(token).catch(() => []);
    const favouritesRequest = listStoreFavourites(token).catch(() => []);

    const [response, departments, carts, favourites] = await Promise.all([
      catalogRequest,
      departmentsRequest,
      cartRequest,
      favouritesRequest,
    ]);

    const cartQuantities = cartQuantitiesByProductId(carts[0] ?? null);
    const favouriteIds = favouriteIdsByProductId(favourites);

    const products = response.data;
    const total = response.meta.total;
    const hasMore = products.length < total;
    const selectedDepartment = departments.find((item) => item.id === filters.fk_product_category);
    const listTitle = selectedDepartment?.name ?? t("allProducts");

    return (
      <div className="space-y-8">
        <StoreDepartmentNav departments={departments} filters={filters} />

        <section id="search" aria-labelledby="all-products-title">
          <h2
            id="all-products-title"
            className="mt-0 mb-4 text-[1.35rem] font-bold text-[var(--navy)]"
          >
            {listTitle}
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
