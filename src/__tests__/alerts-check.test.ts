import { describe, it, expect, vi } from "vitest";
import { runPriceAlertCheck, type AlertRow, type CheckDeps } from "@/lib/alerts/check";
import type { KommunePriceIndex } from "@/lib/alerts/price-index";

function makeRow(overrides: Partial<AlertRow> = {}): AlertRow {
  return {
    id: "alert-1",
    userId: "user-1",
    kommunenummer: "0301",
    thresholdPct: 5,
    lastKnownValue: null,
    active: true,
    email: "user@example.com",
    ...overrides,
  };
}

function makeDeps(overrides: Partial<CheckDeps> = {}): {
  deps: CheckDeps;
  sendEmail: ReturnType<typeof vi.fn>;
  updateAlertValue: ReturnType<typeof vi.fn>;
  markNotified: ReturnType<typeof vi.fn>;
  fetchPriceIndex: ReturnType<typeof vi.fn>;
} {
  const sendEmail = vi.fn().mockResolvedValue({ id: "msg-1" });
  const updateAlertValue = vi.fn().mockResolvedValue(undefined);
  const markNotified = vi.fn().mockResolvedValue(undefined);
  const fetchPriceIndex = vi.fn();
  const deps: CheckDeps = {
    loadActiveAlerts: async () => [],
    fetchPriceIndex,
    sendEmail,
    updateAlertValue,
    markNotified,
    now: () => new Date("2026-04-27T07:00:00Z"),
    ...overrides,
  };
  return { deps, sendEmail, updateAlertValue, markNotified, fetchPriceIndex };
}

const osloIndex: KommunePriceIndex = {
  value: 85_000,
  kommuneName: "Oslo",
  period: "2024",
};

