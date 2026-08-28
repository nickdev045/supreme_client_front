import { getFormatter, getTranslations } from "next-intl/server";

import { OrderActions } from "@/components/shop/order-actions";
import type { StoreOrder } from "@/lib/api/types";
import { formatMoney } from "@/lib/format-money";

type OrderConfirmationProps = {
  order: StoreOrder;
};

function orderStateKey(state: string) {
  const normalized = state.trim().toUpperCase();
  if (
    normalized === "PAID"
    || normalized === "PENDING"
    || normalized === "APPROVED"
    || normalized === "CANCELED"
  ) {
    return normalized;
  }
  return "PAID";
}

export async function OrderConfirmation({ order }: OrderConfirmationProps) {
  const t = await getTranslations("Shop");
  const format = await getFormatter();
  const shortId = order.id.slice(0, 8);
  const created = order.created_at ? new Date(order.created_at) : null;
  const state = orderStateKey(order.state);
  const isPaid = state === "PAID";
  const isCanceled = state === "CANCELED";

  return (
    <section className="mx-auto max-w-2xl space-y-5">
      <div>
        <p className="m-0 text-sm font-semibold tracking-wide text-[var(--leaf)] uppercase">
          {t(`ordersPage.states.${state}` as "ordersPage.states.PAID")}
        </p>
        <h1 className="mt-1 mb-1 text-xl font-bold text-[var(--navy)] sm:text-2xl">
          {t("orderPage.detailTitle")}
        </h1>
        <p className="m-0 text-sm text-[var(--text-muted)]">
          {isCanceled
            ? t("orderPage.canceledHint")
            : isPaid
              ? t("orderPage.subtitlePaid")
              : t("orderPage.subtitle")}
        </p>
        {created ? (
          <p className="mt-1 mb-0 text-sm text-[var(--text-muted)]">
            {format.dateTime(created, { dateStyle: "medium", timeStyle: "short" })}
          </p>
        ) : null}
      </div>

      <div className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-4 sm:p-5">
        <p className="mt-0 mb-2 text-sm text-[var(--text-muted)]">
          {t("orderPage.receipt")} #{shortId}
        </p>
        {order.requires_delivery ? (
          order.delivery_address ? (
            <p className="mt-0 mb-4 text-sm text-[var(--text-muted)]">
              {t("orderPage.deliveryAddress")}: {order.delivery_address}
            </p>
          ) : null
        ) : (
          <p className="mt-0 mb-4 text-sm text-[var(--text-muted)]">{t("orderPage.pickup")}</p>
        )}
        <ul className="m-0 list-none divide-y divide-[var(--border)] p-0">
          {order.lines.map((line) => (
            <li key={line.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="min-w-0">
                <p className="m-0 font-semibold text-[var(--navy)]">{line.name}</p>
                <p className="m-0 text-sm text-[var(--text-muted)]">
                  {line.quantity} × {formatMoney(line.unit_price)}
                </p>
              </div>
              <p className="m-0 shrink-0 font-semibold text-[var(--navy)]">
                {formatMoney(line.sub_total)}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 mb-0 flex items-center justify-between border-t border-[var(--border)] pt-4 text-base font-bold text-[var(--navy)]">
          <span>{t("orderPage.total")}</span>
          <span>{formatMoney(order.total)}</span>
        </p>
      </div>

      <OrderActions order={order} />
    </section>
  );
}
