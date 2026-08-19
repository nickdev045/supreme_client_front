"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { buyAgainOrderAction, cancelOrderAction } from "@/app/(portal)/shop/orders/actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { btn } from "@/components/ui/styles";
import { canCancelStoreOrder } from "@/lib/api/cart";
import type { StoreOrder } from "@/lib/api/types";

type OrderActionsProps = {
  order: StoreOrder;
};

function cancelErrorMessage(error: string, t: (key: string) => string) {
  if (error === "session") return t("orderPage.errors.session");
  if (error === "forbidden") return t("orderPage.errors.forbidden");
  if (error === "shipping") return t("orderPage.errors.shipping");
  if (error === "locked") return t("orderPage.errors.locked");
  return t("orderPage.errors.generic");
}

export function OrderActions({ order }: OrderActionsProps) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const cancellable = canCancelStoreOrder(order);

  function onBuyAgain() {
    setError(null);
    startTransition(async () => {
      const result = await buyAgainOrderAction(order.id);
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

  function onCancelOrder() {
    setError(null);
    startTransition(async () => {
      const result = await cancelOrderAction(order.id);
      if (!result.ok) {
        setConfirmCancel(false);
        setError(cancelErrorMessage(result.error, t));
        return;
      }
      setConfirmCancel(false);
      router.refresh();
    });
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Link href="/shop" className={`${btn.primary} ${btn.sm} no-underline`}>
        {t("orderPage.backToShop")}
      </Link>
      <button
        type="button"
        className={`${btn.outline} ${btn.sm}`}
        disabled={pending}
        onClick={onBuyAgain}
      >
        {pending && !confirmCancel ? t("ordersPage.buyingAgain") : t("buyAgain")}
      </button>
      <Link href="/shop/orders" className={`${btn.outline} ${btn.sm} no-underline`}>
        {t("ordersPage.viewAll")}
      </Link>
      {cancellable ? (
        <button
          type="button"
          className={`${btn.outline} ${btn.sm} border-[var(--tomato)] text-[var(--tomato)] hover:bg-[var(--tomato)] hover:text-white`}
          disabled={pending}
          onClick={() => {
            setError(null);
            setConfirmCancel(true);
          }}
        >
          {t("orderPage.cancel")}
        </button>
      ) : null}
      {error ? (
        <p className="m-0 w-full text-sm text-[var(--tomato)]" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmDialog
        open={confirmCancel}
        title={t("orderPage.cancelTitle")}
        description={t("orderPage.cancelBody")}
        confirmLabel={pending ? t("orderPage.canceling") : t("orderPage.cancelConfirm")}
        cancelLabel={t("orderPage.cancelKeep")}
        pending={pending}
        tone="danger"
        onConfirm={onCancelOrder}
        onCancel={() => {
          if (!pending) setConfirmCancel(false);
        }}
      />
    </div>
  );
}
