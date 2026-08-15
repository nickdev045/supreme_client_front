import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { OrdersHistoryList } from "@/components/shop/orders-history";
import { Alert } from "@/components/ui/alert";
import { listStoreOrders, STORE_ORDERS_PAGE_SIZE } from "@/lib/api/cart";
import { ApiError } from "@/lib/api/client";
import { getAccessToken } from "@/lib/session";

export async function generateMetadata() {
  const t = await getTranslations("Meta");
  return {
    title: t("ordersTitle"),
    description: t("ordersDescription"),
  };
}

export default async function ShopOrdersPage() {
  const token = await getAccessToken();
  if (!token) redirect("/login");
  const t = await getTranslations("Shop");

  try {
    const response = await listStoreOrders(token, {
      page: 1,
      limit: STORE_ORDERS_PAGE_SIZE,
      sort: "desc",
    });
    const total = response.meta.total;
    const hasMore = response.data.length < total;

    return (
      <section className="space-y-4">
        <div className="min-w-0">
          <h1 className="break-words font-[family-name:var(--font-display)] text-xl font-bold text-[var(--navy)] sm:text-2xl">
            {t("ordersPage.title")}
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t("ordersPage.subtitle")}</p>
        </div>
        <OrdersHistoryList
          initialOrders={response.data}
          initialPage={response.meta.page}
          total={total}
          hasMore={hasMore}
        />
      </section>
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return <Alert tone="error">{t("ordersPage.forbidden")}</Alert>;
    }
    return <Alert tone="error">{t("ordersPage.loadError")}</Alert>;
  }
}
