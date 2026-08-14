import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ProductDetail } from "@/components/shop/product-detail";
import { fetchStoreProduct } from "@/lib/api/catalog";
import { cartQuantitiesByProductId, listStoreCarts } from "@/lib/api/cart";
import { favouriteIdsByProductId, listStoreFavourites } from "@/lib/api/favourites";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/session";

type ProductPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: ProductPageProps) {
  const t = await getTranslations("Meta");
  const token = await getAccessToken();
  if (!token) {
    return { title: t("productTitleFallback"), description: t("productDescription") };
  }

  try {
    const product = await fetchStoreProduct(token, (await params).id);
    return {
      title: t("productTitle", { name: product.name }),
      description: product.description.trim() || t("productDescription"),
    };
  } catch {
    return { title: t("productTitleFallback"), description: t("productDescription") };
  }
}

export default async function ShopProductPage({ params }: ProductPageProps) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const { id } = await params;
  let product;
  let carts = [];
  let favourites = [];
  try {
    [product, carts, favourites] = await Promise.all([
      fetchStoreProduct(token, id),
      listStoreCarts(token).catch(() => []),
      listStoreFavourites(token).catch(() => []),
    ]);
  } catch (error) {
    if (error instanceof ApiError && (error.status === 404 || error.status === 400)) {
      notFound();
    }
    throw error;
  }

  const inCartQuantity = cartQuantitiesByProductId(carts[0] ?? null)[product.id] ?? 0;
  const favouriteId = favouriteIdsByProductId(favourites)[product.id] ?? null;
  return (
    <ProductDetail
      product={product}
      inCartQuantity={inCartQuantity}
      favouriteId={favouriteId}
    />
  );
}
