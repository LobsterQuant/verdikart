/**
 * Plausible event taxonomy for Verdikart.
 *
 * All user-facing events go through track() to enforce typed names and props.
 * Fails silently if Plausible isn't loaded (CSP block, ad-blocker, SSR).
 */

type EventMap = {
  // Search and navigation
  address_searched: { resultsCount: number };
  address_selected: { kommunenummer: string };
  property_viewed: { kommunenummer: string; hasData: boolean };

  // Save flow
  save_clicked: { kommunenummer: string; authenticated: boolean };
  save_succeeded: { kommunenummer: string; authenticated: boolean; wasAnonymous: boolean };
  save_failed: { reason: string };

  // Auth
  login_started: Record<string, never>;
  login_completed: Record<string, never>;

  // Dashboard
  dashboard_viewed: { savedCount: number; alertsCount: number };

  // AI summary
  ai_summary_requested: { authenticated: boolean };
  ai_summary_quota_hit: { authenticated: boolean };

  // Engagement
  external_link_clicked: { destination: string };

  // Future — placeholders so prop shapes are reserved for monetization funnel
  score_gate_hit: { scoreName: string };
  lead_form_opened: { kommunenummer: string };
  lead_form_submitted: { kommunenummer: string; bank?: string };
  paywall_hit: { feature: string };
};

type EventName = keyof EventMap;

type PlausibleProps = Record<string, string | number | boolean>;

declare global {
  interface Window {
    plausible?: (eventName: string, options?: { props?: PlausibleProps }) => void;
  }
}

/**
 * Track a custom event. Silent no-op if Plausible isn't loaded.
 */
export function track<E extends EventName>(event: E, props?: EventMap[E]): void {
  if (typeof window === "undefined") return;
  if (typeof window.plausible !== "function") return;

  try {
    const cleanProps: PlausibleProps = {};
    if (props) {
      for (const [key, value] of Object.entries(props)) {
        if (value !== undefined && value !== null) {
          cleanProps[key] = value as string | number | boolean;
        }
      }
    }

    window.plausible(
      event,
      Object.keys(cleanProps).length > 0 ? { props: cleanProps } : undefined,
    );
  } catch {
    // Swallow — analytics should never break UX
  }
}
