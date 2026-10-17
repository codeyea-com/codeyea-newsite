import { arabicNavigation } from "./arabic-navigation";
import { arabicIndustryProfiles } from "./arabic-industry-profiles";
import type { CaseLocale } from "./concept-case-studies";
import { caseStudyCards } from "./case-study-catalog";
import { generalArtwork } from "./generated-general-artwork";
import { defaultIndustries } from "./industries-defaults";
import {
  industryNames,
  industrySlugs,
  type IndustrySlug,
} from "./industry-registry";
import { serviceBySlug, type ServiceSlug } from "./service-catalog";
import { enabledItems, type EditorObject } from "../schemas/homepage-editor";
import { mediaProps, str } from "./homepage-render";

// Keep the original homepage slots; replace retired identities with the current catalog.
const serviceOrder: readonly ServiceSlug[] = [
  "web-mobile-apps",
  "ecommerce",
  "ai-automation",
  "website-design",
  "seo-geo",
  "brand-design",
  "technical-support",
  "digital-marketing",
];
const originalIndustryOrder: readonly IndustrySlug[] = [
  "healthcare",
  "construction",
  "real-estate",
  "e-commerce",
  "legal",
  "oil-and-gas",
  "roofing",
  "small-business",
];
const industryOrder = [
  ...originalIndustryOrder,
  ...industrySlugs.filter((slug) => !originalIndustryOrder.includes(slug)),
];
const directory = defaultIndustries("en", "global").items;

export const caseStudyHref = (locale: CaseLocale, slug?: string) =>
  `${locale === "ar" ? "/ar" : ""}/case-studies/${slug ? `${slug}/` : ""}`;

/** Render canonical identities without rewriting saved CMS drafts or unrelated sections. */
export function homepageCatalog(locale: CaseLocale, projects: EditorObject) {
  const ar = locale === "ar";
  const prefix = ar ? "/ar" : "";
  const services = serviceOrder.map((slug) => {
    const service = serviceBySlug(slug);
    return {
      id: service.id,
      title: ar ? service.ar : service.title,
      body: ar ? service.bodyAr : service.body,
      icon: service.label,
      ctaLabel: ar ? "اعرف المزيد" : "Learn More",
      ctaHref: `${prefix}/services/${slug}/`,
    };
  });
  const industries = industryOrder.map((slug) => {
    const title = ar
      ? arabicNavigation[industryNames[slug]]
      : industryNames[slug];
    const item = directory.find((entry) => entry.id === `industry-${slug}`)!;
    const artwork = generalArtwork(`industries/industry-${slug}`);
    return {
      id: `industry-${slug}`,
      title,
      body: (ar ? arabicIndustryProfiles[slug].intro : item.body).split(
        /(?<=\.)\s/,
      )[0],
      image: artwork?.src ?? mediaProps(item.media).src,
      alt: artwork?.alt[locale] ?? title,
      focal: "50% 50%",
      href: `${prefix}/industries/${slug}/`,
    };
  });
  const categories: Record<string, string> = ar
    ? {
        "iraq-home-expo": "التصميم,التطوير",
        "velora-skin-clinic": "التصميم",
        "madar-solar": "التطوير",
        "tradebridge-expo": "التطوير",
        "atlas-supply": "الأتمتة",
        "safa-clinics": "التطوير,الأتمتة",
        "mada-developments": "التصميم,التطوير",
      }
    : {
        "iraq-home-expo": "Design,Development",
        "velora-skin-clinic": "Design",
        "madar-solar": "Development",
        "tradebridge-expo": "Development",
        "atlas-supply": "Automation",
        "safa-clinics": "Development,Automation",
        "mada-developments": "Design,Development",
      };
  const cases = caseStudyCards(locale).map((item) => ({
    id: item.slug,
    title: item.name,
    body: item.title,
    category: categories[item.slug],
    image: item.image,
    alt: `${item.name}: ${item.title}`,
    focal: "50% 50%",
    href: caseStudyHref(locale, item.slug),
  }));
  // Existing verified projects keep their explicit approval requirement. Concepts never set it.
  const approved = enabledItems(projects.items)
    .filter((item) => item.approved === true)
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .map((item) => ({
      id: str(item.id),
      title: str(item.title),
      body: str(item.body),
      category: str(item.categories),
      image: mediaProps(item.media).src,
      srcSet: mediaProps(item.media).srcSet,
      alt: mediaProps(item.media).alt,
      focal: mediaProps(item.media).style.objectPosition,
      href: str(item.href),
    }));
  const projectIntro: EditorObject = {
    ...projects,
    ctaHref: caseStudyHref(locale),
    disclosure: ar
      ? "مشروع عراق هوم إكسبو، إلى جانب دراسات حالة افتراضية بمراحل مصوّرة ونتائج محاكاة."
      : "Iraq Home Expo, alongside concept case studies with illustrated stages and simulated results.",
  };
  return {
    services,
    industries,
    projects: [
      ...cases,
      ...approved.filter((item) => !cases.some((c) => c.href === item.href)),
    ],
    projectIntro,
  };
}
