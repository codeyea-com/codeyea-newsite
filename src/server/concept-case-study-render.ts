import {
  conceptCaseStudies,
  conceptDisclosure,
  type ConceptCaseStudy,
  type CaseLocale,
} from "../content/concept-case-studies";
import {
  templateContent,
  templatePageDraft,
  renderDocument,
} from "./site-documents";
import { arabicText, localizeArabic } from "../content/arabic-localization";
import { resolveHomepage } from "../content/homepage-defaults";

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
const words = {
  en: {
    label: "Concept case study",
    requirements: "Client requirements",
    scope: "Project scope",
    timeline: "Scenario timeline",
    stage: "Stage",
    work: "Our work",
    results: "Simulated results",
    resultTitle: "The change, measured.",
    before: "Before",
    after: "After",
    all: "All case studies",
    next: "Next case study",
    cta: "Tell us about your project",
    ready: "READY FOR YOUR NEXT CHAPTER?",
    closing: "Let’s turn your requirements into a clear digital experience.",
    index: "Six projects. Six journeys.",
    indexIntro:
      "Explore client requirements, five illustrated stages and simulated outcomes for each concept.",
  },
  ar: {
    label: "دراسة حالة افتراضية",
    requirements: "متطلبات العميل",
    scope: "نطاق العمل",
    timeline: "الإطار الزمني للسيناريو",
    stage: "المرحلة",
    work: "خطوات التنفيذ",
    results: "نتائج المحاكاة",
    resultTitle: "الفرق، بلغة الأرقام.",
    before: "قبل",
    after: "بعد",
    all: "جميع دراسات الحالة",
    next: "دراسة الحالة التالية",
    cta: "أطلب التسعيرة المجانية الآن",
    ready: "جاهز للخطوة التالية؟",
    closing: "لنحوّل متطلبات مشروعك إلى تجربة رقمية واضحة.",
    index: "ستة مشاريع. ست رحلات.",
    indexIntro: "متطلبات العميل، خمس مراحل مصوّرة ونتائج محاكاة لكل فكرة.",
  },
};
export type CaseRenderLinks = {
  index: (locale: CaseLocale) => string;
  detail: (slug: string, locale: CaseLocale) => string;
};
export const privateCaseLinks: CaseRenderLinks = {
  index: (locale) => `/preview/case-studies?locale=${locale}`,
  detail: (slug, locale) => `/preview/case-studies/${slug}?locale=${locale}`,
};
function figure(item: ConceptCaseStudy, i: number, locale: CaseLocale) {
  const img = item.images[i],
    caption = i ? item[locale].stages[i - 1][0] : item[locale].name;
  return `<figure><img src="${escape(img.src)}" width="${img.width}" height="${img.height}" alt="${escape(caption)}" loading="${i ? "lazy" : "eager"}" decoding="async"${i ? "" : ' fetchpriority="high"'}><figcaption>${escape(caption)}</figcaption></figure>`;
}
function cta(locale: CaseLocale) {
  const t = words[locale];
  return `<section class="b-contact"><div><span>${t.ready}</span><h2>${t.closing}</h2></div><a class="b-btn" data-quote-open href="${locale === "ar" ? "/ar" : ""}/contact/#quote-form">${t.cta}<span aria-hidden="true">↗</span></a></section>`;
}

