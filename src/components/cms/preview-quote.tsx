"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
declare global {
  interface Window {
    CODEYEA_LEADS_ENABLED?: boolean;
  }
}
export function PreviewQuote() {
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
        href="/api/site-assets/quote-review/quote-panel.css"
      />
      {enabled && (
        <Script
          id="private-quote-panel"
          src="/api/site-assets/quote-review/quote-panel.js"
          onReady={() => setReady(true)}
        />
      )}{" "}
      {ready && <Script id="private-lead-forms" src="/site/lead-forms.js" />}
    </>
  );
}
