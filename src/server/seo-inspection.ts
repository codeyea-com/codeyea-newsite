import { z } from "zod";
import { readIntegrationSettings } from "./integration-settings";
import {
  pagePath,
  documentPath,
  existingPageIds,
  documentSlugs,
} from "@/content/site-routes";
const paths = new Set(
  [
    ...existingPageIds.map(pagePath),
    ...documentSlugs.flatMap((slug) => [
      documentPath(slug, "en"),
      documentPath(slug, "ar"),
    ]),
  ].filter(Boolean),
);
export const inspectionQuery = z.object({
  path: z
    .string()
    .refine((path) => paths.has(path), "Choose a registered page"),
  mode: z.enum(["index", "speed"]).default("index"),
});
export type Inspection = {
  status: "ready" | "not_configured" | "error";
  message: string;
  fetchedAt: string;
  index?: {
    verdict: string;
    coverage: string;
    robots: string;
    indexing: string;
    fetch: string;
    mobile: string;
    rich: string;
    lastCrawl: string;
  };
  speed?: {
    desktop: number | null;
    mobile: number | null;
    desktopLcp: string;
    mobileLcp: string;
  };
};
const cache = new Map<
  string,
  { expires: number; promise: Promise<Inspection> }
>();
export async function inspectSeo(raw: unknown): Promise<Inspection> {
  const input = inspectionQuery.parse(raw),
    settings = await readIntegrationSettings(),
    key = JSON.stringify(input) + settings.version;
  const cached = cache.get(key);
  if (cached && cached.expires > Date.now()) return cached.promise;
  const promise = load();
  cache.set(key, { expires: Date.now() + 900000, promise });
  const result = await promise;
  if (result.status !== "ready") cache.delete(key);
  return result;
  async function load(): Promise<Inspection> {
    const base = { fetchedAt: new Date().toISOString() };
    try {
      if (input.mode === "index") {
        const token = process.env.GOOGLE_ACCESS_TOKEN,
          siteUrl = settings.value.gscSiteUrl || process.env.GSC_SITE_URL;
        if (!token || !siteUrl)
          return {
            ...base,
            status: "not_configured",
            message:
              "Connect a verified Search Console property and server reporting token to inspect Google index status.",
          };
        const response = await fetch(
          "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
          {
            method: "POST",
            headers: {
              Authorization: "Bearer " + token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              inspectionUrl: "https://codeyea.com" + input.path,
              siteUrl,
              languageCode: "en-US",
            }),
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
          },
        );
        if (!response.ok) throw Error("Provider unavailable");
        const data = await response.json(),
          result = data.inspectionResult ?? {},
          index = result.indexStatusResult ?? {};
        const text = (v: unknown) =>
          typeof v === "string" ? v : "Not returned";
        return {
          ...base,
          status: "ready",
          message: "Google indexed version; this is not a live URL test.",
          index: {
            verdict: text(index.verdict),
            coverage: text(index.coverageState),
            robots: text(index.robotsTxtState),
            indexing: text(index.indexingState),
            fetch: text(index.pageFetchState),
            mobile: text(result.mobileUsabilityResult?.verdict),
            rich: text(result.richResultsResult?.verdict),
            lastCrawl: text(index.lastCrawlTime),
          },
        };
      }
      const results = await Promise.all(
        ["desktop", "mobile"].map(async (strategy) => {
          const url = new URL(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
          );
          url.searchParams.set("url", "https://codeyea.com" + input.path);
          url.searchParams.set("strategy", strategy);
          url.searchParams.set("category", "performance");
          if (process.env.PAGESPEED_API_KEY)
            url.searchParams.set("key", process.env.PAGESPEED_API_KEY);
          const response = await fetch(url, {
            cache: "no-store",
            signal: AbortSignal.timeout(25000),
          });
          if (!response.ok) throw Error("PageSpeed unavailable");
          const data = await response.json();
          if (data.lighthouseResult?.runtimeError)
            throw Error("Page could not be measured");
          const score = data.lighthouseResult?.categories?.performance?.score;
          return {
            score: typeof score === "number" ? Math.round(score * 100) : null,
            lcp:
              data.lighthouseResult?.audits?.["largest-contentful-paint"]
                ?.displayValue ?? "Not returned",
          };
        }),
      );
      return {
        ...base,
        status: "ready",
        message:
          "PageSpeed Lighthouse lab results for the current public site, not the private draft.",
        speed: {
          desktop: results[0].score,
          mobile: results[1].score,
          desktopLcp: results[0].lcp,
          mobileLcp: results[1].lcp,
        },
      };
    } catch {
      return {
        ...base,
        status: "error",
        message:
          "Google could not return this measurement. Check account access, quota and public URL availability.",
      };
    }
  }
}
