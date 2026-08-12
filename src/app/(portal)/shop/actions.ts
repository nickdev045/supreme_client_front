"use server";

import { fetchStoreCatalog, STORE_CATALOG_PAGE_SIZE } from "@/lib/api/catalog";
import { ApiError } from "@/lib/api/client";
import type { StoreCatalogCard, StoreCatalogOrderBy } from "@/lib/api/types";
import { getAccessToken } from "@/lib/session";

export type LoadCatalogPageInput = {
  page: number;
  search?: string;
  orderBy?: StoreCatalogOrderBy;
  sort?: "asc" | "desc";
  limit?: number;
};

export type LoadCatalogPageResult =
  | {
      ok: true;
      products: StoreCatalogCard[];
      page: number;
      total: number;
      hasMore: boolean;
    }
  | { ok: false; error: "session" | "forbidden" | "generic" };

export async function loadCatalogPageAction(
  input: LoadCatalogPageInput,
): Promise<LoadCatalogPageResult> {
  const token = await getAccessToken();
  if (!token) {
    return { ok: false, error: "session" };
  }

  const page = Number.isFinite(input.page) && input.page > 0 ? Math.floor(input.page) : 1;
  const limit =
    Number.isFinite(input.limit) && (input.limit ?? 0) > 0
      ? Math.min(Math.floor(input.limit!), 100)
      : STORE_CATALOG_PAGE_SIZE;

  try {
    const response = await fetchStoreCatalog(token, {
      page,
      limit,
      search: input.search,
      orderBy: input.orderBy ?? "name",
      sort: input.sort ?? "asc",
    });
    const loaded = page * limit;
    return {
      ok: true,
      products: response.data,
      page: response.meta.page,
      total: response.meta.total,
      hasMore: loaded < response.meta.total,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, error: "forbidden" };
    }
    return { ok: false, error: "generic" };
  }
}
