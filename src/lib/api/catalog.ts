import { apiData, apiRequest, ApiError } from "@/lib/api/client";
import type {
  StoreCatalogDepartment,
  StoreCatalogDetail,
  StoreCatalogListResponse,
  StoreCatalogOrderBy,
} from "@/lib/api/types";
import { hasSellablePrice } from "@/lib/format-money";

export type FetchStoreCatalogParams = {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: StoreCatalogOrderBy;
  sort?: "asc" | "desc";
  fk_product_category?: string;
  fk_product_subcategory?: string;
};

export const STORE_CATALOG_PAGE_SIZE = 12;

export async function fetchStoreCatalogDepartments(token: string) {
  return apiData<StoreCatalogDepartment[]>("/api/v1/customer/catalog/categories", {
    method: "GET",
    token,
  });
}

export async function fetchStoreCatalog(
  token: string,
  params: FetchStoreCatalogParams = {},
): Promise<StoreCatalogListResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? STORE_CATALOG_PAGE_SIZE));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.orderBy) query.set("orderBy", params.orderBy);
  if (params.sort) query.set("sort", params.sort);
  if (params.fk_product_category) query.set("fk_product_category", params.fk_product_category);
  if (params.fk_product_subcategory) {
    query.set("fk_product_subcategory", params.fk_product_subcategory);
  }

  const response = await apiRequest<StoreCatalogListResponse>(`/api/v1/customer/catalog?${query}`, {
    method: "GET",
    token,
  });
  return {
    ...response,
    data: response.data.filter((product) => hasSellablePrice(product.price)),
  };
}

export async function fetchStoreProduct(token: string, id: string) {
  const product = await apiData<StoreCatalogDetail>(`/api/v1/customer/catalog/${id}`, {
    method: "GET",
    token,
  });
  if (!hasSellablePrice(product.price)) {
    throw new ApiError(404, "Product not found.");
  }
  return product;
}
