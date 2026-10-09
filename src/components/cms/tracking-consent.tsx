"use client";

import Script from "next/script";
import { useEffect, useState } from "react";
import styles from "./tracking-consent.module.css";

const consentKey = "codeyea-analytics-consent-v1";
const consentLifetime = 180 * 24 * 60 * 60 * 1000;

type ConsentRecord = {
  decision: "allow" | "deny";
  savedAt: number;
  scope: string;
};
type Props = {
  enabled: boolean;
  ga4MeasurementId: string;
  gtmContainerId: string;
  clarityProjectId: string;
  googleDelivery: "gtm" | "direct";
};

function readConsent(scope: string): ConsentRecord | null {
  try {
    const raw =
      localStorage.getItem(consentKey) ?? sessionStorage.getItem(consentKey);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (
      !value ||
      typeof value !== "object" ||
      !("decision" in value) ||
      !("savedAt" in value) ||
      !("scope" in value) ||
      (value.decision !== "allow" && value.decision !== "deny") ||
      typeof value.savedAt !== "number" ||
      value.scope !== scope ||
      Date.now() - value.savedAt > consentLifetime
    ) {
      localStorage.removeItem(consentKey);
      sessionStorage.removeItem(consentKey);
      return null;
    }
    return value as ConsentRecord;
  } catch {
    return null;
  }
}

export function TrackingConsent({
  enabled,
  ga4MeasurementId,
  gtmContainerId,
  clarityProjectId,
  googleDelivery,
}: Props) {
  const [consent, setConsent] = useState<ConsentRecord | null>(null);
  const [ready, setReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const useGtm = googleDelivery === "gtm" && Boolean(gtmContainerId);
  const useGa4 =
    Boolean(ga4MeasurementId) &&
    (googleDelivery === "direct" || !useGtm);
  const useClarity = Boolean(clarityProjectId);
  const providers = [
    useGtm && "Google Tag Manager",
    useGa4 && "Google Analytics 4",
    useClarity && "Microsoft Clarity",
  ].filter(Boolean);
  const scope = [
    useGtm ? `gtm:${gtmContainerId}` : "",
    useGa4 ? `ga4:${ga4MeasurementId}` : "",
    useClarity ? `clarity:${clarityProjectId}` : "",
  ]
    .filter(Boolean)
    .sort()
    .join("|");
  useEffect(() => {
    setConsent(readConsent(scope));
    setReady(true);
  }, [scope]);

  const revokeLoadedTrackers = () => {
    const trackingWindow = window as Window & {
      gtag?: (...args: unknown[]) => void;
      clarity?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    trackingWindow.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    trackingWindow.clarity?.("consentv2", {
      analytics_Storage: "denied",
      ad_Storage: "denied",
    });
    trackingWindow.dataLayer?.push({
      event: "codeyea_consent_revoked",
      analytics_storage: "denied",
      ad_storage: "denied",
    });
    trackingWindow.dataLayer?.push([
      "consent",
      "update",
      {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ]);
    const analyticsCookies = /^_(ga|gid|gat|clck|clsk)/;
    for (const cookie of document.cookie.split(";")) {
      const name = cookie.split("=")[0]?.trim();
      if (!name || !analyticsCookies.test(name)) continue;
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
      document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
    }
  };

  const saveConsent = (decision: ConsentRecord["decision"]) => {
    const next = { decision, savedAt: Date.now(), scope } satisfies ConsentRecord;
    try {
      localStorage.setItem(consentKey, JSON.stringify(next));
    } catch {
      try {
        sessionStorage.setItem(consentKey, JSON.stringify(next));
      } catch {
        // Keep the current-page choice if browser storage is unavailable.
      }
    }
    const revoking = consent?.scope === scope && consent.decision === "allow";
    setConsent(next);
    setShowSettings(false);
    if (decision === "deny" && revoking) {
      revokeLoadedTrackers();
      window.location.reload();
    }
  };

  const configured = providers.length > 0;
  const savedConsent = consent?.scope === scope ? consent : null;
  const active = ready && enabled && savedConsent?.decision === "allow";

  return (
    <>
      {ready && enabled && configured && (!savedConsent || showSettings) && (
        <aside
          className={styles.panel}
          aria-labelledby="tracking-consent-title"
          aria-describedby="tracking-consent-copy"
          role="dialog"
          aria-modal="false"
        >
          <div className={styles.eyebrow}>Privacy choices</div>
          <h2 id="tracking-consent-title">Your privacy matters</h2>
          <p id="tracking-consent-copy">
            Optional analytics from {providers.join(", ")} help us understand
            visits, pages and devices. If Microsoft Clarity is enabled, it also
            records interaction patterns such as clicks, scrolling and pointer
            movement for session playback. Google Tag Manager may load additional
            tags configured by the site owner. These tools stay off until you
            allow them; rejecting them will not block the site. You can change
            this choice at any time.
          </p>
          <div className={styles.actions}>
            <button type="button" onClick={() => saveConsent("allow")}>
              Allow analytics
            </button>
            <button
              className={styles.secondary}
              type="button"
              onClick={() => saveConsent("deny")}
            >
              Reject optional tracking
            </button>
          </div>
        </aside>
      )}
      {ready && enabled && savedConsent && !showSettings && (
        <button
          className={styles.preferences}
          type="button"
          onClick={() => setShowSettings(true)}
          aria-label="Open privacy choices"
        >
          Privacy choices
        </button>
      )}
      {active && useGtm && (
        <Script
          id="codeyea-gtm"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});(function(d,s,l,i){var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(document,'script','dataLayer','${gtmContainerId}');`,
          }}
        />
      )}
      {active && useGa4 && (
        <Script
          id="codeyea-ga4"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});gtag('js',new Date());gtag('config','${ga4MeasurementId}');(function(d,s){var j=d.createElement(s);j.async=true;j.src='https://www.googletagmanager.com/gtag/js?id=${ga4MeasurementId}';d.head.appendChild(j);})(document,'script');`,
          }}
        />
      )}
      {active && Boolean(clarityProjectId) && (
        <Script
          id="codeyea-clarity"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};c[a]("consentv2",{analytics_Storage:"granted",ad_Storage:"denied"});t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityProjectId}");`,
          }}
        />
      )}
    </>
  );
}
