import { z } from "zod";

export const reportQuery = z.object({
  source: z.enum(["ga4", "gsc", "clarity"]),
  group: z
    .enum(["pages", "sources", "queries", "countries", "devices", "date", "overview"])
    .default("pages"),
  days: z.coerce.number().int().min(1).max(90).default(28),
});
export type Report = {
  source: string;
  status: "ready" | "not_configured" | "error";
  message: string;
  columns: string[];
  rows: string[][];
  fetchedAt: string;
  period: string;
};
const gaResponse = z.object({
  dimensionHeaders: z.array(z.object({ name: z.string() })).default([]),
  metricHeaders: z.array(z.object({ name: z.string() })).default([]),
  rows: z
    .array(
      z.object({
        dimensionValues: z.array(z.object({ value: z.string().optional() })),
        metricValues: z.array(z.object({ value: z.string().optional() })),
      }),
    )
    .default([]),
});
const gscResponse = z.object({
  rows: z
    .array(
      z.object({
        keys: z.array(z.string()),
        clicks: z.number(),
        impressions: z.number(),
        ctr: z.number(),
        position: z.number(),
      }),
    )
    .default([]),
});
const clarityResponse = z.array(
  z.object({
    metricName: z.string(),
    information: z.array(z.record(z.string(), z.unknown())),
  }),
);
export function gaTable(raw: unknown) {
  const data = gaResponse.parse(raw);
  return {
    columns: [...data.dimensionHeaders, ...data.metricHeaders].map(
      (h) => h.name,
    ),
    rows: data.rows.map((r) =>
      [...r.dimensionValues, ...r.metricValues].map((c) => c.value ?? ""),
    ),
  };
}
export function gscTable(raw: unknown, dimension: string) {
  const data = gscResponse.parse(raw);
  return {
    columns: [dimension, "Clicks", "Impressions", "CTR", "Average position"],
    rows: data.rows.map((r) => [
      ...r.keys,
      String(r.clicks),
      String(r.impressions),
      (r.ctr * 100).toFixed(2) + "%",
      r.position.toFixed(2),
    ]),
  };
}
export function clarityTable(raw: unknown) {
  const data = clarityResponse.parse(raw);
  return {
    columns: ["Metric", "Page", "Device", "Detail", "Value"],
    rows: data.flatMap((m) =>
      m.information.flatMap((info) =>
        Object.entries(info)
          .filter(([k]) => k !== "URL" && k !== "Device")
          .map(([key, value]) => [
            m.metricName,
            String(info.URL ?? ""),
            String(info.Device ?? ""),
            key,
            typeof value === "object" ? JSON.stringify(value) : String(value),
          ]),
      ),
    ),
  };
}
async function request(url: string, token: string, body?: unknown) {
  const response = await fetch(url, {
    method: body ? "POST" : "GET",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store",
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw Error(String(response.status));
  return response.json();
}
// Cached per process to avoid spending Clarity's small daily quota on repeated page visits.
const cache = new Map<string, { expires: number; promise: Promise<Report> }>();
export async function analyticsReport(raw: unknown): Promise<Report> {
  const { readIntegrationSettings } = await import("./integration-settings");
  const settings = await readIntegrationSettings();
  const input = reportQuery.parse(raw),
    key =
      settings.version +
      ":" +
      (input.source === "clarity" ? "clarity" : JSON.stringify(input)),
    existing = cache.get(key);
  if (existing && existing.expires > Date.now()) return existing.promise;
  const promise = loadReport(input, settings.value);
  cache.set(key, {
    expires:
      Date.now() +
      (input.source === "clarity" ? 4 * 60 * 60 * 1000 : 5 * 60 * 1000),
    promise,
  });
  const result = await promise;
  if (result.status !== "ready") cache.delete(key);
  return result;
}
async function loadReport(
  input: z.infer<typeof reportQuery>,
  settings: import("@/schemas/integrations").IntegrationSettingsValue,
): Promise<Report> {
  const propertyId = settings.ga4PropertyId || process.env.GA4_PROPERTY_ID;
  const siteUrl = settings.gscSiteUrl || process.env.GSC_SITE_URL;
  const base = {
    source: input.source,
    columns: [],
    rows: [],
    fetchedAt: new Date().toISOString(),
    period:
      input.source === "clarity"
        ? "Previous 72 hours"
        : `Previous ${input.days} days, excluding today`,
  };
  const token =
    input.source === "clarity"
      ? process.env.CLARITY_API_TOKEN
      : process.env.GOOGLE_ACCESS_TOKEN;
  if (
    !token ||
    (input.source === "ga4" && !propertyId) ||
    (input.source === "gsc" && !siteUrl)
  )
    return {
      ...base,
      status: "not_configured",
      message: "Connect this account to load real report data.",
    };
  try {
    if (input.source === "clarity")
      return {
        ...base,
        ...clarityTable(
          await request(
            "https://www.clarity.ms/export-data/api/v1/project-live-insights?numOfDays=3&dimension1=URL&dimension2=Device",
            token,
          ),
        ),
        status: "ready",
        message:
          "Page and device behaviour. Cached for four hours; export has a daily request limit.",
      };
    if (input.source === "ga4") {
      const property = propertyId!;
      if (!/^\d+$/.test(property)) throw Error("Invalid property");
      const dimension = {
        pages: "pagePath",
        sources: "sessionSourceMedium",
        queries: "pagePath",
        countries: "country",
        devices: "deviceCategory",
        date: "date",
        overview: "date",
      }[input.group];
      const dimensions = input.group === "overview" ? [] : [{ name: dimension }];
      return {
        ...base,
        ...gaTable(
          await request(
            `https://analyticsdata.googleapis.com/v1beta/properties/${property}:runReport`,
            token,
            {
              dateRanges: [
                { startDate: `${input.days}daysAgo`, endDate: "yesterday" },
              ],
              ...(dimensions.length ? { dimensions } : {}),
              metrics: [
                { name: "activeUsers" },
                { name: "sessions" },
                { name: "screenPageViews" },
                { name: "keyEvents" },
              ],
              limit: 100,
              orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
            },
          ),
        ),
        status: "ready",
        message:
          "Top 100 rows. Search queries are available in Search Console.",
      };
    }
    const dimension = {
      pages: "page",
      sources: "page",
      queries: "query",
      countries: "country",
      devices: "device",
      date: "date",
      overview: "page",
    }[input.group];
    const date = (days: number) =>
      new Date(Date.now() - days * 86400000).toISOString().slice(0, 10);
    return {
      ...base,
      ...gscTable(
        await request(
          `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl!)}/searchAnalytics/query`,
          token,
          {
            startDate: date(input.days),
            endDate: date(1),
            dimensions: [dimension],
            rowLimit: 100,
            dataState: "final",
          },
        ),
        dimension,
      ),
      status: "ready",
      message:
        "Top search rows. Search Console may omit anonymised queries; recent data can be delayed.",
    };
  } catch {
    return {
      ...base,
      status: "error",
      message:
        "The provider could not return this report. Check account access, token expiry and quota.",
    };
  }
}
