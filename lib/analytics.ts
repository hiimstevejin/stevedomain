/**
 * Analytics abstraction.
 *
 * Today `track()` is effectively a no-op (it logs in dev and forwards to a
 * Google tag only if one is present). The app therefore ships with no tracking
 * dependency and no consent banner required.
 *
 * Conversion-tracking expansion later is a drop-in: set NEXT_PUBLIC_GA_ID (see
 * components/Analytics.tsx) — or paste a Google Tag Manager / Google Ads tag
 * there — and every call site below immediately starts emitting events. No
 * widget code changes needed.
 */

export type AnalyticsEvent =
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

  // Forward to a Google tag (gtag) once one is loaded.
  if (typeof window.gtag === "function") {
    window.gtag("event", event, props);
  }

  if (process.env.NODE_ENV === "development") {
    console.debug(`[analytics] ${event}`, props);
  }
}
