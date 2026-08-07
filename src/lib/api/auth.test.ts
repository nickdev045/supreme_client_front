import { describe, expect, it } from "vitest";

import { ApiError } from "./client";
import {
  canAccessStorePortal,
  normalizePermissionCodes,
  toAuthErrorKey,
  toAuthErrorMessage,
} from "./auth";

describe("canAccessStorePortal", () => {
  it("allows buyer-style permissions", () => {
    expect(canAccessStorePortal(["carts.read", "favourites.read"])).toBe(true);
  });

  it("rejects warehouse-only permissions", () => {
    expect(canAccessStorePortal(["inventory.read", "purchases.read"])).toBe(false);
  });

  it("rejects empty permissions", () => {
    expect(canAccessStorePortal([])).toBe(false);
  });
});

describe("normalizePermissionCodes", () => {
  it("accepts string and object entries", () => {
    expect(
      normalizePermissionCodes(["carts.read", { code: "addresses.write" }, { name: "x" }]),
    ).toEqual(["carts.read", "addresses.write"]);
  });
});

describe("toAuthErrorKey / toAuthErrorMessage", () => {
  it("maps API status codes for login UX", () => {
    expect(toAuthErrorKey(new ApiError(401, "no"))).toBe("invalidCredentials");
    expect(toAuthErrorKey(new ApiError(403, "no"))).toBe("accessDenied");
    expect(toAuthErrorKey(new ApiError(429, "no"))).toBe("tooManyAttempts");
    expect(toAuthErrorKey(new ApiError(400, "no"))).toBe("checkEmail");
    expect(toAuthErrorMessage(new ApiError(403, "no"))).toMatch(/client portal/i);
  });
});
