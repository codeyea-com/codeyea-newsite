import {
  conceptCaseStudy,
  type CaseLocale,
} from "@/content/concept-case-studies";
import { caseStudyHref } from "@/content/homepage-catalog";
import { breadcrumbSchema } from "@/content/breadcrumbs";
import { jsonLdText } from "@/content/structured-data";
import {
  renderConceptCaseIndex,
  renderConceptCaseStudy,
} from "./concept-case-study-render";

/** Homepage destinations for the explicitly labelled fictional project collection. */
export async function caseStudyResponse(parts: string[], locale: CaseLocale) {
  const item = parts.length === 1 ? conceptCaseStudy(parts[0]) : undefined;
  const headers = {
    "Content-Type": "text/html; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Robots-Tag": "noindex, nofollow",
  };
  if (parts.length > 1 || (parts.length === 1 && !item))
    return new Response("Not found", { status: 404, headers });
  const links = {
    index: (language: CaseLocale) => caseStudyHref(language),
    detail: (slug: string, language: CaseLocale) =>
      caseStudyHref(language, slug),
  };
  const html = item
    ? await renderConceptCaseStudy(item, locale, links)
    : await renderConceptCaseIndex(locale, links);
  const schema = {'@context':'https://schema.org', ...breadcrumbSchema(
    caseStudyHref(locale,item?.slug),
    item?.[locale].name ?? (locale==='ar'?'دراسات الحالة':'Case Studies'),
  )};
  return new Response(html.replace('</head>',
    `<script type="application/ld+json">${jsonLdText(schema)}</script></head>`), { headers });
}
