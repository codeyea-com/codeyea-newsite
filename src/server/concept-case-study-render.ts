import { conceptDetailMain, iraqHomeExpoMain } from "./approved-case-detail";
import {caseIndexMain} from './case-index';
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
function cta(locale: CaseLocale) {
  const t = words[locale];
  return `<section class="b-contact"><div><span>${t.ready}</span><h2>${t.closing}</h2></div><a class="b-btn" data-quote-open href="${locale === "ar" ? "/ar" : ""}/contact/#quote-form">${t.cta}<span aria-hidden="true">↗</span></a></section>`;
}

/** Reuse the approved Website Design document shell, CSS and exact commerce entrance script. */
export async function caseStudyShell(
  main: string,
  locale: CaseLocale,
  title: string,
  options: { detail?: boolean; description?: string } = {},
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
    `<main id="main" class="${options.detail ? "case-detail" : "b case-study"}">${main}</main>`,
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
    `<meta name="robots" content="noindex,nofollow"><meta name="description" content="${escape(options.description ?? conceptDisclosure[locale])}"><link rel="stylesheet" href="/site/concept-case-studies.css"></head>`,
  );
  if (options.detail) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="/site/case-detail.css"></head>',
    );
    html = html.replace(
      "</body>",
      '<script src="/site/case-detail.js" defer></script></body>',
    );
  } else {
    html = html.replace('</head>', '<link rel="stylesheet" href="/site/case-index.css"></head>')
      .replace('</body>', '<script src="/site/case-index.js" defer></script></body>');
  }
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
  return caseStudyShell(
    conceptDetailMain(item, locale, links),
    locale,
    item[locale].name + " | " + words[locale].label,
    { detail: true },
  );
}

export async function renderIraqHomeExpo(
  locale: CaseLocale,
  links = privateCaseLinks,
) {
  return caseStudyShell(
    await iraqHomeExpoMain(locale, links),
    locale,
    "Iraq Home Expo",
    {
      detail: true,
      description:
        locale === "ar"
          ? "رحلة هوية معرض عراق هوم إكسبو وموقعه التفاعلي ونظام إدارة المحتوى الخاص."
          : "The Iraq Home Expo identity, interactive website and Custom CMS project journey.",
    },
  );
}

export async function renderConceptCaseIndex(
  locale: CaseLocale,
  links = privateCaseLinks,
) {
  const t = words[locale];
  return caseStudyShell(caseIndexMain(locale, links) + cta(locale), locale, t.all);
}
