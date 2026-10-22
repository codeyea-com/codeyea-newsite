import { conceptCaseStudies, type CaseLocale } from "./concept-case-studies";

export const iraqHomeExpoSlug = "iraq-home-expo";

/** Shared identities, covers and ordering for the directory and Homepage. */
export function caseStudyCards(locale: CaseLocale) {
  const ar = locale === "ar";
  return [
    {
      slug: iraqHomeExpoSlug,
      name: "Iraq Home Expo",
      title: ar ? "هوية المعرض وبوابته الرقمية" : "Exhibition identity & digital gateway",
      image: "/site/generated/case-studies/iraq-home-expo/hero-wide-960.webp",
      srcSet: [640,960,1440].map(w=>`/site/generated/case-studies/iraq-home-expo/hero-wide-${w}.webp ${w}w`).join(', '),
      category: "branding web",
      concept: false,
    },
    ...conceptCaseStudies.map((item) => ({
      slug: item.slug,
      name: item[locale].name,
      title: item[locale].title,
      image: item.images[0].src,
      category: [
        /brand/i.test(item.en.services) ? "branding" : "",
        /website|web app|portal|mobile|SaaS/i.test(item.en.services) ? "web" : "",
        /automat/i.test(item.en.services) ? "automation" : "",
      ].filter(Boolean).join(" "),
      concept: true,
    })),
  ];
}
