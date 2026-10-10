"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
declare global {
  interface Window {
    CODEYEA_LEADS_ENABLED?: boolean;
  }
}
export function PreviewQuote({publicAssets=false}:{publicAssets?:boolean}) {
  const [enabled, setEnabled] = useState(false),
    [ready, setReady] = useState(false);
  useEffect(() => {
    window.CODEYEA_LEADS_ENABLED = true;
    setEnabled(true);
  }, []);
  return (
    <>
      <link
        rel="stylesheet"
        href={publicAssets?"/site/quote-panel.css":"/api/site-assets/quote-review/quote-panel.css"}
      />
      {enabled && (
        <Script
          id="private-quote-panel"
          src={publicAssets?"/site/quote-panel.js":"/api/site-assets/quote-review/quote-panel.js"}
          onReady={() => {
            setReady(true);
            const pending = document.querySelector<HTMLAnchorElement>('.hp-header-quote[data-quote-pending]');
            if(pending){pending.removeAttribute('data-quote-pending');pending.click();}
          }}
        />
      )}{" "}
      {ready && <Script id="private-lead-forms" src="/site/lead-forms.js" />}
    </>
  );
}
