import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CartView } from "@/components/shop/cart-view";
import { listStoreAddresses } from "@/lib/api/addresses";
import { listStoreCarts } from "@/lib/api/cart";
import { handleUnauthorized } from "@/lib/handle-unauthorized";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
  };
}

export default async function ShopCartPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  let cart = null;
  let addresses: Awaited<ReturnType<typeof listStoreAddresses>> = [];
  try {
    const [carts, savedAddresses] = await Promise.all([
      listStoreCarts(token),
      listStoreAddresses(token).catch(() => []),
    ]);
    cart = carts[0] ?? null;
    addresses = savedAddresses;
  } catch (error) {
    handleUnauthorized(error);
  }

  return <CartView cart={cart} addresses={addresses} />;
}
