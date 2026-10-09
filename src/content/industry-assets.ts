import { industryNames, type IndustrySlug } from "./industry-registry";
import { approvedMedia } from "./approved-media";
import type { IndustryDetailContent } from "../schemas/industry-detail";

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
        key === "mediaId" && typeof child === "string" && child.startsWith("media_") && !approvedMedia[child]
          ? mediaId
          : visit(child),
      ]),
    );
  };
  return visit(value) as T;
}

/** Replace media still marked temporary with the reviewed fallback for this industry. */
export function applyTemporaryIndustryFallbackMedia(
  saved: IndustryDetailContent,
  fallback: IndustryDetailContent,
): IndustryDetailContent {
  const fallbackSections = new Map(fallback.sections.map((section) => [section.id, section]));
  return {
    ...saved,
    hero: saved.hero.temporaryMedia
      ? { ...saved.hero, media: fallback.hero.media }
      : saved.hero,
    sections: saved.sections.map((section) => {
      if (!section.temporaryMedia) return section;
      const source = fallbackSections.get(section.id);
      if (!source) return section;
      const sourceItems = new Map(source.items.map((item) => [item.id, item]));
      return {
        ...section,
        ...(source.media ? { media: source.media } : {}),
        ...(source.pillarMedia ? { pillarMedia: source.pillarMedia } : {}),
        items: section.items.map((item) => {
          const sourceItem = sourceItems.get(item.id);
          return sourceItem?.media ? { ...item, media: sourceItem.media } : item;
        }),
      };
    }),
  };
}
