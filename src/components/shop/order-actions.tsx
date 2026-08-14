"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { buyAgainOrderAction } from "@/app/(portal)/shop/orders/actions";
import { btn } from "@/components/ui/styles";

export function OrderActions({ orderId }: { orderId: string }) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onBuyAgain() {
    setError(null);
    startTransition(async () => {
      const result = await buyAgainOrderAction(orderId);
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

  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Link href="/shop" className={`${btn.primary} min-h-11 no-underline sm:flex-1`}>
        {t("orderPage.backToShop")}
      </Link>
      <button
        type="button"
        className={`${btn.outline} min-h-11 sm:flex-1`}
        disabled={pending}
        onClick={onBuyAgain}
      >
        {pending ? t("ordersPage.buyingAgain") : t("buyAgain")}
      </button>
      <Link href="/shop/orders" className={`${btn.outline} min-h-11 no-underline sm:flex-1`}>
        {t("ordersPage.viewAll")}
      </Link>
      {error ? (
        <p className="m-0 w-full text-sm text-[var(--tomato)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
