import { apiData, apiRequest } from "@/lib/api/client";
import type { StoreCatalogCard, StoreFavourite, StoreFavouriteProduct } from "@/lib/api/types";
import { hasSellablePrice, toMoneyNumber } from "@/lib/format-money";

function favouriteNetPrice(product: StoreFavouriteProduct) {
  return product.price ?? product.sale_price;
}

export async function listStoreFavourites(token: string) {
  const favourites = await apiData<StoreFavourite[]>("/api/v1/customer/favourites", {
    method: "GET",
    token,
  });
  return favourites.filter((favourite) => hasSellablePrice(favouriteNetPrice(favourite.product)));
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
  const price = toMoneyNumber(favouriteNetPrice(favourite.product));
  const listPrice =
    favourite.product.list_price != null
      ? toMoneyNumber(favourite.product.list_price)
      : undefined;
  const discountPercent =
    favourite.product.discount_percent != null
      ? Number(favourite.product.discount_percent)
      : undefined;
  return {
    id: favourite.product.pk_product,
    name: favourite.product.name,
    image: favourite.product.photo_url,
    unit: favourite.product.meassure?.name ?? "",
    stock: Number.isFinite(stock) ? stock : 0,
    stock_status: stock > 0 && favourite.product.is_active !== false ? "in_stock" : "out_of_stock",
    price,
    category: favourite.product.category
      ? {
          id: favourite.product.category.pk_product_category,
          name: favourite.product.category.name,
          image: favourite.product.category.photo_url ?? null,
        }
      : null,
    subcategory: favourite.product.subcategory
      ? {
          id: favourite.product.subcategory.pk_product_subcategory,
          name: favourite.product.subcategory.name,
          image: favourite.product.subcategory.photo_url ?? null,
        }
      : null,
    ...(listPrice != null && listPrice > price ? { list_price: listPrice } : {}),
    ...(discountPercent && discountPercent > 0 ? { discount_percent: discountPercent } : {}),
  };
}
