import Script from "next/script";

/**
 * Mount point for analytics / conversion tags.
 *
 * Renders nothing until a NEXT_PUBLIC_GA_ID (GA4 measurement ID, e.g.
 * "G-XXXXXXX") env var is set — at which point GA4 loads and the `track()`
 * calls in lib/analytics.ts start flowing to it. To use Google Tag Manager or
 * a Google Ads conversion tag instead, swap the scripts below.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gaId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}');
        `}
      </Script>
    </>
  );
}
