import { describe, expect, it } from "vitest";

import { hasSellablePrice, toMoneyNumber } from "@/lib/format-money";

describe("hasSellablePrice", () => {
  it("accepts finite amounts greater than zero", () => {
    expect(hasSellablePrice(12.5)).toBe(true);
    expect(hasSellablePrice("0.01")).toBe(true);
  });

  it("rejects missing, zero, and invalid amounts", () => {
    expect(hasSellablePrice(0)).toBe(false);
    expect(hasSellablePrice("0.00")).toBe(false);
    expect(hasSellablePrice(null)).toBe(false);
    expect(hasSellablePrice(undefined)).toBe(false);
    expect(hasSellablePrice("")).toBe(false);
    expect(hasSellablePrice("abc")).toBe(false);
  });
});

describe("toMoneyNumber", () => {
  it("rounds finite values to two decimals", () => {
    expect(toMoneyNumber("12.505")).toBe(12.51);
    expect(toMoneyNumber(null)).toBe(0);
  });
});
