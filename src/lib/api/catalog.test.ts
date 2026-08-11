import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
}));

import { apiRequest } from "@/lib/api/client";
import { fetchStoreCatalog } from "@/lib/api/catalog";

describe("fetchStoreCatalog", () => {
  beforeEach(() => {
    vi.mocked(apiRequest).mockReset();
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
});
