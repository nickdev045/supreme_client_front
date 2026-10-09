import { describe, expect, it } from "vitest";

import { buildShopHref, formatClassificationLabel, parseShopUuid } from "@/lib/shop-query";

describe("shop query helpers", () => {
  it("builds a shareable shop href with classification filters", () => {
    expect(
      buildShopHref({
        search: "arroz",
        orderBy: "sale_price",
        sort: "desc",
        fk_product_category: "11111111-1111-4111-8111-111111111111",
        fk_product_subcategory: "22222222-2222-4222-8222-222222222222",
      }),
    ).toBe(
      "/shop?q=arroz&orderBy=sale_price&sort=desc&fk_product_category=11111111-1111-4111-8111-111111111111&fk_product_subcategory=22222222-2222-4222-8222-222222222222",
    );
  });

  it("formats the classification line used on cards and cart", () => {
    expect(formatClassificationLabel({ name: "Abarrotes" }, { name: "Granos" })).toBe(
      "Abarrotes · Granos",
    );
    expect(formatClassificationLabel({ name: "Abarrotes" }, null)).toBe("Abarrotes");
    expect(formatClassificationLabel(null, null)).toBe("");
  });

  it("accepts only UUID classification ids", () => {
    expect(parseShopUuid("11111111-1111-4111-8111-111111111111")).toBe(
      "11111111-1111-4111-8111-111111111111",
    );
    expect(parseShopUuid("not-a-uuid")).toBeUndefined();
  });
});
