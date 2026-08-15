import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { CartView } from "@/components/shop/cart-view";
import { Alert } from "@/components/ui/alert";
import { listStoreAddresses } from "@/lib/api/addresses";
import { listStoreCarts } from "@/lib/api/cart";
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

  const t = await getTranslations("Shop");

  let cart = null;
  let addresses: Awaited<ReturnType<typeof listStoreAddresses>> = [];
  let loadError = false;
  try {
    const [carts, savedAddresses] = await Promise.all([
      listStoreCarts(token),
      listStoreAddresses(token).catch(() => []),
    ]);
    cart = carts[0] ?? null;
    addresses = savedAddresses;
  } catch {
    loadError = true;
  }

  if (loadError) {
    return <Alert tone="error">{t("cartPage.loadError")}</Alert>;
  }

  return <CartView cart={cart} addresses={addresses} />;
}
