"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { ShoppingCart, Loader2, ShoppingCartPlus } from "lucide-react"; // Importamos los iconos

import { addToCartAction } from "@/app/(portal)/shop/cart/actions";
import { QuantityStepper, maxOrderQuantity } from "@/components/shop/quantity-stepper";

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
      
      window.dispatchEvent(new CustomEvent("product-added"));
      
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
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--navy)] px-6 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90 no-underline"
        >
          <ShoppingCart className="h-4 w-4 shrink-0 text-white font-bold" />
          <span>{t("cartPage.goToCart")}</span>
        </Link>
      ) : canAdd ? (
        <button
          type="button"
          disabled={pending}
          onClick={onAdd}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--navy)] px-6 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--navy)]/50 disabled:pointer-events-none disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin text-white" />
          ) : (
            <>
              <span>
                {status === "added"
                  ? t("cartPage.added")
                  : t("cartPage.add")}
              </span>
              <ShoppingCartPlus className="h-4 w-4 shrink-0 text-white font-bold" />
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          className="inline-flex h-11 w-full items-center justify-center rounded-[10px] bg-zinc-200 px-6 text-sm font-semibold text-zinc-500 cursor-not-allowed dark:bg-zinc-800 dark:text-zinc-400"
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