describe("runPriceAlertCheck", () => {
  it("initializes a null baseline without sending email", async () => {
    const row = makeRow({ lastKnownValue: null });
    const { deps, sendEmail, updateAlertValue, markNotified, fetchPriceIndex } = makeDeps({
      loadActiveAlerts: async () => [row],
    });
    fetchPriceIndex.mockResolvedValue(osloIndex);

    const summary = await runPriceAlertCheck(deps);

    expect(summary).toEqual({
      checked: 1,
      initialized: 1,
      notified: 0,
      skipped: 0,
      errors: [],
    });
    expect(updateAlertValue).toHaveBeenCalledWith("alert-1", 85_000);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(markNotified).not.toHaveBeenCalled();
  });

  it("sends an email and marks notified when change crosses threshold", async () => {
    const row = makeRow({ lastKnownValue: 80_000, thresholdPct: 5 });
    const { deps, sendEmail, markNotified, updateAlertValue, fetchPriceIndex } = makeDeps({
      loadActiveAlerts: async () => [row],
    });
    fetchPriceIndex.mockResolvedValue(osloIndex); // 85_000, +6.25%

    const summary = await runPriceAlertCheck(deps);

    expect(summary.notified).toBe(1);
    expect(summary.initialized).toBe(0);
    expect(summary.skipped).toBe(0);
    expect(sendEmail).toHaveBeenCalledWith({
      to: "user@example.com",
      kommuneName: "Oslo",
      changePct: 6.3,
      thresholdPct: 5,
      previousValue: 80_000,
      currentValue: 85_000,
    });
    expect(markNotified).toHaveBeenCalledWith(
      "alert-1",
      85_000,
      new Date("2026-04-27T07:00:00Z"),
    );
    expect(updateAlertValue).not.toHaveBeenCalled();
  });

  it("skips when change is below threshold and does not update baseline", async () => {
    const row = makeRow({ lastKnownValue: 84_000, thresholdPct: 5 });
    const { deps, sendEmail, updateAlertValue, markNotified, fetchPriceIndex } = makeDeps({
      loadActiveAlerts: async () => [row],
    });
    fetchPriceIndex.mockResolvedValue(osloIndex); // 85_000 from 84_000 = +1.19%

    const summary = await runPriceAlertCheck(deps);

    expect(summary.skipped).toBe(1);
    expect(summary.notified).toBe(0);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(updateAlertValue).not.toHaveBeenCalled();
    expect(markNotified).not.toHaveBeenCalled();
  });

  it("caches SSB results across alerts in the same kommune", async () => {
    const rows = [
      makeRow({ id: "a", userId: "u1", email: "a@x.no", lastKnownValue: 80_000 }),
      makeRow({ id: "b", userId: "u2", email: "b@x.no", lastKnownValue: 80_000 }),
      makeRow({ id: "c", userId: "u3", email: "c@x.no", lastKnownValue: null }),
    ];
    const { deps, fetchPriceIndex, sendEmail } = makeDeps({
      loadActiveAlerts: async () => rows,
    });
    fetchPriceIndex.mockResolvedValue(osloIndex);

    const summary = await runPriceAlertCheck(deps);

    expect(fetchPriceIndex).toHaveBeenCalledTimes(1);
    expect(summary.notified).toBe(2);
    expect(summary.initialized).toBe(1);
    expect(sendEmail).toHaveBeenCalledTimes(2);
  });

  it("isolates errors per alert — a Resend failure does not kill the run", async () => {
    const rows = [
      makeRow({ id: "good", userId: "u1", email: "good@x.no", lastKnownValue: 80_000 }),
      makeRow({ id: "bad", userId: "u2", email: "bad@x.no", lastKnownValue: 80_000 }),
    ];
    const { deps, sendEmail, markNotified } = makeDeps({
      loadActiveAlerts: async () => rows,
      fetchPriceIndex: vi.fn().mockResolvedValue(osloIndex),
    });
    sendEmail
      .mockResolvedValueOnce({ id: "msg-good" })
      .mockRejectedValueOnce(new Error("Resend 500"));

    const summary = await runPriceAlertCheck(deps);

    expect(summary.checked).toBe(2);
    expect(summary.notified).toBe(1);
    expect(summary.errors).toEqual([{ alertId: "bad", error: "Resend 500" }]);
    expect(markNotified).toHaveBeenCalledOnce();
    expect(markNotified).toHaveBeenCalledWith("good", 85_000, expect.any(Date));
  });

  it("records an error when SSB returns no data for a kommune", async () => {
    const rows = [
      makeRow({ id: "missing", kommunenummer: "9999", lastKnownValue: 80_000 }),
    ];
    const { deps, sendEmail } = makeDeps({
      loadActiveAlerts: async () => rows,
      fetchPriceIndex: vi.fn().mockResolvedValue(null),
    });

    const summary = await runPriceAlertCheck(deps);

    expect(summary.checked).toBe(1);
    expect(summary.notified).toBe(0);
    expect(summary.errors).toHaveLength(1);
    expect(summary.errors[0].alertId).toBe("missing");
    expect(summary.errors[0].error).toMatch(/SSB returned no data/);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("records an error when a notifiable row has no email", async () => {
    const rows = [makeRow({ email: null, lastKnownValue: 80_000 })];
    const { deps, sendEmail } = makeDeps({
      loadActiveAlerts: async () => rows,
      fetchPriceIndex: vi.fn().mockResolvedValue(osloIndex),
    });

    const summary = await runPriceAlertCheck(deps);

    expect(summary.notified).toBe(0);
    expect(summary.errors).toEqual([
      { alertId: "alert-1", error: "User has no email address" },
    ]);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("falls back to 5.0% threshold when thresholdPct is null", async () => {
    const rows = [makeRow({ lastKnownValue: 80_000, thresholdPct: null })];
    const { deps, sendEmail } = makeDeps({
      loadActiveAlerts: async () => rows,
      fetchPriceIndex: vi.fn().mockResolvedValue(osloIndex), // +6.25%
    });

    const summary = await runPriceAlertCheck(deps);

    expect(summary.notified).toBe(1);
    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ thresholdPct: 5 }),
    );
  });

  it("uses 'Kommune {nr}' when SSB does not return a label", async () => {
    const rows = [makeRow({ lastKnownValue: 80_000, kommunenummer: "1103" })];
    const { deps, sendEmail } = makeDeps({
      loadActiveAlerts: async () => rows,
      fetchPriceIndex: vi
        .fn()
        .mockResolvedValue({ ...osloIndex, kommuneName: "" }),
    });

    await runPriceAlertCheck(deps);

    expect(sendEmail).toHaveBeenCalledWith(
      expect.objectContaining({ kommuneName: "Kommune 1103" }),
    );
  });

  it("returns empty summary when no alerts exist", async () => {
    const { deps, fetchPriceIndex, sendEmail } = makeDeps({
      loadActiveAlerts: async () => [],
    });

    const summary = await runPriceAlertCheck(deps);

    expect(summary).toEqual({
      checked: 0,
      initialized: 0,
      notified: 0,
      skipped: 0,
      errors: [],
    });
    expect(fetchPriceIndex).not.toHaveBeenCalled();
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
