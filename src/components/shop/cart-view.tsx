"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";

import {
  checkoutCartAction,
  removeCartItemAction,
  updateCartItemQuantityAction,
} from "@/app/(portal)/shop/cart/actions";
import { QuantityStepper, maxOrderQuantity } from "@/components/shop/quantity-stepper";
import { Alert } from "@/components/ui/alert";
import { btn, fieldClass } from "@/components/ui/styles";
import { addressLabel, type StoreAddress } from "@/lib/api/addresses";
import { cartLineTotal, cartTotal } from "@/lib/api/cart";
import type { StoreCart, StoreCartPriceChange } from "@/lib/api/types";
import { formatMoney, toMoneyNumber } from "@/lib/format-money";

type CartViewProps = {
  cart: StoreCart | null;
  addresses: StoreAddress[];
};

function errorMessage(error: string, t: (key: string) => string) {
  if (error === "session") return t("cartPage.errors.session");
  if (error === "forbidden") return t("cartPage.errors.forbidden");
  if (error === "stock") return t("cartPage.errors.stock");
  if (error === "empty") return t("cartPage.errors.empty");
  if (error === "address") return t("cartPage.errors.address");
  return t("cartPage.errors.generic");
}

export function CartView({ cart, addresses }: CartViewProps) {
  const t = useTranslations("Shop");
  const router = useRouter();
  const titleId = useId();
  const [error, setError] = useState<string | null>(null);
  const [priceChanges, setPriceChanges] = useState<StoreCartPriceChange[] | null>(null);
  const [pending, startTransition] = useTransition();
  const [deliveryMode, setDeliveryMode] = useState<"PICKUP" | "DELIVERY">("PICKUP");
  const [addressChoice, setAddressChoice] = useState<"other" | number>(
    addresses[0]?.pk_address ?? "other",
  );
  const [deliveryAddress, setDeliveryAddress] = useState(
    addresses[0]?.address?.trim() ?? "",
  );

  const items = cart?.cart_products ?? [];
  const total = cartTotal(cart);
  const sortedAddresses = useMemo(
    () => [...addresses].sort((a, b) => b.pk_address - a.pk_address),
    [addresses],
  );

  useEffect(() => {
    if (!priceChanges) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPriceChanges(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [priceChanges]);

  useEffect(() => {
    if (sortedAddresses.length === 0) {
      setAddressChoice("other");
      return;
    }
    if (addressChoice !== "other" && !sortedAddresses.some((row) => row.pk_address === addressChoice)) {
      const first = sortedAddresses[0];
      setAddressChoice(first.pk_address);
      setDeliveryAddress(first.address?.trim() ?? "");
    }
  }, [sortedAddresses, addressChoice]);

  function selectSavedAddress(pkAddress: number) {
    const match = sortedAddresses.find((row) => row.pk_address === pkAddress);
    setAddressChoice(pkAddress);
    setDeliveryAddress(match?.address?.trim() ?? "");
  }

  function onQuantity(itemId: number, quantity: number) {
    setError(null);
    startTransition(async () => {
      const result = await updateCartItemQuantityAction(itemId, quantity);
      if (!result.ok) {
        setError(errorMessage(result.error, t));
        return;
      }
      router.refresh();
    });
  }

  function onRemove(itemId: number) {
    setError(null);
    startTransition(async () => {
      const result = await removeCartItemAction(itemId);
      if (!result.ok) {
        setError(errorMessage(result.error, t));
        return;
      }
      router.refresh();
    });
  }

  function onPlaceOrder() {
    setError(null);
    startTransition(async () => {
      const result = await checkoutCartAction({
        delivery_mode: deliveryMode,
        address_id:
          deliveryMode === "DELIVERY" && addressChoice !== "other" ? addressChoice : undefined,
        delivery_address:
          deliveryMode === "DELIVERY" && (addressChoice === "other" || sortedAddresses.length === 0)
            ? deliveryAddress
            : null,
      });
      if (!result.ok) {
        if (result.error === "price_changed") {
          setPriceChanges(result.changes);
          router.refresh();
          return;
        }
        setError(errorMessage(result.error, t));
        return;
      }
      router.push(`/shop/orders/${result.order.id}`);
      router.refresh();
    });
  }

  function closePriceModal() {
    setPriceChanges(null);
    router.refresh();
  }

  const canPlaceOrder =
    items.length > 0
    && (deliveryMode === "PICKUP"
      || (addressChoice !== "other" && addressChoice != null)
      || deliveryAddress.trim().length > 0);

  return (
    <section className="space-y-5">
      <div>
        <h1 className="mt-0 mb-1 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--navy)] sm:text-2xl">
          {t("cartPage.title")}
        </h1>
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      {items.length === 0 ? (
        <div className="rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-6">
          <p className="mt-0 mb-4 text-[var(--text-muted)]">{t("cartPage.empty")}</p>
          <Link href="/shop" className={btn.primary}>
            {t("cartPage.emptyCta")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)]">
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {items.map((item) => {
              const stock = maxOrderQuantity(toMoneyNumber(item.product.stock));
              const quantity = Number(item.quantity);
              const unit = item.product.meassure?.name;
              return (
                <li
                  key={item.pk_cart_product}
                  className="flex gap-3 rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-3 sm:p-4"
                >
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-[var(--shop-surface-muted)] sm:h-24 sm:w-24">
                    {item.product.photo_url ? (
                      // Product image hosts vary by upload/CDN config.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.product.photo_url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-lg font-bold text-[var(--navy)]">
                        {item.product.name.trim().charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <h2 className="mt-0 mb-1 pr-2 text-sm font-semibold text-[var(--navy)] sm:text-base">
                      <Link
                        href={`/shop/products/${item.fk_product}`}
                        className="text-inherit no-underline hover:underline"
                      >
                        {item.product.name}
                      </Link>
                    </h2>
                    <p className="m-0 text-sm text-[var(--text-muted)]">
                      {formatMoney(toMoneyNumber(item.unit_price))}
                      {unit ? ` / ${unit}` : ""}
                    </p>
                    <p className="mt-1 mb-0 text-[0.8rem] text-[var(--text-muted)]">
                      {t("stock.quantity", { count: stock })}
                    </p>
                    <div className="mt-auto pt-3">
                      <QuantityStepper
                        value={quantity}
                        min={1}
                        max={Math.max(quantity, stock)}
                        disabled={pending}
                        onChange={(next) => onQuantity(item.pk_cart_product, next)}
                        decreaseLabel={t("cartPage.decrease")}
                        increaseLabel={t("cartPage.increase")}
                      />
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end justify-between self-stretch">
                    <button
                      type="button"
                      className="inline-flex h-11 w-11 items-center justify-center rounded-full border-0 bg-transparent text-2xl leading-none font-semibold text-[var(--tomato)] transition hover:bg-[rgba(199,62,46,0.12)] disabled:opacity-50"
                      aria-label={t("cartPage.remove")}
                      disabled={pending}
                      onClick={() => onRemove(item.pk_cart_product)}
                    >
                      −
                    </button>
                    <p className="m-0 text-sm font-bold text-[var(--navy)] sm:text-base">
                      {formatMoney(cartLineTotal(item))}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <aside className="h-fit space-y-4 rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-4">
            <div>
              <h2 className="mt-0 mb-3 text-base font-semibold text-[var(--navy)]">
                {t("cartPage.summary")}
              </h2>
              <p className="mb-0 flex items-center justify-between text-base font-bold text-[var(--navy)]">
                <span>{t("cartPage.total")}</span>
                <span>{formatMoney(total)}</span>
              </p>
            </div>

            <div className="space-y-2 border-t border-[var(--border)] pt-3">
              <p className="m-0 text-sm font-semibold text-[var(--navy)]">
                {t("cartPage.fulfillment")}
              </p>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="delivery-mode"
                  checked={deliveryMode === "PICKUP"}
                  onChange={() => setDeliveryMode("PICKUP")}
                />
                {t("cartPage.pickup")}
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="delivery-mode"
                  checked={deliveryMode === "DELIVERY"}
                  onChange={() => setDeliveryMode("DELIVERY")}
                />
                {t("cartPage.delivery")}
              </label>
            </div>

            {deliveryMode === "DELIVERY" ? (
              <div className="space-y-2">
                <p className="m-0 text-sm font-semibold text-[var(--navy)]">
                  {t("cartPage.deliveryAddress")}
                </p>
                {sortedAddresses.length > 0 ? (
                  <fieldset className="m-0 space-y-2 rounded-[10px] border border-[var(--border)] p-3">
                    <legend className="px-1 text-xs font-semibold tracking-wide text-[var(--text-muted)] uppercase">
                      {t("cartPage.savedAddresses")}
                    </legend>
                    {sortedAddresses.map((item) => (
                      <label
                        key={item.pk_address}
                        className="flex cursor-pointer items-start gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          name="delivery-address-choice"
                          className="mt-1"
                          checked={addressChoice === item.pk_address}
                          onChange={() => selectSavedAddress(item.pk_address)}
                        />
                        <span>
                          <span className="block font-medium text-[var(--navy)]">
                            {item.description?.trim() || addressLabel(item)}
                          </span>
                          {item.description?.trim() ? (
                            <span className="block text-xs text-[var(--text-muted)]">
                              {addressLabel(item)}
                            </span>
                          ) : null}
                        </span>
                      </label>
                    ))}
                    <label className="flex cursor-pointer items-start gap-2 text-sm">
                      <input
                        type="radio"
                        name="delivery-address-choice"
                        className="mt-1"
                        checked={addressChoice === "other"}
                        onChange={() => {
                          setAddressChoice("other");
                          setDeliveryAddress("");
                        }}
                      />
                      <span className="font-medium text-[var(--navy)]">
                        {t("cartPage.otherAddress")}
                      </span>
                    </label>
                  </fieldset>
                ) : (
                  <p className="m-0 text-xs text-[var(--text-muted)]">
                    {t("cartPage.noSavedAddresses")}{" "}
                    <Link href="/shop/profile" className="font-semibold text-[var(--navy)] underline">
                      {t("cartPage.manageAddresses")}
                    </Link>
                  </p>
                )}
                {sortedAddresses.length === 0 || addressChoice === "other" ? (
                  <input
                    value={deliveryAddress}
                    onChange={(event) => {
                      setAddressChoice("other");
                      setDeliveryAddress(event.target.value);
                    }}
                    maxLength={255}
                    placeholder={t("cartPage.deliveryAddressPlaceholder")}
                    className={fieldClass}
                  />
                ) : null}
              </div>
            ) : null}

            <p className="m-0 text-xs text-[var(--text-muted)]">{t("cartPage.pendingHint")}</p>

            <button
              type="button"
              className={`${btn.accent} w-full min-h-11`}
              disabled={pending || !canPlaceOrder}
              onClick={onPlaceOrder}
            >
              {pending ? t("cartPage.placing") : t("cartPage.placeOrder")}
            </button>
          </aside>
        </div>
      )}

      {priceChanges ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-[rgba(15,23,42,0.45)] p-4 sm:items-center"
          role="presentation"
          onClick={closePriceModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="w-full max-w-md rounded-[14px] border border-[#ddd] bg-[var(--shop-surface)] p-5 shadow-[var(--shadow)]"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id={titleId} className="mt-0 mb-2 text-lg font-bold text-[var(--navy)]">
              {t("cartPage.priceChanged.title")}
            </h2>
            <p className="mt-0 mb-4 text-sm text-[var(--text-muted)]">
              {t("cartPage.priceChanged.body")}
            </p>
            {priceChanges.length > 0 ? (
              <ul className="m-0 mb-4 list-none space-y-2 p-0">
                {priceChanges.map((change) => (
                  <li
                    key={change.product_id}
                    className="rounded-[10px] border border-[#eee] bg-[var(--shop-surface-muted)] px-3 py-2 text-sm"
                  >
                    <p className="m-0 font-semibold text-[var(--navy)]">{change.name}</p>
                    <p className="mt-1 mb-0 text-[var(--text-muted)]">
                      {t("cartPage.priceChanged.line", {
                        previous: formatMoney(change.previous_unit_price),
                        current: formatMoney(change.current_unit_price),
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              className={`${btn.primary} w-full min-h-11`}
              onClick={closePriceModal}
            >
              {t("cartPage.priceChanged.confirm")}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}
