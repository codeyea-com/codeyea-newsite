import fs from "node:fs/promises";
import path from "node:path";
import {
  conceptCaseStudies,
  conceptDisclosure,
  type ConceptCaseStudy,
  type CaseLocale,
} from "../content/concept-case-studies";
import type { CaseRenderLinks } from "./concept-case-study-render";

const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ]!,
  );
export const iraqHomeExpoSlug = "iraq-home-expo";
export const detailSlugs = [
  ...conceptCaseStudies.map((c) => c.slug),
  iraqHomeExpoSlug,
];
export const isCaseDetail = (slug: string) => detailSlugs.includes(slug);
const copy = {
  ar: {
    all: "كل المشاريع",
    project: "المشروع",
    requirements: "المتطلبات",
    deliverables: "المخرجات",
    concept: "دراسة حالة افتراضية",
    stage: "المرحلة",
    scope: "نطاق العمل",
    timeline: "الإطار الزمني للسيناريو",
    results: "نتائج المحاكاة",
    before: "قبل",
    after: "بعد",
    resultTitle: "الفرق، بلغة الأرقام.",
    previous: "→ المشروع السابق",
    next: "المشروع التالي ←",
    ready: "عندك مشروع ببالك؟",
    talk: "خلّينا نحچي.",
    quote: "أطلب التسعيرة المجانية الآن",
    close: "إغلاق",
    expand: "تكبير الصورة",
    detail: "تفاصيل المرحلة",
  },
  en: {
    all: "See all projects",
    project: "The project",
    requirements: "Requirements",
    deliverables: "Deliverables",
    concept: "Concept case study",
    stage: "Stage",
    scope: "Project scope",
    timeline: "Scenario timeline",
    results: "Simulated results",
    before: "Before",
    after: "After",
    resultTitle: "The change, measured.",
    previous: "← Previous project",
    next: "Next project →",
    ready: "Have a project in mind?",
    talk: "Let’s talk.",
    quote: "Get Your Free Quote",
    close: "Close",
    expand: "Enlarge image",
    detail: "Stage details",
  },
};
export function approvedCaseCta(locale: CaseLocale) {
  const t = copy[locale];
  return `<section class="case-cta" aria-labelledby="case-cta-title"><div><span>${t.ready}</span><h2 id="case-cta-title">${t.talk}</h2></div><a class="b-btn" data-quote-open href="${locale === "ar" ? "/ar" : ""}/contact/#quote-form">${t.quote}<span aria-hidden="true">${locale === "ar" ? "↖" : "↗"}</span></a></section>`;
}
function projectNavigation(
  slug: string,
  locale: CaseLocale,
  links: CaseRenderLinks,
) {
  const t = copy[locale],
    i = detailSlugs.indexOf(slug);
  return `<nav class="project-nav wrap" aria-label="${t.all}"><a href="${esc(links.detail(detailSlugs[(i + detailSlugs.length - 1) % detailSlugs.length], locale))}">${t.previous}</a><a href="${esc(links.index(locale))}" aria-label="${t.all}">⠿</a><a href="${esc(links.detail(detailSlugs[(i + 1) % detailSlugs.length], locale))}">${t.next}</a></nav>`;
}
function photo(
  item: ConceptCaseStudy,
  n: number,
  locale: CaseLocale,
  hotspots = false,
) {
  const [title, body] = item[locale].stages[n - 1],
    image = item.images[n],
    t = copy[locale];
  return `<figure class="image-frame reveal${hotspots ? " hotspots" : ""}"><img src="${esc(image.src)}" width="${image.width}" height="${image.height}" alt="${esc(title)}" loading="lazy" decoding="async"><figcaption>${t.stage} ${String(n).padStart(2, "0")}</figcaption>${hotspots ? `<button class="hotspot h1" aria-expanded="false" aria-controls="note1" aria-label="${t.detail}">+</button><span class="hotnote" id="note1" hidden>${esc(title)}</span><button class="hotspot h2" aria-expanded="false" aria-controls="note2" aria-label="${t.detail}">+</button><span class="hotnote second" id="note2" hidden>${esc(body)}</span>` : ""}</figure>`;
}
export function conceptDetailMain(
  item: ConceptCaseStudy,
  locale: CaseLocale,
  links: CaseRenderLinks,
) {
  const c = item[locale],
    t = copy[locale],
    cover = item.images[0];
  const tabs = [
    `<p>${esc(c.intro)}</p><p class="case-disclosure">${conceptDisclosure[locale]}</p>`,
    `<ul>${c.requirements.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`,
    `<p>${esc(c.services)}</p><p>${esc(c.timeline)}</p>`,
  ];
  const top = `<div class="title-row wrap"><div><h1>${esc(c.name)}</h1><span>${t.concept}</span></div><a class="all-projects" href="${esc(links.index(locale))}"><span>${t.all}</span><span aria-hidden="true">⠿</span></a></div>
  <section class="gallery wrap" aria-label="${esc(c.name)}"><div class="gallery-stage single-image"><div class="gallery-track"><figure class="slide"><img src="${esc(cover.src)}" width="${cover.width}" height="${cover.height}" alt="${esc(c.title)}" fetchpriority="high" decoding="async"></figure></div></div></section>
  <section class="intro intro-concept wrap" id="requirements"><div class="tab-block"><div class="tabs" role="tablist">${[t.project, t.requirements, t.deliverables].map((label, i) => `<button role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? "0" : "-1"}" data-tab="${i}">${label}</button>`).join("")}</div><div class="tab-content">${tabs.map((body, i) => `<div role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}"${i ? " hidden" : ""}>${body}</div>`).join("")}</div></div></section>`;
  const split = (n: number, reverse = false, hotspots = false) => {
    const [heading, body] = c.stages[n - 1];
    const text = `<div class="copy reveal"><h2 id="stage-${n}-title">${esc(heading)}</h2><p>${esc(body)}</p></div>`;
    return `<section class="split${reverse ? " reverse" : ""} wrap" id="stage-${n}" aria-labelledby="stage-${n}-title">${reverse ? text + photo(item, n, locale, hotspots) : photo(item, n, locale) + text}</section>`;
  };
  const summary = `<section class="numbers concept-numbers wrap reveal" aria-label="${t.results}">${c.metrics.map(([label, , value]) => `<div><strong>${esc(value)}</strong><p>${t.after}: ${esc(label)}</p></div>`).join("")}<p class="case-disclosure">${conceptDisclosure[locale]}</p></section>`;
  const img = item.images[4];
  const sections = [
    [t.scope, `<p>${esc(c.services)}</p>`],
    [
      t.requirements,
      `<ul>${c.requirements.map((s) => `<li>${esc(s)}</li>`).join("")}</ul>`,
    ],
    [t.timeline, `<p>${esc(c.timeline)}</p>`],
  ];
  const creative = `<section class="creative" id="stage-4" aria-labelledby="stage-4-title"><div class="creative-media reveal"><picture><img src="${esc(img.src)}" width="${img.width}" height="${img.height}" alt="${esc(c.stages[3][0])}" loading="lazy" decoding="async"></picture><button class="expand-photo" aria-label="${t.expand}">↗</button></div><div class="creative-copy reveal"><h2 id="stage-4-title">${esc(c.stages[3][0])}</h2><p>${esc(c.stages[3][1])}</p><div class="accordion">${sections.map(([label, body], i) => `<article><button aria-expanded="${i === 0}" aria-controls="acc${i}"><span>${label}</span><b aria-hidden="true">${i ? "＋" : "−"}</b></button><div class="accordion-body" id="acc${i}"${i ? " hidden" : ""}>${body}</div></article>`).join("")}</div></div></section>`;
  const results = `<section class="journey wrap" id="results"><header class="journey-heading reveal"><h2>${t.resultTitle}</h2><p>${esc(c.outcome)}</p></header><div class="section-label"><span>${t.results}</span><span>01 / 03</span></div>${c.metrics.map(([label, before, after, definition]) => `<article class="process-row reveal"><h3 class="metric-comparison"><small>${t.before}: <bdi>${esc(before)}</bdi></small><span>${t.after}: <bdi>${esc(after)}</bdi></span></h3><div><h4>${esc(label)}</h4><p>${esc(definition)}</p></div></article>`).join("")}<p class="case-disclosure">${conceptDisclosure[locale]}</p></section>`;
  const dialog = `<dialog class="photo-dialog"><button aria-label="${t.close}">×</button><img src="${esc(img.src)}" alt="${esc(c.stages[3][0])}"></dialog>`;
  return (
    top +
    split(1) +
    summary +
    split(2, true, true) +
    split(3) +
    creative +
    split(5, true) +
    results +
    projectNavigation(item.slug, locale, links) +
    approvedCaseCta(locale) +
    dialog
  );
}

