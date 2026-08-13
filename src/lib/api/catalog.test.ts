import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
  apiData: vi.fn(),
}));

import { apiData, apiRequest } from "@/lib/api/client";
import { fetchStoreCatalog, fetchStoreProduct } from "@/lib/api/catalog";

describe("fetchStoreCatalog", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
    vi.mocked(apiData).mockReset();
  });

  it("calls the store catalog endpoint with query params", async () => {
    vi.mocked(apiRequest).mockResolvedValue({
      data: [
        {
          id: "p1",
          name: "Roma Tomatoes",
          image: null,
          unit: "case",
          stock: 8,
          stock_status: "in_stock",
          price: 24.8,
        },
      ],
      meta: {
        page: 1,
        limit: 12,
        total: 1,
        search: null,
        orderBy: "name",
        sort: "asc",
      },
    });

    const result = await fetchStoreCatalog("token-abc", {
      page: 1,
      limit: 12,
      orderBy: "name",
      sort: "asc",
    });

    expect(apiRequest).toHaveBeenCalledWith(
      "/api/v1/customer/catalog?page=1&limit=12&orderBy=name&sort=asc",
      { method: "GET", token: "token-abc" },
    );
    expect(result.data).toHaveLength(1);
    expect(result.data[0]?.price).toBe(24.8);
  });

  it("loads a product detail by id", async () => {
    vi.mocked(apiData).mockResolvedValue({
      id: "p1",
      name: "Roma Tomatoes",
      image: "https://example.com/roma.png",
      images: ["https://example.com/roma.png"],
      unit: "case",
      stock: 8,
      stock_status: "in_stock",
      price: 24.8,
      description: "25 lb case",
    });

    const product = await fetchStoreProduct("token-abc", "p1");
    expect(apiData).toHaveBeenCalledWith("/api/v1/customer/catalog/p1", {
      method: "GET",
      token: "token-abc",
    });
    expect(product.description).toBe("25 lb case");
    expect(product.images).toEqual(["https://example.com/roma.png"]);
  });
});
