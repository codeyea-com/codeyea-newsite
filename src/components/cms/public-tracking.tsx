import { readIntegrationSettings } from "@/server/integration-settings";
import { TrackingConsent } from "./tracking-consent";

/** Render only from public page routes; previews and CMS routes do not include this. */
export async function PublicTracking() {
  const { value } = await readIntegrationSettings();
  return (
    <TrackingConsent
      enabled={value.trackingEnabled}
      ga4MeasurementId={value.ga4MeasurementId}
      gtmContainerId={value.gtmContainerId}
      clarityProjectId={value.clarityProjectId}
      googleDelivery={value.googleDelivery}
    />
  );
}
