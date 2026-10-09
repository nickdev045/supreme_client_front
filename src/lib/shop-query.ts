import type { StoreCatalogClassification, StoreCatalogOrderBy } from "@/lib/api/types";

export type ShopCatalogQuery = {
  search?: string;
  orderBy?: StoreCatalogOrderBy;
  sort?: "asc" | "desc";
  fk_product_category?: string;
  fk_product_subcategory?: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function formatClassificationLabel(
  category?: StoreCatalogClassification | { name: string } | null,
  subcategory?: StoreCatalogClassification | { name: string } | null,
) {
  const categoryName = category?.name.trim() ?? "";
  const subcategoryName = subcategory?.name.trim() ?? "";
  if (categoryName && subcategoryName) return `${categoryName} · ${subcategoryName}`;
  return categoryName || subcategoryName;
}

export function parseShopUuid(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed || !UUID_PATTERN.test(trimmed)) return undefined;
  return trimmed;
}

export function buildShopHref(query: ShopCatalogQuery) {
  const params = new URLSearchParams();
  if (query.search?.trim()) params.set("q", query.search.trim());
  const isDefaultSort = (query.orderBy ?? "name") === "name" && (query.sort ?? "asc") === "asc";
  if (!isDefaultSort && query.orderBy && query.sort) {
    params.set("orderBy", query.orderBy);
    params.set("sort", query.sort);
  }
  if (query.fk_product_category) params.set("fk_product_category", query.fk_product_category);
  if (query.fk_product_subcategory) {
    params.set("fk_product_subcategory", query.fk_product_subcategory);
  }
  const qs = params.toString();
  return qs ? `/shop?${qs}` : "/shop";
}