export async function iraqHomeExpoMain(
  locale: CaseLocale,
  links: CaseRenderLinks,
) {
  let main = await fs.readFile(
    path.join(
      process.cwd(),
      "site-templates/case-study-detail/iraq-home-expo.html",
    ),
    "utf8",
  );
  if (locale === "en")
    main = main.replace(
      /<([a-z][a-z0-9]*)(\s[^>]*\bdata-en="([^"]*)"[^>]*)>[\s\S]*?<\/\1>/gi,
      (_, tag, attrs, text) => `<${tag}${attrs}>${text}</${tag}>`,
    );
  main = main.replace(
    /\.\.\/case-studies\/index-ar\.html/g,
    esc(links.index(locale)),
  );
  main = main.replace(
    /<div class="project-nav wrap">[\s\S]*?<\/div>/,
    projectNavigation(iraqHomeExpoSlug, locale, links),
  );
  // Gallery controls are structural and localised separately from visible copy.
  if (locale === "en") {
    const labels: Record<string, string> = {
      "معرض المشروع": "Project gallery",
      "الصورة السابقة": "Previous image",
      "الصورة التالية": "Next image",
      "اختيار صورة": "Choose an image",
      "النتيجة المتكاملة": "Complete project",
      المطبوعات: "Print materials",
      "بوابة المعرض": "Exhibition entrance",
      "نطاق المشروع": "Project scope",
      "تفصيل الألوان": "Colour details",
      "تفصيل التطبيقات": "Application details",
      "تكبير صورة الاستمارات": "Enlarge registration image",
      "كل المشاريع": "See all projects",
      إغلاق: "Close",
    };
    main = main.replace(/aria-label="([^"]*)"/g, (all, value) =>
      labels[value] ? `aria-label="${labels[value]}"` : all,
    );
    const alts: Record<string, string> = {
      "هوية عراق هوم إكسبو والموقع على الأجهزة والمواد المطبوعة":
        "Iraq Home Expo identity, website on devices and printed materials",
      "تطبيقات الهوية من دليل البراند الأصلي":
        "Identity applications from the original brand guide",
      "تصميم بوابة المعرض من دليل البراند الأصلي":
        "Exhibition entrance design from the original brand guide",
      "تطوير فكرة الشعار من القوس المعماري إلى الهوية":
        "Developing the logo from the architectural arch to the identity",
      "تطبيقات الهوية على البطاقات والمطبوعات":
        "Identity applications on badges and printed materials",
      "الموقع الحقيقي داخل لابتوب وموبايل وتابلت":
        "The live website on laptop, phone and tablet",
      "استمارات الزائر والعارض على أجهزة حقيقية":
        "Visitor and exhibitor forms on real devices",
      "تصور لطموح الوصول الدولي حول الموقع":
        "An illustration of the website’s international ambition",
      "تفاصيل استمارات المشاركة": "Participation form details",
    };
    main = main.replace(/alt="([^"]*)"/g, (all, value) =>
      alts[value] ? `alt="${alts[value]}"` : all,
    );
  }
  return main + approvedCaseCta(locale);
}
