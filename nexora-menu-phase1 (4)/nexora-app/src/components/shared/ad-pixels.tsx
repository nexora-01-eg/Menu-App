import Script from "next/script";

/**
 * Loads Google Ads/Analytics (gtag.js) and/or the Meta Pixel, but
 * only if their IDs are present in the environment — so this ships
 * safe-by-default (no third-party tracking scripts, no cookies) until
 * you actually set NEXT_PUBLIC_GA_ID / NEXT_PUBLIC_META_PIXEL_ID for
 * the ad campaign. Because these are tracking/advertising cookies —
 * not strictly-necessary ones — turning them on for EU/UK traffic
 * requires a cookie-consent banner gating this component, which is
 * NOT included yet (see the launch checklist).
 */
export function AdPixels() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
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

      {metaPixelId && (
        <Script id="meta-pixel-init" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixelId}');
            fbq('track', 'PageView');
          `}
        </Script>
      )}
    </>
  );
}
