"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useFormatter, useTranslations } from "next-intl";

import { buyAgainOrderAction, cancelOrderAction, loadOrdersPageAction } from "@/app/(portal)/shop/orders/actions";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { btn } from "@/components/ui/styles";
import { canCancelStoreOrder } from "@/lib/api/cart";
import type { StoreOrder } from "@/lib/api/types";
import { formatMoney } from "@/lib/format-money";

type OrdersHistoryListProps = {
  initialOrders: StoreOrder[];
  initialPage: number;
  total: number;
  hasMore: boolean;
};

function shortId(id: string) {
  return id.slice(0, 8);
}

function orderStateKey(state: string) {
  const normalized = state.trim().toUpperCase();
  if (normalized === "PAID" || normalized === "PENDING" || normalized === "APPROVED" || normalized === "CANCELED") {
    return normalized;
  }
  return "PAID";
}

export function OrdersHistoryList({
  initialOrders,
  initialPage,
  total,
  hasMore: initialHasMore,
}: OrdersHistoryListProps) {
  const t = useTranslations("Shop");
  const format = useFormatter();
  const router = useRouter();
  const [orders, setOrders] = useState(initialOrders);
  const [page, setPage] = useState(initialPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  function cancelErrorMessage(error: string) {
    if (error === "session") return t("orderPage.errors.session");
    if (error === "forbidden") return t("orderPage.errors.forbidden");
    if (error === "shipping") return t("orderPage.errors.shipping");
    if (error === "locked") return t("orderPage.errors.locked");
    return t("orderPage.errors.generic");
  }

  function onLoadMore() {
    setError(null);
    startTransition(async () => {
      const result = await loadOrdersPageAction({ page: page + 1 });
      if (!result.ok) {
        setError(
          result.error === "session"
            ? t("ordersPage.sessionError")
            : result.error === "forbidden"
              ? t("ordersPage.forbidden")
              : t("ordersPage.loadError"),
        );
        return;
      }
      setOrders((prev) => {
        const seen = new Set(prev.map((item) => item.id));
        return [...prev, ...result.orders.filter((item) => !seen.has(item.id))];
      });
      setPage(result.page);
      setHasMore(result.hasMore);
    });
  }

  function onBuyAgain(orderId: string) {
    setError(null);
    setBuyingId(orderId);
    startTransition(async () => {
      const result = await buyAgainOrderAction(orderId);
      setBuyingId(null);
      if (!result.ok) {
        setError(
          result.error === "session"
            ? t("cartPage.errors.session")
            : result.error === "forbidden"
              ? t("cartPage.errors.forbidden")
              : t("ordersPage.buyAgainEmpty"),
        );
        return;
      }
      router.push("/shop/cart");
    });
  }

  function onCancelOrder(orderId: string) {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrderAction(orderId);
      if (!result.ok) {
        setCancelingId(null);
        setError(cancelErrorMessage(result.error));
        return;
      }
      setOrders((prev) => prev.map((item) => (item.id === result.order.id ? result.order : item)));
      setCancelingId(null);
      router.refresh();
    });
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] px-4 py-10 text-center">
        <p className="m-0 text-sm text-[var(--text-muted)]">{t("ordersPage.empty")}</p>
        <Link href="/shop" className={`${btn.primary} mt-4 inline-flex min-h-11 no-underline`}>
          {t("cartPage.emptyCta")}
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error ? <Alert tone="error">{error}</Alert> : null}
      <p className="m-0 text-sm text-[var(--text-muted)]">
        {t("filters.showingCount", { shown: orders.length, total })}
      </p>
      <ul className="m-0 list-none space-y-3 p-0">
        {orders.map((order) => {
          const created = order.created_at ? new Date(order.created_at) : null;
          const preview = order.lines
            .slice(0, 2)
            .map((line) => line.name)
            .join(", ");
          const extra = order.lines.length > 2 ? t("ordersPage.moreItems", { count: order.lines.length - 2 }) : "";
          const state = orderStateKey(order.state);

          return (
            <li
              key={order.id}
              className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="m-0 text-xs font-semibold tracking-wide text-[var(--leaf)] uppercase">
                    {t(`ordersPage.states.${state}` as "ordersPage.states.PAID")}
                  </p>
                  <h2 className="mt-1 mb-1 text-base font-semibold text-[var(--navy)]">
                    {t("orderPage.receipt")} #{shortId(order.id)}
                  </h2>
                  <p className="m-0 text-sm text-[var(--text-muted)]">
                    {created
                      ? format.dateTime(created, { dateStyle: "medium", timeStyle: "short" })
                      : "—"}
                    {" · "}
                    {formatMoney(order.total)}
                  </p>
                  {preview ? (
                    <p className="mt-2 mb-0 line-clamp-2 text-sm text-[var(--text)]">
                      {preview}
                      {extra ? ` ${extra}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/shop/orders/${order.id}`}
                  className={`${btn.outline} ${btn.sm} no-underline`}
                >
                  {t("ordersPage.view")}
                </Link>
                <button
                  type="button"
                  className={`${btn.primary} ${btn.sm}`}
                  disabled={pending && buyingId === order.id}
                  onClick={() => onBuyAgain(order.id)}
                >
                  {pending && buyingId === order.id
                    ? t("ordersPage.buyingAgain")
                    : t("buyAgain")}
                </button>
                {canCancelStoreOrder(order) ? (
                  <button
                    type="button"
                    className={`${btn.outline} ${btn.sm} border-[var(--tomato)] text-[var(--tomato)] hover:bg-[var(--tomato)] hover:text-white`}
                    disabled={pending}
                    onClick={() => {
                      setError(null);
                      setCancelingId(order.id);
                    }}
                  >
                    {t("orderPage.cancel")}
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ul>
      {hasMore ? (
        <div className="flex justify-center pt-1">
          <button type="button" disabled={pending} onClick={onLoadMore} className={btn.primary}>
            {pending && buyingId === null && cancelingId === null ? t("filters.loadingMore") : t("filters.loadMore")}
          </button>
        </div>
      ) : null}
      <ConfirmDialog
        open={cancelingId != null}
        title={t("orderPage.cancelTitle")}
        description={t("orderPage.cancelBody")}
        confirmLabel={pending ? t("orderPage.canceling") : t("orderPage.cancelConfirm")}
        cancelLabel={t("orderPage.cancelKeep")}
        pending={pending}
        tone="danger"
        onConfirm={() => {
          if (cancelingId) onCancelOrder(cancelingId);
        }}
        onCancel={() => {
          if (!pending) setCancelingId(null);
        }}
      />
    </div>
  );
}
