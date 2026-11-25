"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Loader2, ShoppingCartPlus } from "lucide-react";

import { addToCartAction } from "@/app/(portal)/shop/cart/actions";
import { QuantityStepper, maxOrderQuantity } from "@/components/shop/quantity-stepper";
import type { StoreProductPresentation } from "@/lib/api/types";
import { formatMoney, hasSellablePrice } from "@/lib/format-money";

type AddToCartControlsProps = {
  productId: string;
  stock: number;
  available: boolean;
  hasPrice: boolean;
  presentationOptions?: StoreProductPresentation[];
  showPresentationSelector?: boolean;
  showPrice?: boolean;
  basePrice?: number;
  baseListPrice?: number;
  unit?: string;
  inCartQuantity?: number;
  inCartBaseUnits?: number;
  layout?: "stack" | "row";
};

export function AddToCartControls({
  productId,
  stock,
  available,
  hasPrice,
  presentationOptions = [],
  showPresentationSelector = true,
  showPrice = true,
  basePrice,
  baseListPrice,
  unit,
  inCartQuantity = 0,
  inCartBaseUnits = 0,
  layout = "stack",
}: AddToCartControlsProps) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const alreadyInCart = inCartQuantity > 0;
  const baseOption = presentationOptions.find((option) => option.is_base) ?? presentationOptions[0];
  const [selectedPresentationId, setSelectedPresentationId] = useState<string | null>(
    baseOption?.id ?? null,
  );
  const selectedPresentation =
    presentationOptions.find((option) => option.id === selectedPresentationId) ?? baseOption;
  const rawFactor = Number(selectedPresentation?.base_quantity ?? 1);
  const factor = Number.isFinite(rawFactor) && rawFactor > 0 ? rawFactor : 1;
  const availableBaseUnits = Math.max(0, stock - inCartBaseUnits);
  const remaining = maxOrderQuantity(Math.floor(availableBaseUnits / factor));
  const price = selectedPresentation?.price ?? basePrice ?? (hasPrice ? 0 : 0);
  const listPrice = selectedPresentation?.list_price ?? baseListPrice;
  const selectedHasPrice = hasSellablePrice(price);
  const unitLabel = selectedPresentation?.name ?? unit ?? "";
  const canAdd = selectedHasPrice && available && remaining >= 1;
  const [quantity, setQuantity] = useState(canAdd ? 1 : 0);
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<"idle" | "added" | "error" | "noPrice">("idle");

  function onAdd() {
    if (!canAdd || pending || quantity < 1) return;
    setStatus("idle");
    startTransition(async () => {
      const result = await addToCartAction(productId, quantity, selectedPresentation?.id);
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
      {showPresentationSelector && presentationOptions.length > 1 ? (
        <label className="block space-y-1 text-sm font-medium text-[var(--navy)]">
          <span>{t("productPage.presentation")}</span>
          <select
            value={selectedPresentation?.id ?? "__base__"}
            onChange={(event) => {
              const option = presentationOptions.find(
                (item) => (item.id ?? "__base__") === event.target.value,
              );
              setSelectedPresentationId(option?.id ?? null);
              setQuantity(1);
              setStatus("idle");
            }}
            className="h-11 w-full rounded-[10px] border border-[var(--border)] bg-white px-3 text-sm"
          >
            {presentationOptions.map((option, index) => (
              <option key={option.id ?? "base-" + index} value={option.id ?? "__base__"}>
                {option.name} · {option.base_quantity}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      {showPrice ? (
      <p className="m-0 text-lg font-bold text-[var(--navy)]">
        {listPrice != null && listPrice > price ? (
          <span className="mr-2 text-sm font-normal text-[var(--text-muted)] line-through">
            {formatMoney(listPrice)}
          </span>
        ) : null}
        {formatMoney(price)}
        {unitLabel ? (
          <span className="ml-1 text-sm font-normal text-[var(--text-muted)]">/ {unitLabel}</span>
        ) : null}
      </p>
      ) : null}

      {alreadyInCart ? (
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

      {canAdd ? (
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
          {t(selectedHasPrice ? "cartPage.outOfStock" : "cartPage.noPrice")}
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