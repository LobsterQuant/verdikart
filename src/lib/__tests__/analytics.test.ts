import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { track } from "@/lib/analytics";

// vitest config uses environment: "node", so `window` is undefined unless we
// stub it. `stubGlobal("window", ...)` injects a window for the call, then we
// restore at the top of each test that needs a clean slate.

describe("track() — SSR / missing-plausible fallbacks", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("no-ops in SSR when window is undefined", () => {
    // window is already undefined in the node test env — just verify no throw.
    expect(() => track("login_started")).not.toThrow();
  });

  it("no-ops when window.plausible is not defined (e.g. ad-blocker)", () => {
    vi.stubGlobal("window", {});
    expect(() => track("login_started")).not.toThrow();
  });

  it("no-ops when window.plausible is not a function", () => {
    vi.stubGlobal("window", { plausible: "not-a-function" });
    expect(() => track("login_started")).not.toThrow();
  });
});

describe("track() — event dispatch", () => {
  let plausible: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    plausible = vi.fn();
    vi.stubGlobal("window", { plausible });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("calls plausible with the event name when no props supplied", () => {
    track("login_started");
    expect(plausible).toHaveBeenCalledTimes(1);
    expect(plausible).toHaveBeenCalledWith("login_started", undefined);
  });

  it("passes typed props through to plausible", () => {
    track("address_searched", { resultsCount: 3 });
    expect(plausible).toHaveBeenCalledWith("address_searched", {
      props: { resultsCount: 3 },
    });
  });

  it("strips undefined and null values from props", () => {
    // Optional prop (`bank`) left undefined — must not land in the outbound payload.
    track("lead_form_submitted", { kommunenummer: "0301", bank: undefined });
    expect(plausible).toHaveBeenCalledWith("lead_form_submitted", {
      props: { kommunenummer: "0301" },
    });
  });

  it("omits the options arg entirely when every prop is stripped", () => {
    // @ts-expect-error — intentionally forcing all-undefined to verify stripping
    track("address_searched", { resultsCount: undefined });
    expect(plausible).toHaveBeenCalledWith("address_searched", undefined);
  });

  it("forwards boolean props verbatim", () => {
    track("ai_summary_requested", { authenticated: false });
    expect(plausible).toHaveBeenCalledWith("ai_summary_requested", {
      props: { authenticated: false },
    });
  });

  it("swallows errors thrown by plausible so analytics never break UX", () => {
    plausible.mockImplementation(() => {
      throw new Error("plausible exploded");
    });
    expect(() => track("dashboard_viewed", { savedCount: 0, alertsCount: 0 })).not.toThrow();
  });
});
