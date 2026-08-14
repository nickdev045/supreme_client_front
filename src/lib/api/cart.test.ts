import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
  apiData: vi.fn(),
}));

import { apiData, apiRequest } from "@/lib/api/client";
import {
  addStoreCartItem,
  cartItemCount,
  cartQuantitiesByProductId,
  checkoutStoreCart,
  ensureStoreCart,
  listStoreCarts,
  listStoreOrders,
} from "@/lib/api/cart";
import type { StoreCart } from "@/lib/api/types";

const cart: StoreCart = {
  pk_user_cart: 9,
  fk_company: "co-1",
  fk_user: "u-1",
  cart_products: [
    {
      pk_cart_product: 1,
      fk_product: "p1",
      fk_user_cart: 9,
      quantity: "2",
      unit_price: "12.50",
      selected: true,
      product: {
        pk_product: "p1",
        name: "Roma Tomatoes",
        photo_url: null,
        stock: "8",
        sale_price: "12.50",
      },
    },
  ],
};

describe("store cart API", () => {
  beforeEach(() => {
    vi.mocked(apiData).mockReset();
    vi.mocked(apiRequest).mockReset();
  });

  it("lists carts and counts distinct product types", async () => {
    vi.mocked(apiData).mockResolvedValue([cart]);
    const result = await listStoreCarts("token-abc");
    expect(apiData).toHaveBeenCalledWith("/api/v1/customer/carts", {
      method: "GET",
      token: "token-abc",
    });
    expect(cartItemCount(result[0])).toBe(1);
    expect(
      cartItemCount({
        ...cart,
        cart_products: [
          ...cart.cart_products,
          { ...cart.cart_products[0], pk_cart_product: 2, fk_product: "p2" },
        ],
      }),
    ).toBe(2);
    expect(cartQuantitiesByProductId(result[0])).toEqual({ p1: 2 });
  });

  it("creates a cart when none exist", async () => {
    vi.mocked(apiData)
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(cart);
    const ensured = await ensureStoreCart("token-abc");
    expect(apiData).toHaveBeenNthCalledWith(2, "/api/v1/customer/carts", {
      method: "POST",
      token: "token-abc",
      body: {},
    });
    expect(ensured.pk_user_cart).toBe(9);
  });

  it("adds an item and checks out", async () => {
    vi.mocked(apiData).mockResolvedValueOnce(cart.cart_products[0]).mockResolvedValueOnce({
      id: "bill-1",
      state: "PAID",
      origin: "ONLINE",
      created_at: null,
      delivery: { id: 1, state: null, delivery_date: null },
      lines: [],
      total: 25,
      payment: { id: 3, amount: 25, method: "CASH", status: "COMPLETED" },
    });

    await addStoreCartItem("token-abc", 9, { productId: "p1", quantity: "1" });
    expect(apiData).toHaveBeenCalledWith("/api/v1/customer/carts/9/items", {
      method: "POST",
      token: "token-abc",
      body: { fk_product: "p1", quantity: "1", selected: true },
    });

    const order = await checkoutStoreCart("token-abc", { delivery_mode: "PICKUP" });
    expect(apiData).toHaveBeenCalledWith("/api/v1/customer/checkout", {
      method: "POST",
      token: "token-abc",
      body: { delivery_mode: "PICKUP" },
    });
    expect(order.payment?.status).toBe("COMPLETED");
  });

  it("lists store orders with pagination query", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: [
        {
          id: "bill-1",
          state: "PAID",
          origin: "ONLINE",
          created_at: "2026-08-13T00:00:00.000Z",
          delivery: null,
          lines: [],
          total: 25,
          payment: null,
        },
      ],
      meta: { page: 1, limit: 10, total: 1, state: null, sort: "desc" },
    });

    const result = await listStoreOrders("token-abc", { page: 1, limit: 10, sort: "desc" });
    expect(apiRequest).toHaveBeenCalledWith(
      "/api/v1/customer/orders?page=1&limit=10&sort=desc",
      { method: "GET", token: "token-abc" },
    );
    expect(result.data[0]?.id).toBe("bill-1");
    expect(result.meta.total).toBe(1);
  });
});
