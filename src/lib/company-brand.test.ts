import { describe, expect, it } from "vitest";

import { DEFAULT_COMPANY_LOGO, companyLogoSrc, isRemoteImageSrc } from "@/lib/company-brand";

describe("companyLogoSrc", () => {
  it("falls back to the default logo when the company has no photo", () => {
    expect(companyLogoSrc(null)).toBe(DEFAULT_COMPANY_LOGO);
    expect(companyLogoSrc("")).toBe(DEFAULT_COMPANY_LOGO);
    expect(companyLogoSrc("   ")).toBe(DEFAULT_COMPANY_LOGO);
  });

  it("uses the company photo when present", () => {
    expect(companyLogoSrc("https://storage.googleapis.com/bucket/logo.png")).toBe(
      "https://storage.googleapis.com/bucket/logo.png",
    );
  });
});

describe("isRemoteImageSrc", () => {
  it("detects http(s) URLs", () => {
    expect(isRemoteImageSrc("https://example.com/logo.png")).toBe(true);
    expect(isRemoteImageSrc("http://localhost:3000/uploads/logo.png")).toBe(true);
    expect(isRemoteImageSrc("/logo.png")).toBe(false);
  });
});