/** Reuse the approved Website Design document shell, CSS and exact commerce entrance script. */
export async function caseStudyShell(
  main: string,
  locale: CaseLocale,
  title: string,
) {
  const source = await templateContent("website-design");
  const draft = templatePageDraft("website-design", source);
  const content = structuredClone(draft.content);
  if (locale === "ar")
    content.fields = content.fields.map((f) => {
      try {
        return { ...f, value: arabicText(f.value) };
      } catch {
        return f;
      }
    });
  const shared =
    locale === "ar"
      ? localizeArabic(resolveHomepage(undefined), false)
      : undefined;
  if (shared) {
    shared.footer.heading = "لنبدأ";
    shared.footer.supportHeading = "لديك مشروع في بالك؟";
    shared.footer.body = "لنبدأ الحديث عن مشروعك.";
    shared.footer.words = (
      Array.isArray(shared.footer.words) ? shared.footer.words : []
    ).map((word, i) => ({
      ...word,
      title: ["نبتكر", "نطوّر", "ننمو"][i] ?? word.title,
    }));
    shared.footer.groups = (
      Array.isArray(shared.footer.groups) ? shared.footer.groups : []
    ).map((group) => ({
      ...group,
      title: group.title === "Explore" ? "اكتشف" : group.title,
    }));
  }
  let html = await renderDocument("website-design", content, locale, title, {
    public: true,
    shared,
  });
  html = html.replace(
    /<main\b[^>]*>[\s\S]*?<\/main>/,
    `<main id="main" class="b case-study">${main}</main>`,
  );
  // Remove only scripts tied to Website Design sections absent from the case-study page.
  html = html.replace(
    /<script\b([^>]*)>([\s\S]*?)<\/script>/g,
    (all, attrs, body) => {
      if (/data-integrated-hero|application\/ld\+json/.test(attrs)) return "";
      if (
        /function (activateBrand|referenceMotion|focusedSectionMotion|smoothBrandAccordion|smoothFAQAccordion)|b-hero-content>/.test(
          body,
        )
      )
        return "";
      return all;
    },
  );
  html = html.replace(
    /<link\b[^>]*(?:data-integrated-hero|rel="canonical")[^>]*>/g,
    "",
  );
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escape(title)} | CODEYEA</title>`,
  );
  html = html.replace(/<meta\b[^>]*name="description"[^>]*>/g, "");
  html = html.replace(
    "</head>",
    `<meta name="robots" content="noindex,nofollow"><meta name="description" content="${escape(conceptDisclosure[locale])}"><link rel="stylesheet" href="/site/concept-case-studies.css"></head>`,
  );
  // Local review of a concept must not submit an actual lead.
  return html.replace(
    "window.CODEYEA_LEADS_ENABLED=true",
    "window.CODEYEA_LEADS_ENABLED=false",
  );
}

export async function renderConceptCaseStudy(
  item: ConceptCaseStudy,
  locale: CaseLocale,
  links = privateCaseLinks,
) {
  const c = item[locale],
    t = words[locale];
  const top = `<section class="cy-custom-cms" id="requirements"><div class="b-wrap">
    <nav class="case-navigation" aria-label="${t.all}"><a href="${escape(links.index(locale))}">← ${t.all}</a></nav>
    <header class="ccms-heading"><div><span class="b-eyebrow">${t.label} / ${escape(c.name)}</span><h1>${escape(c.title)}</h1></div><div><p>${escape(c.intro)}</p><p class="case-disclosure">${conceptDisclosure[locale]}</p></div></header>
    <div class="ccms-overview">${figure(item, 0, locale)}<div class="ccms-benefits"><h2 class="case-subtitle">${t.requirements}</h2><ul>${c.requirements.map((x) => `<li><span class="ccms-tick" aria-hidden="true">↗</span><div><p>${escape(x)}</p></div></li>`).join("")}</ul></div></div>
    <div class="ccms-closing"><div><h3>${t.scope}</h3><p>${escape(c.services)}</p></div><div><h3>${t.timeline}</h3><p>${escape(c.timeline)}</p></div></div>
  </div></section>`;
  const stages = c.stages
    .map(
      ([title, work], i) =>
        `<section class="cy-custom-cms case-stage" id="stage-${i + 1}" aria-labelledby="stage-${i + 1}-title"><div class="b-wrap"><div class="ccms-overview">${figure(item, i + 1, locale)}<div class="ccms-benefits"><span class="b-eyebrow">${t.stage} ${String(i + 1).padStart(2, "0")} / 05</span><h2 id="stage-${i + 1}-title">${escape(title)}</h2><p>${escape(work)}</p></div></div></div></section>`,
    )
    .join("");
  const results = `<section class="e-operations b-wrap b-section" id="results"><header><span class="b-eyebrow">${t.results}</span><h2>${t.resultTitle}</h2><p>${escape(c.timeline)}</p></header><div class="e-management-grid">${c.metrics.map(([metric, before, after, definition], i) => `<article><span>${String(i + 1).padStart(2, "0")} / ${t.results}</span><h3>${escape(metric)}</h3><p class="case-metric"><span>${t.before}: <bdi>${escape(before)}</bdi></span><strong>${t.after}: <bdi>${escape(after)}</bdi></strong></p><p>${escape(definition)}</p></article>`).join("")}</div><p class="case-outcome">${escape(c.outcome)}</p><p class="case-disclosure">${conceptDisclosure[locale]}</p></section>`;
  const next =
    conceptCaseStudies[
      (conceptCaseStudies.indexOf(item) + 1) % conceptCaseStudies.length
    ];
  const nav = `<div class="b-wrap case-navigation"><a href="${escape(links.index(locale))}">${t.all}</a><a href="${escape(links.detail(next.slug, locale))}">${t.next}: ${escape(next[locale].name)} ↗</a></div>`;
  return caseStudyShell(
    top + stages + results + nav + cta(locale),
    locale,
    c.name + " — " + t.label,
  );
}

export async function renderConceptCaseIndex(
  locale: CaseLocale,
  links = privateCaseLinks,
) {
  const t = words[locale];
  const main = `<section class="b-wrap b-section b-work"><nav class="case-navigation"><span>${t.all}</span></nav><header><h1>${t.index}</h1><p>${t.indexIntro} ${conceptDisclosure[locale]}</p></header><div class="case-index-grid">${conceptCaseStudies.map((item) => `<article><a class="case-index-link" href="${escape(links.detail(item.slug, locale))}"><figure><img src="${item.images[0].src}" width="1440" height="1080" alt="${escape(item[locale].name)}" loading="lazy"></figure><span class="b-eyebrow">${t.label}</span><h2>${escape(item[locale].name)} ↗</h2><p>${escape(item[locale].title)}</p></a></article>`).join("")}</div></section>`;
  return caseStudyShell(main + cta(locale), locale, t.all);
}
