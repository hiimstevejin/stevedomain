import Script from "next/script";

/**
 * Mount point for analytics / conversion tags.
 *
 * Conversion tracking runs through Google Tag Manager. Set NEXT_PUBLIC_GTM_ID
 * (the app web container, e.g. "GTM-PF54RVR2") and every `track()` call in
 * lib/analytics.ts starts pushing to GTM's dataLayer. GTM then maps the value
 * and forwards conversions server-side via Stape (data.stevedomain.com) to
 * Google Ads — see the os-ads-harness conversion-tracking design.
 *
 * Set NEXT_PUBLIC_GTM_ID only in production/preview so dev sessions stay quiet.
 * NEXT_PUBLIC_GA_ID (GA4) is optional and independent — if set, GA4 also loads.
 */
export function Analytics() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (!gtmId && !gaId) return null;

  return (
    <>
      {gtmId && (
        <>
          <Script id="gtm-init" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
            />
          </noscript>
        </>
      )}
      {gaId && (
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
      )}
    </>
  );
}
