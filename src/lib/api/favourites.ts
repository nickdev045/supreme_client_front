import { apiData, apiRequest } from "@/lib/api/client";
import type { StoreCatalogCard, StoreFavourite } from "@/lib/api/types";
import { toMoneyNumber } from "@/lib/format-money";

export function listStoreFavourites(token: string) {
  return apiData<StoreFavourite[]>("/api/v1/customer/favourites", {
    method: "GET",
    token,
  });
}

export function addStoreFavourite(token: string, productId: string) {
  return apiData<Pick<StoreFavourite, "pk_user_favourite" | "fk_user" | "fk_product">>(
    "/api/v1/customer/favourites",
    {
      method: "POST",
      token,
      body: { fk_product: productId },
    },
  );
}

export function deleteStoreFavourite(token: string, favouriteId: number) {
  return apiRequest<null>(`/api/v1/customer/favourites/${favouriteId}`, {
    method: "DELETE",
    token,
  });
}

export function favouriteIdsByProductId(
  favourites: StoreFavourite[] | null | undefined,
): Record<string, number> {
  const ids: Record<string, number> = {};
  if (!favourites) return ids;
  for (const favourite of favourites) {
    ids[favourite.fk_product] = favourite.pk_user_favourite;
  }
  return ids;
}

export function favouriteToCatalogCard(favourite: StoreFavourite): StoreCatalogCard {
  const stock = Math.round(Number(favourite.product.stock) * 100) / 100;
  return {
    id: favourite.product.pk_product,
    name: favourite.product.name,
    image: favourite.product.photo_url,
    unit: favourite.product.meassure?.name ?? "",
    stock: Number.isFinite(stock) ? stock : 0,
    stock_status: stock > 0 && favourite.product.is_active !== false ? "in_stock" : "out_of_stock",
    price: toMoneyNumber(favourite.product.sale_price),
  };
}
