/**
 * Analytics abstraction.
 *
 * `track()` pushes each event onto the GTM dataLayer (and forwards to gtag if a
 * GA4 tag happens to be loaded). With no NEXT_PUBLIC_GTM_ID set it is a quiet
 * no-op — the app ships with no tracking dependency and no consent banner.
 *
 * Conversion model (see components/Analytics.tsx + the os-ads-harness design):
 *   sign_up  → PRIMARY conversion (new user's first sign-in; fired once ever)
 *   pomodoro_round_complete → activation signal (optional secondary)
 * The gclid rides a first-party cookie (_gcl_aw, scoped .stevedomain.com) set on
 * the marketing site; GTM's Conversion Linker reads it here — no app code needed
 * for attribution since the conversion fires in the same session as the click.
 */

export type AnalyticsEvent =
  | "sign_up"
  | "sign_in"
  | "sign_out"
  | "timer_start"
  | "timer_pause"
  | "timer_reset"
  | "pomodoro_round_complete"
  | "todo_added"
  | "todo_completed"
  | "bookmark_added"
  | "track_added";

type Props = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export function track(event: AnalyticsEvent, props: Props = {}): void {
  if (typeof window === "undefined") return;

  // Push to the GTM dataLayer — GTM maps the value and routes the conversion
  // server-side via Stape. `event` is the key GTM triggers fire on.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...props });

  // Also forward to a GA4 gtag if one is loaded (optional, independent of GTM).
  if (typeof window.gtag === "function") {
    window.gtag("event", event, props);
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, props);
  }
}
