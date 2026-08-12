import { apiRequest } from "@/lib/api/client";
import type { StoreCatalogListResponse, StoreCatalogOrderBy } from "@/lib/api/types";

export type FetchStoreCatalogParams = {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: StoreCatalogOrderBy;
  sort?: "asc" | "desc";
};

export const STORE_CATALOG_PAGE_SIZE = 12;

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

  return apiRequest<StoreCatalogListResponse>(`/api/v1/customer/catalog?${query}`, {
    method: "GET",
    token,
  });
}
