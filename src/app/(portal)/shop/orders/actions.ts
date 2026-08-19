"use server";

import { revalidatePath } from "next/cache";

import {
  addStoreCartItem,
  cancelStoreOrder,
  ensureStoreCart,
  listStoreOrders,
  STORE_ORDERS_PAGE_SIZE,
  fetchStoreOrder,
} from "@/lib/api/cart";
import { ApiError } from "@/lib/api/client";
import type { StoreOrder } from "@/lib/api/types";
import { getAccessToken } from "@/lib/session";

export type LoadOrdersPageResult =
  | {
      ok: true;
      orders: StoreOrder[];
      page: number;
      total: number;
      hasMore: boolean;
    }
  | { ok: false; error: "session" | "forbidden" | "generic" };

export type BuyAgainResult =
  | { ok: true; added: number; skipped: number }
  | { ok: false; error: "session" | "forbidden" | "empty" | "generic" };

export async function loadOrdersPageAction(input: {
  page: number;
  limit?: number;
}): Promise<LoadOrdersPageResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };

  const page = Number.isFinite(input.page) && input.page > 0 ? Math.floor(input.page) : 1;
  const limit =
    Number.isFinite(input.limit) && (input.limit ?? 0) > 0
      ? Math.min(Math.floor(input.limit!), 100)
      : STORE_ORDERS_PAGE_SIZE;

  try {
    const response = await listStoreOrders(token, { page, limit, sort: "desc" });
    const loaded = page * limit;
    return {
      ok: true,
      orders: response.data,
      page: response.meta.page,
      total: response.meta.total,
      hasMore: loaded < response.meta.total,
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, error: "forbidden" };
    }
    return { ok: false, error: "generic" };
  }
}

export type CancelOrderResult =
  | { ok: true; order: StoreOrder }
  | { ok: false; error: "session" | "forbidden" | "shipping" | "locked" | "generic" };

export async function cancelOrderAction(orderId: string): Promise<CancelOrderResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  if (!orderId.trim()) return { ok: false, error: "generic" };

  try {
    const order = await cancelStoreOrder(token, orderId);
    revalidatePath("/shop");
    revalidatePath("/shop/cart");
    revalidatePath("/shop/products", "layout");
    revalidatePath("/shop/orders");
    revalidatePath(`/shop/orders/${orderId}`);
    return { ok: true, order };
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { ok: false, error: "session" };
    }
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, error: "forbidden" };
    }
    if (error instanceof ApiError && error.code === "OrderAlreadyShipped") {
      return { ok: false, error: "shipping" };
    }
    if (error instanceof ApiError && (error.code === "OrderNotCancellable" || error.status === 409)) {
      return { ok: false, error: "locked" };
    }
    return { ok: false, error: "generic" };
  }
}

export async function buyAgainOrderAction(orderId: string): Promise<BuyAgainResult> {
  const token = await getAccessToken();
  if (!token) return { ok: false, error: "session" };
  if (!orderId.trim()) return { ok: false, error: "generic" };

  try {
    const order = await fetchStoreOrder(token, orderId);
    if (order.lines.length === 0) return { ok: false, error: "empty" };

    const cart = await ensureStoreCart(token);
    let added = 0;
    let skipped = 0;
    for (const line of order.lines) {
      const quantity = Math.max(1, Math.floor(Number(line.quantity) || 0));
      if (quantity < 1) {
        skipped += 1;
        continue;
      }
      try {
        await addStoreCartItem(token, cart.pk_user_cart, {
          productId: line.product_id,
          quantity: String(quantity),
        });
        added += 1;
      } catch {
        skipped += 1;
      }
    }

    revalidatePath("/shop");
    revalidatePath("/shop/cart");
    revalidatePath("/shop/products", "layout");
    revalidatePath("/shop/orders");
    revalidatePath(`/shop/orders/${orderId}`);

    if (added === 0) return { ok: false, error: "empty" };
    return { ok: true, added, skipped };
  } catch (error) {
    if (error instanceof ApiError && error.status === 403) {
      return { ok: false, error: "forbidden" };
    }
    if (error instanceof ApiError && error.status === 404) {
      return { ok: false, error: "generic" };
    }
    return { ok: false, error: "generic" };
  }
}
