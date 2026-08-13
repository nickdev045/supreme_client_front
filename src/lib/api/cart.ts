import { apiData, apiRequest } from "@/lib/api/client";
import type { StoreCart, StoreOrder } from "@/lib/api/types";
import { toMoneyNumber } from "@/lib/format-money";

export function listStoreCarts(token: string) {
  return apiData<StoreCart[]>("/api/v1/customer/carts", {
    method: "GET",
    token,
  });
}

export function createStoreCart(token: string) {
  return apiData<StoreCart>("/api/v1/customer/carts", {
    method: "POST",
    token,
    body: {},
  });
}

export async function ensureStoreCart(token: string): Promise<StoreCart> {
  const carts = await listStoreCarts(token);
  if (carts[0]) return carts[0];
  return createStoreCart(token);
}

export function addStoreCartItem(
  token: string,
  cartId: number,
  input: { productId: string; quantity: string },
) {
  return apiData<StoreCart["cart_products"][number]>(`/api/v1/customer/carts/${cartId}/items`, {
    method: "POST",
    token,
    body: {
      fk_product: input.productId,
      quantity: input.quantity,
      selected: true,
    },
  });
}

export function updateStoreCartItem(
  token: string,
  cartId: number,
  itemId: number,
  input: { quantity: string },
) {
  return apiData<StoreCart["cart_products"][number]>(
    `/api/v1/customer/carts/${cartId}/items/${itemId}`,
    {
      method: "PATCH",
      token,
      body: input,
    },
  );
}

export function deleteStoreCartItem(token: string, cartId: number, itemId: number) {
  return apiRequest<null>(`/api/v1/customer/carts/${cartId}/items/${itemId}`, {
    method: "DELETE",
    token,
  });
}

export function checkoutStoreCart(token: string) {
  return apiData<StoreOrder>("/api/v1/customer/checkout", {
    method: "POST",
    token,
    body: {},
  });
}

export function fetchStoreOrder(token: string, orderId: string) {
  return apiData<StoreOrder>(`/api/v1/customer/orders/${orderId}`, {
    method: "GET",
    token,
  });
}

export function cartItemCount(cart: StoreCart | null | undefined): number {
  if (!cart) return 0;
  return new Set(cart.cart_products.map((item) => item.fk_product)).size;
}

export function cartLineTotal(item: StoreCart["cart_products"][number]): number {
  return toMoneyNumber(Number(item.quantity) * toMoneyNumber(item.unit_price));
}

export function cartTotal(cart: StoreCart | null | undefined): number {
  if (!cart) return 0;
  return toMoneyNumber(cart.cart_products.reduce((sum, item) => sum + cartLineTotal(item), 0));
}

export function cartQuantitiesByProductId(
  cart: StoreCart | null | undefined,
): Record<string, number> {
  const quantities: Record<string, number> = {};
  if (!cart) return quantities;
  for (const item of cart.cart_products) {
    const quantity = Number(item.quantity);
    if (!Number.isFinite(quantity) || quantity <= 0) continue;
    quantities[item.fk_product] = (quantities[item.fk_product] ?? 0) + quantity;
  }
  return quantities;
}
