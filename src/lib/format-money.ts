export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function toMoneyNumber(value: string | number | null | undefined): number {
  const amount = Number(value ?? 0);
  return Number.isFinite(amount) ? Math.round(amount * 100) / 100 : 0;
}

/** Storefront can only sell products with a positive price. Zero/empty is treated as missing. */
export function hasSellablePrice(value: string | number | null | undefined): boolean {
  if (value == null || value === "") return false;
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0;
}

