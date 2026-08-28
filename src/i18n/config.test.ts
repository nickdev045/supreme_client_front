import { describe, expect, it } from "vitest";

import { defaultLocale, resolveLocale } from "./config";

describe("resolveLocale", () => {
  it("defaults to English when the header is missing", () => {
    expect(resolveLocale(undefined)).toBe(defaultLocale);
    expect(resolveLocale(null)).toBe("en");
    expect(resolveLocale("")).toBe("en");
  });

  it("uses Spanish when the browser prefers it", () => {
    expect(resolveLocale("es")).toBe("es");
    expect(resolveLocale("es-MX,es;q=0.9,en;q=0.8")).toBe("es");
  });

  it("uses English when it outranks Spanish", () => {
    expect(resolveLocale("en-US,en;q=0.9,es;q=0.8")).toBe("en");
    expect(resolveLocale("es;q=0.4,en;q=0.8")).toBe("en");
  });

  it("falls back to English for unsupported languages", () => {
    expect(resolveLocale("fr-FR,de;q=0.8")).toBe("en");
    expect(resolveLocale("*")).toBe("en");
  });
});
