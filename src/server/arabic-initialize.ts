import { db } from "./db";
import { requirePermission } from "./permissions";
import { AppError } from "./errors";
import { englishPageIds } from "@/content/industry-registry";
import { documentSlugs, pagePath } from "@/content/site-routes";
import {
  arabicSnapshot,
  arabicText,
  arabicPath,
} from "@/content/arabic-localization";
import { snapshotSchema } from "@/schemas/content";
import { documentContent } from "./site-editing";
import {
  templateContent,
  templatePageDraft,
  bindDocumentControls,
  type DocumentContent,
} from "./site-documents";
import { resolvePageAdditions } from "@/schemas/page-additions";
import type { Prisma } from "@/generated/prisma/client";
export function localizeDocument(content: DocumentContent, slug: string) {
  const result = structuredClone(content);
  result.fields = result.fields.map((f) => ({
    ...f,
    value: arabicText(f.value),
  }));
  result.images = result.images?.map((image) => ({
    ...image,
    alt: arabicText(image.alt),
  }));
  if (result.controls) {
    result.controls.artworkText = result.controls.artworkText.map((f) => ({
      ...f,
      value: arabicText(f.value),
    }));
    result.controls.assets = result.controls.assets.map((a) => ({
      ...a,
      alt: a.alt === undefined ? undefined : arabicText(a.alt),
    }));
    result.controls.links = result.controls.links.map((l) => ({
      ...l,
      href: arabicPath(l.href),
    }));
  }
  const title = templatePageDraftTitles[slug];
  const descriptions: Record<string, string> = {
    "website-design":
      "تصميم وتطوير مواقع أعمال واضحة وسريعة وسهلة الإدارة. نبني تجربة مناسبة لجمهورك تربط المحتوى والخدمات بخطوة تواصل مفيدة.",
    "brand-design":
      "هوية بصرية وتصميم جرافيكي يعكسان شخصية نشاطك. نرتب الشعار والألوان والمواد التسويقية في نظام متسق يصلح للاستخدام اليومي.",
    ecommerce:
      "حلول تجارة إلكترونية تربط عرض المنتجات والشراء والدفع وإدارة المتجر. تجربة عملية تناسب عملاءك والأدوات التي يعتمد عليها نشاطك.",
    "seo-geo":
      "تحسين محركات البحث SEO والإجابات AEO والظهور في الذكاء الاصطناعي GEO. محتوى موثوق وبنية واضحة تساعد الناس والمنصات على فهم خدماتك.",
    "digital-marketing":
      "تسويق رقمي ينطلق من أهداف نشاطك وجمهورك. نربط المحتوى والحملات والقنوات بقياس واضح للنتائج المتاحة وقرارات تطوير عملية.",
    "web-mobile-apps":
      "تطوير تطبيقات الويب والموبايل لعملائك وفريقك. وظائف مناسبة لإجراءات العمل وتجربة استخدام واضحة وتكامل مع أدواتك المعتمدة.",
    "ai-automation":
      "حلول ذكاء اصطناعي وأتمتة أعمال لتبسيط المهام المتكررة. نحدد الاستخدام المناسب والبيانات والصلاحيات والمراجعة البشرية قبل التنفيذ.",
    "technical-support":
      "دعم تقني لإصلاح المواقع واستعادة العمل ومعالجة أخطاء قواعد البيانات ونقل الاستضافة. تشخيص واضح وخطوات متفق عليها تناسب حالة موقعك.",
    contact:
      "تواصل مع CODEYEA لمناقشة موقعك أو متجرك أو تطبيقك. شارك أهداف نشاطك لنحدد نطاقًا عمليًا وخطوات واضحة للمشروع.",
    domains:
      "تسجيل وإدارة أسماء النطاقات لأعمالك. اختر اسمًا مناسبًا وتعرّف على خيارات الامتدادات والإعداد والتجديد قبل اتخاذ القرار.",
    "website-hosting":
      "استضافة مواقع أعمال مع خيارات واضحة للموارد والخطط. قارن احتياجات موقعك وتعرف على الفوترة السنوية والدعم التقني المتاح.",
    "wordpress-hosting":
      "استضافة WordPress تناسب موقعك وإضافاته ونموه. قارن الخطط والموارد وتعرّف على خيارات الدعم عند التحديثات والمشكلات التقنية.",
    "cloud-hosting":
      "استضافة سحابية للمواقع والتطبيقات المتنامية. اختر الموارد المناسبة لمرحلتك وتعرف على الخطط وخيارات التوسع والدعم التقني.",
    "email-hosting":
      "استضافة بريد أعمال باسم نطاقك. قارن سعات البريد والخطط وخيارات النقل وإعداد DNS، مع توفير 10% عند الفوترة السنوية.",
  };
  result.description = descriptions[slug];
  result.seo = {
    ...result.seo,
    title: `${title} | CODEYEA`,
    description: result.description,
    canonicalPath: `/ar/${slug}/`,
    index: false,
    follow: true,
  };
  result.additions = resolvePageAdditions(slug, result.additions);
  for (const key of ["support", "search"] as const) {
    const s = result.additions[key];
    if (!s) continue;
    s.label =
      key === "support" ? "الدعم التقني" : "البحث والإجابات والذكاء الاصطناعي";
    s.heading =
      key === "support"
        ? "استضافة مناسبة، ودعم عندما تحتاجه."
        : "SEO وAEO وGEO ضمن استراتيجية ظهور واحدة.";
    s.body =
      key === "support"
        ? `إذا واجه موقعك على ${title} خطأ أو احتجت إلى نقل أو مراجعة أداء، نراجع الإعداد ونحدد معك خطوات الدعم المطلوبة بوضوح.`
        : "نربط قابلية اكتشاف صفحاتك بإجابات واضحة ومعلومات موثوقة يمكن للناس وأنظمة البحث فهمها. تعود قرارات الترتيب والاستشهاد للمنصات نفسها.";
    s.actionLabel =
      key === "support" ? "ناقش احتياجك التقني" : "ناقش استراتيجية ظهورك";
    s.href = arabicPath(s.href);
    s.alt = "فريق يعمل على الدعم التقني";
    s.items = s.items.map((item, i) => ({
      title:
        [
          "SEO — الظهور في محركات البحث",
          "AEO — إجابات واضحة للأسئلة",
          "GEO — اكتشاف بالذكاء الاصطناعي",
        ][i] ?? arabicText(item.title),
      body:
        [
          "بنية قابلة للزحف وروابط داخلية ومحتوى مفيد وبيانات وصفية مناسبة لخدماتك وجمهورك.",
          "نظم الأسئلة والإجابات والمعلومات الأساسية بوضوح ليسهل فهم عرضك واتخاذ القرار.",
          "قدم معلومات نشاط متسقة وخبرة موثقة وسياقًا مفيدًا يدعم فهم المحتوى، دون ضمان إدراجه في إجابات مولدة.",
        ][i] ?? arabicText(item.body),
    }));
  }
  const supportCopy: Record<string, [string, string]> = {
    "website-hosting": [
      "موقعك له أساس، واستمراريته لها دعم.",
      "أخطاء الموقع أو قاعدة البيانات أو الانتقال بين الاستضافات تحتاج خطوات واضحة. نراجع المشكلة ونحدد دعمًا عمليًا يناسب الأنظمة التي يعتمد عليها موقعك.",
    ],
    "wordpress-hosting": [
      "عناية تقنية تناسب موقع WordPress.",
      "تعارض إضافات أو تحديث متعثر أو توقف مفاجئ؟ نساعدك في تشخيص السبب واستعادة عمل الموقع والتخطيط للخطوة التالية بأمان.",
    ],
    "cloud-hosting": [
      "موارد أكبر، ودعم لمرحلة النمو.",
      "مع انتقالك إلى استضافة سحابية، نساعدك في مشكلات التطبيقات ونقل الموقع والتغييرات التقنية المرتبطة بتوسع نشاطك.",
    ],
    "email-hosting": [
      "خلّ تواصل أعمالك مستمرًا.",
      "نساعدك في نقل البريد وإعداد النطاق وDNS ومعالجة مشكلات التسليم، لتبقى محادثات فريقك وعملائك على المسار الصحيح.",
    ],
  };
  if (result.additions.support && supportCopy[slug]) {
    result.additions.support.heading = supportCopy[slug][0];
    result.additions.support.body = supportCopy[slug][1];
  }
  const words: Record<string, string[]> = {
    "ai-automation": ["مترابطة", "واضحة", "عملية"],
    "technical-support": ["بثقة", "بانتظام", "بسلاسة"],
    "web-mobile-apps": ["مترابطة", "عملية", "مرنة"],
    "digital-marketing": ["هدف", "أثر", "قيمة"],
    "seo-geo": ["مفيدة", "واضحة", "موثوقة"],
  };
  if (words[slug]) result.additions.introWords = words[slug];
  if (result.additions.discount)
    result.additions.discount.label = "مع الفوترة السنوية";
  return documentContent.parse(result);
}
const templatePageDraftTitles: Record<string, string> = {
  "website-design": "تصميم وتطوير المواقع",
  "brand-design": "تصميم الهوية البصرية",
  ecommerce: "حلول التجارة الإلكترونية",
  "seo-geo": "تحسين الظهور في البحث والذكاء الاصطناعي",
  "digital-marketing": "التسويق الرقمي",
  "web-mobile-apps": "تطبيقات الويب والموبايل",
  "ai-automation": "الذكاء الاصطناعي وأتمتة الأعمال",
  "technical-support": "الدعم التقني",
  contact: "تواصل معنا",
  domains: "تسجيل وإدارة النطاقات",
  "website-hosting": "استضافة المواقع",
  "wordpress-hosting": "استضافة WordPress",
  "cloud-hosting": "الاستضافة السحابية",
  "email-hosting": "استضافة بريد الأعمال",
};
/** Idempotent, authenticated creation only. Never overwrite or publish owner drafts. */
export async function initializeArabicPages(actorId: string | null) {
  await requirePermission(actorId, "edit_pages");
  const rows = await db.page.findMany({
    where: { id: { in: [...englishPageIds] }, deletedAt: null },
  });
  if (rows.length !== englishPageIds.length)
    throw new AppError(
      409,
      "Initialize all English pages before creating Arabic counterparts.",
    );
  const pages = rows.map((row) => {
    const source = snapshotSchema.parse(row.draftSnapshot);
    const snapshot = snapshotSchema.parse(arabicSnapshot(source));
    const seo =
      snapshot.homepage?.seo ??
      snapshot.about?.seo ??
      snapshot.servicesPage?.seo ??
      snapshot.industriesPage?.seo ??
      snapshot.industryDetail?.seo;
    if (seo) {
      seo.canonicalPath = pagePath("ar-" + row.id)!;
      seo.index = false;
    }
    return { row, snapshot };
  });
  const documents = await Promise.all(
    documentSlugs.map(async (slug) => {
      const html = await templateContent(slug);
      const english = await db.siteDocument.findUnique({
        where: { slug_locale: { slug, locale: "en" } },
      });
      const raw =
        (english?.draft as DocumentContent | undefined) ??
        templatePageDraft(slug, html).content;
      const content = localizeDocument(
        await bindDocumentControls(slug, html, raw),
        slug,
      );
      return {
        slug,
        title: content.seo!.title.replace(/ \| CODEYEA$/, ""),
        content,
      };
    }),
  );
  return db.$transaction(
    async (tx) => {
      await requirePermission(actorId, "edit_pages", tx);
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420410)`;
      await tx.locale.upsert({
        where: { id: "ar" },
        create: { id: "ar", name: "العربية", direction: "rtl" },
        update: {},
      });
      const created: string[] = [],
        existing: string[] = [];
      for (const { row, snapshot } of pages) {
        const id = "ar-" + row.id;
        const prior = await tx.page.findUnique({ where: { id } });
        if (prior) {
          existing.push(id);
          continue;
        }
        await tx.page.create({
          data: {
            id,
            slug: row.slug,
            title: snapshot.title,
            localeId: "ar",
            marketId: row.marketId,
            status: "DRAFT",
            draftSnapshot: snapshot as Prisma.InputJsonValue,
            createdBy: actorId,
            updatedBy: actorId,
          },
        });
        await tx.auditLog.create({
          data: {
            actorId,
            action: "page.arabic_draft_initialized",
            entityType: "Page",
            entityId: id,
            after: snapshot as Prisma.InputJsonValue,
          },
        });
        created.push(id);
      }
      for (const { slug, title, content } of documents) {
        const prior = await tx.siteDocument.findUnique({
          where: { slug_locale: { slug, locale: "ar" } },
        });
        if (prior) {
          existing.push(slug + ":ar");
          continue;
        }
        const doc = await tx.siteDocument.create({
          data: {
            slug,
            locale: "ar",
            kind: "page",
            title,
            template: slug,
            draft: content as Prisma.InputJsonValue,
          },
        });
        await tx.siteDocumentRevision.create({
          data: {
            documentId: doc.id,
            version: doc.version,
            snapshot: { title, draft: content } as Prisma.InputJsonValue,
            actorId: actorId!,
          },
        });
        await tx.auditLog.create({
          data: {
            actorId,
            action: "document.arabic_draft_initialized",
            entityType: "SiteDocument",
            entityId: doc.id,
          },
        });
        created.push(slug + ":ar");
      }
      return { created, existing, published: 0 };
    },
    { timeout: 60000 },
  );
}
