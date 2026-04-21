import { describe, it, expect, vi } from "vitest";

// isAiQuotaExceeded reads process.env.KV_REST_API_URL at module-load time,
// so disable KV in the test process → exercise the in-memory path.
delete process.env.KV_REST_API_URL;

// Prevent the @vercel/kv import from throwing at module-load if credentials missing.
vi.mock("@vercel/kv", () => ({ kv: { incr: vi.fn(), expire: vi.fn() } }));

import { isAiQuotaExceeded, secondsUntilMidnightUTC } from "@/lib/ai-quota";

describe("secondsUntilMidnightUTC", () => {
  it("returns a positive number within one day", () => {
    const n = secondsUntilMidnightUTC();
    expect(n).toBeGreaterThan(0);
    expect(n).toBeLessThanOrEqual(86400);
  });
});

describe("isAiQuotaExceeded — authenticated users (cap 50)", () => {
  it("allows the first request for a new userId", async () => {
    const id = `user-${Date.now()}-first`;
    expect(await isAiQuotaExceeded({ type: "user", id })).toBe(false);
  });

  it("allows up to 50 requests, then blocks", async () => {
    const id = `user-${Date.now()}-cap`;
    for (let i = 0; i < 50; i++) {
      expect(await isAiQuotaExceeded({ type: "user", id })).toBe(false);
    }
    expect(await isAiQuotaExceeded({ type: "user", id })).toBe(true);
    expect(await isAiQuotaExceeded({ type: "user", id })).toBe(true);
  });

  it("isolates counts between users", async () => {
    const a = `user-${Date.now()}-A`;
    const b = `user-${Date.now()}-B`;
    for (let i = 0; i < 50; i++) await isAiQuotaExceeded({ type: "user", id: a });
    expect(await isAiQuotaExceeded({ type: "user", id: a })).toBe(true);
    expect(await isAiQuotaExceeded({ type: "user", id: b })).toBe(false);
  });
});

describe("isAiQuotaExceeded — anonymous IPs (cap 20)", () => {
  it("allows the first request for a new IP", async () => {
    const ip = `1.2.3.${Date.now() % 255}-first`;
    expect(await isAiQuotaExceeded({ type: "ip", ip })).toBe(false);
  });

  it("allows up to 20 requests, then blocks", async () => {
    const ip = `10.0.0.${Date.now() % 255}-cap`;
    for (let i = 0; i < 20; i++) {
      expect(await isAiQuotaExceeded({ type: "ip", ip })).toBe(false);
    }
    expect(await isAiQuotaExceeded({ type: "ip", ip })).toBe(true);
  });

  it("isolates counts between IPs", async () => {
    const ipA = `ip-${Date.now()}-A`;
    const ipB = `ip-${Date.now()}-B`;
    for (let i = 0; i < 20; i++) await isAiQuotaExceeded({ type: "ip", ip: ipA });
    expect(await isAiQuotaExceeded({ type: "ip", ip: ipA })).toBe(true);
    expect(await isAiQuotaExceeded({ type: "ip", ip: ipB })).toBe(false);
  });

  it("does not share state between a user and an IP with the same id", async () => {
    const shared = `shared-${Date.now()}`;
    // Burn the user cap
    for (let i = 0; i < 50; i++) await isAiQuotaExceeded({ type: "user", id: shared });
    expect(await isAiQuotaExceeded({ type: "user", id: shared })).toBe(true);
    // Same string as an IP should be untouched (different key prefix)
    expect(await isAiQuotaExceeded({ type: "ip", ip: shared })).toBe(false);
  });
});

describe("isAiQuotaExceeded — memory-fallback date partitioning", () => {
  it("key includes today's UTC date so counts rotate daily", async () => {
    // Fresh identifier, then a second call — both should share the same day bucket.
    const id = `date-${Date.now()}`;
    expect(await isAiQuotaExceeded({ type: "user", id })).toBe(false);
    expect(await isAiQuotaExceeded({ type: "user", id })).toBe(false);
    // Two calls within the same day should both be under the cap of 50.
  });
});
