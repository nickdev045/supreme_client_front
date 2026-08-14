import { describe, expect, it, vi, beforeEach } from "vitest";

vi.mock("@/lib/api/client", () => ({
  apiRequest: vi.fn(),
  apiData: vi.fn(),
}));

import { apiData, apiRequest } from "@/lib/api/client";
import {
  addStoreFavourite,
  deleteStoreFavourite,
  favouriteIdsByProductId,
  favouriteToCatalogCard,
  listStoreFavourites,
} from "@/lib/api/favourites";
import type { StoreFavourite } from "@/lib/api/types";

const favourite: StoreFavourite = {
  pk_user_favourite: 4,
  fk_user: "u-1",
  fk_product: "p1",
  product: {
    pk_product: "p1",
    name: "Roma Tomatoes",
    photo_url: null,
    stock: "8",
    sale_price: "12.50",
    is_active: true,
    meassure: { name: "case" },
  },
};

describe("store favourites API", () => {
  beforeEach(() => {
    vi.mocked(apiData).mockReset();
    vi.mocked(apiRequest).mockReset();
  });

  it("lists favourites and maps them to catalog cards", async () => {
    vi.mocked(apiData).mockResolvedValue([favourite]);
    const result = await listStoreFavourites("token-abc");
    expect(apiData).toHaveBeenCalledWith("/api/v1/customer/favourites", {
      method: "GET",
      token: "token-abc",
    });
    expect(favouriteIdsByProductId(result)).toEqual({ p1: 4 });
    expect(favouriteToCatalogCard(result[0]!)).toEqual({
      id: "p1",
      name: "Roma Tomatoes",
      image: null,
      unit: "case",
      stock: 8,
      stock_status: "in_stock",
      price: 12.5,
    });
  });

  it("adds and deletes a favourite", async () => {
    vi.mocked(apiData).mockResolvedValue({
      pk_user_favourite: 4,
      fk_user: "u-1",
      fk_product: "p1",
    });
    await addStoreFavourite("token-abc", "p1");
    expect(apiData).toHaveBeenCalledWith("/api/v1/customer/favourites", {
      method: "POST",
      token: "token-abc",
      body: { fk_product: "p1" },
    });

    await deleteStoreFavourite("token-abc", 4);
    expect(apiRequest).toHaveBeenCalledWith("/api/v1/customer/favourites/4", {
      method: "DELETE",
      token: "token-abc",
    });
  });
});
