import templateCopy from "./arabic-template-copy.json";
import { arabicIndustryProfiles } from "./arabic-industry-profiles";
import type { Snapshot } from "@/schemas/content";
import { localizedHref } from "./arabic-navigation";
import { servicePageDestinationForText } from "./service-destinations";
const dictionary: Record<string, string> = templateCopy;
export function arabicText(value: string) {
  const trimmed = value.trim();
  const authored = dictionary[value] ?? dictionary[trimmed];
  if (authored) return authored;
  if (
    !/[A-Za-z]{3}/.test(trimmed) ||
    /^(?:[\w.+-]+@|https?:\/\/)/.test(trimmed) ||
    /^[a-z0-9.-]+\.example/.test(trimmed)
  )
    return value;
  if (/^PLAN \d+$/.test(trimmed)) return trimmed.replace("PLAN", "الخطة");
  if (/^Choose (\w+)\s*$/.test(trimmed))
    return "اختر " + trimmed.match(/^Choose (\w+)/)![1];
  // Code fragments exposed by the legacy artwork manifest are not prose.
  if (
    trimmed.startsWith('\",\"') ||
    /^(const|true|&nbsp;&nbsp;\w+:)$/.test(trimmed)
  )
    return value;
  if (
    /^(CODEYEA|WordPress|WooCommerce|NVMe(?: SSD)?|SSD|PHP|Redis(?: \+ Memcached)?|Memcached|cPanel|SitePad|Softaculous|IMAP|SMTP|POP3|SSL|DNS|API|CRM|TBC|\/mo|\/yr|\/month|\/year|USD|global|en|ar|Node\.js|Python|Perl|RubyGems|VelocityMax|InfiniteBoost|MaxPowerPress|QuickPress|TurboPress|InfinitePress|NVMe SSD storage|PHP controls|PHP version selection|MySQL databases|FTP accounts|Email accounts|Subdomains|Bandwidth|Hosted websites)(?: ▾)?$/.test(
      trimmed,
    )
  )
    return dictionary[trimmed] ?? value;
  throw new Error("Arabic copy missing: " + value);
}
export function arabicPath(href: string) {
  return localizedHref(href);
}
const copyKeys = new Set([
  "title",
  "heading",
  "body",
  "text",
  "label",
  "closing",
  "description",
  "alt",
  "actionLabel",
  "ctaLabel",
  "prefix",
  "suffix",
  "eyebrow",
  "unit",
  "supportHeading",
  "contact",
  "copyright",
  "categories",
  "monthlyLabel",
  "annualLabel",
  "renewal",
  "listLabel",
]);
export function localizeArabic<T>(value: T, strict = true): T {
  function walk(v: unknown, key = ""): unknown {
    if (Array.isArray(v)) return v.map((x) => walk(x));
    if (v && typeof v === "object")
      return Object.fromEntries(
        Object.entries(v).map(([k, x]) => [k, walk(x, k)]),
      );
    if (typeof v !== "string") return v;
    if (key === "localeId") return "ar";
    if (["href", "ctaHref", "destination", "canonicalPath"].includes(key))
      return arabicPath(v);
    if (!copyKeys.has(key) || !v.trim() || !/[A-Za-z]{3}/.test(v)) return v;
    if (dictionary[v] ?? dictionary[v.trim()])
      return dictionary[v] ?? dictionary[v.trim()];
    if (
      /^(CODEYEA|WordPress|WooCommerce|NVMe|SSD|PHP|Redis|Memcached|cPanel|SitePad|Softaculous|IMAP|SMTP|POP3|SSL|DNS|API|CRM|TBC|\/mo|\/yr|\/month|\/year|USD|global|en|ar)$/.test(
        v,
      ) ||
      /^[\w.+-]+@[\w.-]+$/.test(v) ||
      /^https?:\/\//.test(v)
    )
      return v;
    if (strict) return arabicText(v);
    return v;
  }
  return walk(value) as T;
}
export function arabicIndustrySnapshot(source: Snapshot): Snapshot {
  const result = structuredClone(source),
    detail = result.industryDetail!;
  const profile = arabicIndustryProfiles[detail.slug];
  if (!profile) throw new Error("Missing industry Arabic profile");
  result.title = profile.name;
  detail.localeId = "ar";
  detail.hero.title = profile.name;
  detail.hero.media.alt = profile.name;
  detail.seo = {
    ...detail.seo,
    title: `حلول رقمية لقطاع ${profile.name} | CODEYEA`,
    description: profile.intro,
    canonicalPath: `/ar/industries/${detail.slug}/`,
  };
  const headers: Record<string, [string, string]> = {
    overview: ["القطاع", `حلول رقمية لقطاع ${profile.name}`],
    strip: ["بيئة العمل", `حضور يعكس ${profile.name}`],
    needs: ["نهجنا", "ما يحتاجه نشاطك الرقمي"],
    imageBreak: ["خبرة واضحة", "معلومات مفيدة. خطوات أسهل."],
    services: ["خدماتنا", "خدمات رقمية تتكامل حول نشاطك"],
    growth: ["الظهور والنمو", "من الاكتشاف إلى تواصل مفيد"],
    faq: ["أسئلة شائعة", "إجابات تساعدك على التخطيط"],
    related: ["استكشف القطاعات", "قطاعات نخدمها"],
    cta: [
      "لنبنِ الخطوة القادمة",
      `حضور رقمي يوضح قيمة نشاطك في ${profile.name}`,
    ],
  };
  const growthTitles = ["الاكتشاف", "بناء الثقة", "التواصل", "التطوير"];
  const growthBodies = [
    `نرتب المحتوى والبحث حول أسئلة ${profile.audience} والخدمات التي تقدمها فعلًا.`,
    `نبني عرضًا واضحًا لهويتك وخبرتك ومعلوماتك المعتمدة، مع صور وأدلة مصرح باستخدامها.`,
    `نوصل الصفحات بخطوة تواصل مناسبة ونموذج يجمع المعلومات المفيدة لبدء المحادثة.`,
    `نجهز أدوات إدارة المحتوى ونراجع البيانات المتاحة لتحديد التحسينات التالية مع نمو نشاطك.`,
  ];
  for (const section of detail.sections) {
    const header = headers[section.type];
    section.label = header[0];
    section.heading = header[1];
    section.listLabel = "خدمات رقمية";
    section.actionLabel =
      section.type === "cta" ? "ناقش مشروعك معنا" : "اكتشف الخدمة";
    section.destination = arabicPath(section.destination);
    section.body =
      section.type === "related"
        ? ""
        : section.type === "cta"
          ? `شاركنا أهدافك وأدواتك الحالية. نحدد معك نطاقًا عمليًا يربط التصميم والمحتوى والتقنية باحتياجات ${profile.name}.`
          : profile.intro;
    if (section.media) section.media.alt = `${profile.name} — صورة توضيحية`;
    if (section.pillarMedia)
      section.pillarMedia.alt = `خدمات ${profile.name} — صورة توضيحية`;
    section.items.forEach((item, i) => {
      const destination =
        item.destination ||
        (section.type === "services"
          ? servicePageDestinationForText(item.id, item.title, item.actionLabel)
          : undefined) ||
        "";
      item.actionLabel = "ناقش احتياجك";
      item.destination = arabicPath(destination);
      if (item.media)
        item.media.alt = `${profile.name} — صورة توضيحية ${i + 1}`;
      if (section.type === "strip") {
        item.title = `${profile.name} — مشهد ${i + 1}`;
        item.body = "صورة توضيحية للقطاع، وليست توثيقًا لمشروع عميل.";
      }
      if (section.type === "needs") {
        item.title = profile.needs[i] ?? "تجربة واضحة";
        item.body = [
          `رتب الخدمات والمعلومات التي يحتاجها ${profile.audience} ليعرفوا مدى ملاءمة نشاطك قبل التواصل.`,
          `اجمع الهوية المتسقة والمحتوى المعتمد والأعمال المصرح بعرضها في تجربة تبني فهمًا أوضح لخبرتك.`,
          `اربط المحتوى بإجراءات تواصل وإدارة مناسبة لأدواتك الحالية، دون تعقيد غير لازم.`,
        ][i % 3];
      }
      if (section.type === "services") {
        item.title = profile.services[i];
        if (!item.title) throw new Error("Missing Arabic service");
        item.body = `نخطط ${item.title} وفق احتياجات نشاطك والمحتوى والأدوات المعتمدة. نحدد نطاق التنفيذ والصلاحيات وخطوات التسليم قبل بدء العمل.`;
      }
      if (section.type === "growth") {
        item.title = growthTitles[i];
        item.body = growthBodies[i];
      }
      if (section.type === "faq") {
        item.title = profile.questions[i];
        item.body = profile.answers[i];
        if (!item.title || !item.body) throw new Error("Missing Arabic FAQ");
        item.actionLabel = "";
      }
    });
  }
  return result;
}
export function arabicSnapshot(source: Snapshot): Snapshot {
  if (source.industryDetail) return arabicIndustrySnapshot(source);
  const copy = structuredClone(source);
  if (copy.industriesPage) {
    copy.industriesPage.items.forEach((item) => {
      const slug = item.destination.replace(/^\/industries\/|\/$/g, "");
      const p = arabicIndustryProfiles[slug];
      if (!p) throw new Error("Missing directory profile " + slug);
      item.title = item.heading = p.name;
      item.label = "القطاع";
      item.body = p.intro;
      item.ctaLabel = `اكتشف ${p.name}`;
      item.media.alt = `${p.name} — صورة توضيحية`;
      item.highlights.forEach((h, i) => {
        h.title = p.needs[i % p.needs.length];
        h.body = [
          p.intro,
          `نرتب المحتوى والخدمات حول احتياجات ${p.audience}، مع معلومات وصور يعتمدها نشاطك.`,
          `نربط الموقع بخطوة تواصل مناسبة وأدوات الإدارة المتفق عليها ليبقى العمل واضحًا لفريقك.`,
        ][i % 3];
      });
    });
  }
  return localizeArabic(copy);
}
