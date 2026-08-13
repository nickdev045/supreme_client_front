import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { OrderConfirmation } from "@/components/shop/order-confirmation";
import { ApiError } from "@/lib/api/client";
import { fetchStoreOrder } from "@/lib/api/cart";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("orderTitle"),
    description: t("orderDescription"),
  };
}

type ShopOrderPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ShopOrderPage({ params }: ShopOrderPageProps) {
  const token = await getAccessToken();
  if (!token) redirect("/login");

  const { id } = await params;
  let order;
  try {
    order = await fetchStoreOrder(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return <OrderConfirmation order={order} />;
}
