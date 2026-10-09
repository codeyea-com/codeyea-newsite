import { industryNames, type IndustrySlug } from "./industry-registry";

const industryMedia: Record<IndustrySlug, string> = {
  roofing: "roofing",
  healthcare: "healthcare",
  construction: "construction",
  "e-commerce": "ecommerce",
  "small-business": "small-business",
  "event-coordinators": "office",
  legal: "legal",
  "online-magazine": "project-web",
  "oil-and-gas": "oil-gas",
  "real-estate": "real-estate",
  "fashion-and-lifestyle": "ecommerce",
  "beauty-skincare-med-spa": "healthcare",
  "restaurants-cafes-bakeries": "commerce",
  "solar-energy": "construction",
};

export function industryAssetId(slug: IndustrySlug) {
  return industryMedia[slug];
}

export function industrySlugForName(name: string): IndustrySlug | undefined {
  return (Object.keys(industryNames) as IndustrySlug[]).find(
    (slug) => industryNames[slug].toLowerCase() === name.trim().toLowerCase(),
  );
}

export function attachLocalIndustryAssets<T>(value: T, slug: IndustrySlug): T {
  const mediaId = industryAssetId(slug);
  const visit = (entry: unknown): unknown => {
    if (Array.isArray(entry)) return entry.map(visit);
    if (!entry || typeof entry !== "object") return entry;
    const record = entry as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(record).map(([key, child]) => [
        key,
        key === "mediaId" && typeof child === "string" && child.startsWith("media_")
          ? mediaId
          : visit(child),
      ]),
    );
  };
  return visit(value) as T;
}
