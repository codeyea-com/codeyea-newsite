"use client";
import { useEffect, useState } from "react";
import {
  emptyIntegrationSettings,
  type IntegrationSettingsValue,
} from "@/schemas/integrations";
export function IntegrationSettings({
  onDirtyChange,
}: {
  onDirtyChange: (value: boolean) => void;
}) {
  const [value, setValue] = useState(emptyIntegrationSettings),
    [version, setVersion] = useState(0),
    [loaded, setLoaded] = useState(false),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [dirty, setDirty] = useState(false);
  useEffect(() => {
    onDirtyChange(dirty);
  }, [dirty, onDirtyChange]);
  useEffect(() => {
    let active = true;
    fetch("/api/integration-settings", { cache: "no-store" })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw Error(d.error);
        if (active) {
          const loadedValue = d.value.ga4MeasurementId
            ? d.value
            : { ...d.value, ga4MeasurementId: "G-4KNM6TYC6D" };
          setValue(loadedValue);
          setVersion(d.version);
          setDirty(!d.value.ga4MeasurementId);
          setLoaded(true);
        }
      })
      .catch((e) => {
        if (active) setMessage(String(e));
      });
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  const edit = (
    key: keyof IntegrationSettingsValue,
    input: string | boolean,
  ) => {
    setValue((v) => ({ ...v, [key]: input }));
    setDirty(true);
  };
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await fetch("/api/integration-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value, version }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      setValue(d.value);
      setVersion(d.version);
      setDirty(false);
      setMessage("Integration settings saved.");
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="site-integration-settings">
      <h2>Analytics and search integrations</h2>
      <p>
        Add each service ID or paste its installation code. The CMS extracts
        and saves only the recognised ID; it does not store or run pasted JavaScript.
      </p>
      <fieldset disabled={!loaded || busy}>
        <label className="site-field">
          Google Analytics 4 (GA4) — measurement ID or install code
          <textarea
            value={value.ga4MeasurementId}
            placeholder="G-XXXXXXXXXX"
            onChange={(e) => edit("ga4MeasurementId", e.target.value)}
          />
          <small>Paste your gtag.js snippet or enter the G- measurement ID.</small>
        </label>
        <label className="site-field">
          GA4 property ID — used by CMS reports
          <input
            value={value.ga4PropertyId}
            placeholder="Numeric property ID"
            onChange={(e) => edit("ga4PropertyId", e.target.value)}
          />
        </label>
        <label className="site-field">
          Google Tag Manager (GTM) — container ID or install code
          <textarea
            value={value.gtmContainerId}
            placeholder="GTM-XXXXXXX"
            onChange={(e) => edit("gtmContainerId", e.target.value)}
          />
          <small>Paste the GTM install snippet or enter the GTM- container ID.</small>
        </label>
        <label className="site-field">
          Google tag delivery preference
          <select
            value={value.googleDelivery}
            onChange={(e) => edit("googleDelivery", e.target.value)}
          >
            <option value="gtm">Use GTM to manage Google tags</option>
            <option value="direct">Use the GA4 tag directly</option>
          </select>
          <small>Choose one delivery path to avoid counting a visit twice.</small>
          {value.googleDelivery === "gtm" && value.gtmContainerId && (
            <small>Configure the GA4 tag inside GTM; the site loads only the GTM container.</small>
          )}
          {value.googleDelivery === "gtm" && !value.gtmContainerId && (
            <small>Without a GTM ID, the saved GA4 tag loads directly after consent.</small>
          )}
        </label>
        <label className="site-field">
          Search Console property
          <input
            value={value.gscSiteUrl}
            placeholder="sc-domain:codeyea.com or https://codeyea.com/"
            onChange={(e) => edit("gscSiteUrl", e.target.value)}
          />
        </label>
        <label className="site-field">
          Search Console verification token or meta tag
          <textarea
            value={value.gscVerification}
            onChange={(e) => edit("gscVerification", e.target.value)}
          />
        </label>
        <label className="site-field">
          Microsoft Clarity — project ID or install code
          <textarea
            value={value.clarityProjectId}
            onChange={(e) => edit("clarityProjectId", e.target.value)}
          />
          <small>Paste the Clarity install snippet or enter its project ID.</small>
        </label>
        <label>
          <input
            type="checkbox"
            checked={value.trackingEnabled}
            onChange={(e) => edit("trackingEnabled", e.target.checked)}
          />{" "}
          Enable configured tracking on public pages
        </label>
        <p>
          Visitors must allow analytics before any configured Google or Clarity
          script loads. Preview and CMS pages are excluded. Search Console
          verification and private analytics report access are separate. Set
          consent checks for any additional tags configured inside GTM. The
          current site security policy still blocks the external tracking hosts.
        </p>
        <button disabled={!dirty || busy}>Save integration settings</button>
      </fieldset>
      <p role="status">{message}</p>
    </form>
  );
}
