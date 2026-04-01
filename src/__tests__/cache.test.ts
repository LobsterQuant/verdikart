import { describe, it, expect, vi } from "vitest";
import { cachedFetch, TTL } from "@/lib/cache";

describe("cachedFetch (in-memory fallback)", () => {
  it("calls fetcher on cache miss", async () => {
    const fetcher = vi.fn().mockResolvedValue({ data: "fresh" });
    const result = await cachedFetch("test:miss:" + Date.now(), 60, fetcher);
    expect(result).toEqual({ data: "fresh" });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("returns cached value on cache hit", async () => {
    const key = "test:hit:" + Date.now();
    const fetcher = vi.fn().mockResolvedValue({ data: "first" });

    await cachedFetch(key, 60, fetcher);
    const result = await cachedFetch(key, 60, vi.fn().mockResolvedValue({ data: "second" }));

    expect(result).toEqual({ data: "first" });
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("refetches after TTL expires", async () => {
    const key = "test:expire:" + Date.now();
    const fetcher1 = vi.fn().mockResolvedValue("old");
    const fetcher2 = vi.fn().mockResolvedValue("new");

    await cachedFetch(key, 0, fetcher1); // TTL=0, expires immediately
    // Small delay to ensure expiry
    await new Promise((r) => setTimeout(r, 10));
    const result = await cachedFetch(key, 60, fetcher2);

    expect(result).toBe("new");
    expect(fetcher2).toHaveBeenCalledOnce();
  });
});

describe("TTL constants", () => {
  it("has correct values", () => {
    expect(TTL.ONE_HOUR).toBe(3600);
    expect(TTL.ONE_DAY).toBe(86400);
    expect(TTL.ONE_WEEK).toBe(604800);
  });
});
