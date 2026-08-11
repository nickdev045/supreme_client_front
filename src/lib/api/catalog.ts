import { apiRequest } from "@/lib/api/client";
import type { StoreCatalogListResponse } from "@/lib/api/types";

export type FetchStoreCatalogParams = {
  page?: number;
  limit?: number;
  search?: string;
  orderBy?: "name" | "unit_price" | "created_at";
  sort?: "asc" | "desc";
};

export async function fetchStoreCatalog(
  token: string,
  params: FetchStoreCatalogParams = {},
): Promise<StoreCatalogListResponse> {
  const query = new URLSearchParams();
  query.set("page", String(params.page ?? 1));
  query.set("limit", String(params.limit ?? 50));
  if (params.search?.trim()) query.set("search", params.search.trim());
  if (params.orderBy) query.set("orderBy", params.orderBy);
  if (params.sort) query.set("sort", params.sort);

  return apiRequest<StoreCatalogListResponse>(`/api/v1/customer/catalog?${query}`, {
    method: "GET",
    token,
  });
}
