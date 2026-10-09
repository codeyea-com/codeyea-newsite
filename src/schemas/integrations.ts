import { z } from "zod";
function identifier(pattern: RegExp, extract: RegExp, label: string) {
  return z
    .string()
    .trim()
    .max(8000)
    .transform((value, ctx) => {
      if (!value) return "";
      if (pattern.test(value)) return value;
      const match = value.match(extract);
      if (match) return match[1];
      ctx.addIssue({
        code: "custom",
        message: `Enter a valid ${label} ID or installation code.`,
      });
      return z.NEVER;
    });
}
export const integrationSettingsSchema = z.object({
  ga4MeasurementId: identifier(/^G-[A-Z0-9]+$/, /\b(G-[A-Z0-9]+)\b/, "GA4"),
  ga4PropertyId: z
    .string()
    .trim()
    .max(30)
    .refine((v) => !v || /^\d+$/.test(v), "Use the numeric GA4 property ID"),
  gtmContainerId: identifier(/^GTM-[A-Z0-9]+$/, /\b(GTM-[A-Z0-9]+)\b/, "GTM"),
  clarityProjectId: identifier(
    /^[a-z0-9]{5,30}$/,
    /(?:clarity\.ms\/tag\/|["']script["']\s*,\s*["'])([a-z0-9]{5,30})/i,
    "Clarity",
  ),
  gscSiteUrl: z
    .string()
    .trim()
    .max(300)
    .refine((v) => {
      if (!v) return true;
      if (/^sc-domain:[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)) return true;
      try {
        const u = new URL(v);
        return (
          u.protocol === "https:" &&
          !u.username &&
          !u.password &&
          !u.hash &&
          !u.search
        );
      } catch {
        return false;
      }
    }, "Use an HTTPS property URL or sc-domain:example.com"),
  gscVerification: identifier(
    /^[a-zA-Z0-9_=-]+$/,
    /name=["']google-site-verification["'][^>]*content=["']([a-zA-Z0-9_=-]+)["']/,
    "Search Console verification",
  ),
  googleDelivery: z.enum(["gtm", "direct"]).default("gtm"),
  trackingEnabled: z.boolean().default(false),
});
export type IntegrationSettingsValue = z.infer<
  typeof integrationSettingsSchema
>;
export const emptyIntegrationSettings: IntegrationSettingsValue = {
  ga4MeasurementId: "",
  ga4PropertyId: "",
  gtmContainerId: "",
  clarityProjectId: "",
  gscSiteUrl: "",
  gscVerification: "",
  googleDelivery: "gtm",
  trackingEnabled: false,
};
