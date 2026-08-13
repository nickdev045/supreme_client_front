"use server";

import { revalidatePath } from "next/cache";

import {
  addStoreCartItem,
  checkoutStoreCart,
  deleteStoreCartItem,
  ensureStoreCart,
  updateStoreCartItem,
} from "@/lib/api/cart";
import { ApiError } from "@/lib/api/client";
import type { StoreCart, StoreCartPriceChange, StoreOrder } from "@/lib/api/types";
import { getAccessToken } from "@/lib/session";

export type CartActionError = "session" | "forbidden" | "stock" | "empty" | "generic";

export type CartActionResult =
  | { ok: true; cart: StoreCart }
  | { ok: false; error: CartActionError };

export type CheckoutActionResult =
  | { ok: true; order: StoreOrder }
  | { ok: false; error: "price_changed"; changes: StoreCartPriceChange[] }
  | { ok: false; error: CartActionError };

function revalidateCart() {
  revalidatePath("/shop");
  revalidatePath("/shop/cart");
  revalidatePath("/shop/products", "layout");
}

function mapCartError(error: unknown, kind: "mutate" | "checkout"): CartActionError {
  if (error instanceof ApiError) {
    if (error.status === 401) return "session";
    if (error.status === 403) return "forbidden";
    if (error.code === "CartPriceChanged") return "generic";
    if (error.code === "InsufficientStock" || error.status === 409) return "stock";
    if (error.status === 422) return kind === "checkout" ? "empty" : "generic";
  }
  return "generic";
}

function parsePriceChanges(data: unknown): StoreCartPriceChange[] {
  if (!data || typeof data !== "object") return [];
  const changes = (data as { changes?: unknown }).changes;
  if (!Array.isArray(changes)) return [];
  return changes.flatMap((change) => {
    if (!change || typeof change !== "object") return [];
    const row = change as Partial<StoreCartPriceChange>;
    if (
      typeof row.product_id !== "string"
      || typeof row.name !== "string"
      || typeof row.previous_unit_price !== "number"
      || typeof row.current_unit_price !== "number"
    ) {
      return [];
    }
    return [{
      product_id: row.product_id,
      name: row.name,
      previous_unit_price: row.previous_unit_price,
      current_unit_price: row.current_unit_price,
    }];
  });
}

export async function addToCartAction(
  productId: string,
  quantity = 1,
): Promise<CartActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  if (!Number.isInteger(quantity) || quantity < 1) {
    return { ok: false, error: "generic" };
  }
  try {
    const cart = await ensureStoreCart(token);
    await addStoreCartItem(token, cart.pk_user_cart, {
      productId,
      quantity: String(quantity),
    });
    const refreshed = await ensureStoreCart(token);
    revalidateCart();
    return { ok: true, cart: refreshed };
  } catch (error) {
    return { ok: false, error: mapCartError(error, "mutate") };
  }
}

export async function updateCartItemQuantityAction(
  itemId: number,
  quantity: number,
): Promise<CartActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  if (!Number.isInteger(quantity) || quantity < 0) {
    return { ok: false, error: "generic" };
  }

  try {
    const cart = await ensureStoreCart(token);
    if (quantity === 0) {
      await deleteStoreCartItem(token, cart.pk_user_cart, itemId);
    } else {
      await updateStoreCartItem(token, cart.pk_user_cart, itemId, {
        quantity: String(quantity),
      });
    }
    const refreshed = await ensureStoreCart(token);
    revalidateCart();
    return { ok: true, cart: refreshed };
  } catch (error) {
    return { ok: false, error: mapCartError(error, "mutate") };
  }
}

export async function removeCartItemAction(itemId: number): Promise<CartActionResult> {
  return updateCartItemQuantityAction(itemId, 0);
}

export async function checkoutCartAction(): Promise<CheckoutActionResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  try {
    const order = await checkoutStoreCart(token);
    revalidateCart();
    revalidatePath(`/shop/orders/${order.id}`);
    return { ok: true, order };
  } catch (error) {
    if (error instanceof ApiError && error.code === "CartPriceChanged") {
      revalidateCart();
      return {
        ok: false,
        error: "price_changed",
        changes: parsePriceChanges(error.data),
      };
    }
    return { ok: false, error: mapCartError(error, "checkout") };
  }
}
