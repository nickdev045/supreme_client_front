import { afterEach, describe, expect, it, vi } from "vitest";

describe("getServerEnv", () => {
  afterEach(() => {
    vi.resetModules();
    vi.unstubAllEnvs();
  });

  it("parses valid env", async () => {
    vi.stubEnv("API_URL", "http://localhost:3000");
    vi.stubEnv("NEXTAUTH_URL", "http://localhost:3002");
    vi.stubEnv("NEXTAUTH_SECRET", "x".repeat(32));

    const { getServerEnv } = await import("./env");
    expect(getServerEnv().API_URL).toBe("http://localhost:3000");
  });
});
