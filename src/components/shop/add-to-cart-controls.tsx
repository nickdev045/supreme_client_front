"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import { addToCartAction } from "@/app/(portal)/shop/cart/actions";
import { QuantityStepper, maxOrderQuantity } from "@/components/shop/quantity-stepper";
import { btn } from "@/components/ui/styles";

type AddToCartControlsProps = {
  productId: string;
  stock: number;
  available: boolean;
  hasPrice: boolean;
  inCartQuantity?: number;
  layout?: "stack" | "row";
};

export function AddToCartControls({
  productId,
  stock,
  available,
  hasPrice,
  inCartQuantity = 0,
  layout = "stack",
}: AddToCartControlsProps) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const alreadyInCart = inCartQuantity > 0;
  const remaining = maxOrderQuantity(stock);
  const canAdd = hasPrice && available && !alreadyInCart && remaining >= 1;
  const [quantity, setQuantity] = useState(canAdd ? 1 : 0);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "added" | "error" | "noPrice">("idle");

  function onAdd() {
    if (!canAdd || pending || quantity < 1) return;
    setStatus("idle");
    startTransition(async () => {
      const result = await addToCartAction(productId, quantity);
      if (!result.ok) {
        setStatus(result.error === "noPrice" ? "noPrice" : "error");
        return;
      }
      setStatus("added");
      router.refresh();
    });
  }

  return (
    <div
      className={
        layout === "row"
          ? "flex flex-col items-start gap-3"
          : "flex flex-col items-stretch gap-2"
      }
    >
      {inCartQuantity > 0 ? (
        <p className="m-0 text-[0.8rem] font-semibold text-[var(--leaf)]">
          {t("cartPage.inCart", { count: inCartQuantity })}
        </p>
      ) : null}

      {canAdd ? (
        <QuantityStepper
          value={Math.min(quantity, remaining)}
          min={1}
          max={remaining}
          disabled={pending}
          fullWidth={layout === "stack"}
          compact={layout === "stack"}
          onChange={(next) => {
            setStatus("idle");
            setQuantity(next);
          }}
          decreaseLabel={t("cartPage.decrease")}
          increaseLabel={t("cartPage.increase")}
        />
      ) : null}

      {alreadyInCart ? (
        <Link
          href="/shop/cart"
          className={`${btn.primary} ${layout === "stack" ? `${btn.sm} w-full px-2 text-center leading-tight` : ""} min-h-11 no-underline`}
        >
          {t("cartPage.goToCart")}
        </Link>
      ) : canAdd ? (
        <button
          type="button"
          className={`${btn.primary} ${layout === "stack" ? `${btn.sm} w-full px-2 text-center leading-tight` : ""} min-h-11`}
          disabled={pending}
          onClick={onAdd}
        >
          {pending
            ? t("cartPage.adding")
            : status === "added"
              ? t("cartPage.added")
              : t("cartPage.add")}
        </button>
      ) : (
        <button
          type="button"
          className={`${btn.primary} ${layout === "stack" ? `${btn.sm} w-full px-2 text-center leading-tight` : ""} min-h-11`}
          disabled
        >
          {t(hasPrice ? "cartPage.outOfStock" : "cartPage.noPrice")}
        </button>
      )}

      {status === "error" || status === "noPrice" ? (
        <p className="m-0 text-[0.75rem] text-[var(--tomato)]" role="alert">
          {t(status === "noPrice" ? "cartPage.errors.noPrice" : "cartPage.errors.stock")}
        </p>
      ) : null}
    </div>
  );
}
