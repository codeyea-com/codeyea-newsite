import { illustrativeWork } from "../content/illustrative-work";
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
const overlays: Record<string, Record<number, [string, string]>> = {
  "seo-geo": {
    2: ["✓ LCP · INP", "✓ سرعة التحميل · الاستجابة"],
    4: ["⌖ Location · Hours · Services", "⌖ الموقع · الساعات · الخدمات"],
    6: ["Search · Visits · Enquiries", "البحث · الزيارات · الاستفسارات"],
  },
  "digital-marketing": {
    2: ["Collection → Launch", "المجموعة ← الإطلاق"],
    4: ["⌖ Menu · Location", "⌖ القائمة · الموقع"],
    6: ["Message → Landing page", "الرسالة ← صفحة الهبوط"],
  },
  "web-mobile-apps": {
    2: ["✓ Job update recorded", "✓ تحديث المهمة مسجّل"],
    4: ["▥ Stock movement recorded", "▥ حركة المخزون مسجّلة"],
    6: ["✓ Delivery completed", "✓ اكتمل التوصيل"],
  },
  "ai-automation": {
    2: ["Request → Right team", "الطلب ← الفريق المناسب"],
    4: ["Order → Stock → Dispatch", "الطلب ← المخزون ← التجهيز"],
    6: ["Draft → Review → Approve", "مسودة ← مراجعة ← موافقة"],
  },
};
export function renderIllustrativeWork(
  html: string,
  slug: string,
  locale: "en" | "ar",
) {
  const concepts = illustrativeWork[slug];
  if (!concepts) return html;
  return html.replace(
    /<section\b[^>]*\bid="ds-works"[^>]*>[\s\S]*?<\/section>/,
    (section) => {
      if (!/Project content pending|محتوى المشروع قيد التجهيز/.test(section))
        return section;
      let i = 0;
      section = section.replace(
        /<article\b[^>]*>[\s\S]*?<\/article>/g,
        (article) => {
          const c = concepts[i++];
          if (!c) return article;
          const [title, body] = c[locale];
          const src = `/site/generated/${slug}/project-${i}-${locale}.svg`;
          const label =
            locale === "ar" ? "تصوّر تطبيقي" : "Application concept";
          const overlay =
            overlays[slug]?.[i]?.[locale === "ar" ? 1 : 0] || title;
          const chart =
            slug === "seo-geo" && i === 6
              ? '<div class="work-mini-chart" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>'
              : "";
          const art =
            c.visual === "photo"
              ? `<picture class="work-photo"><source media="(max-width:800px)" srcset="/site/generated/${slug}/photo-${i}-mobile.png"><img src="/site/generated/${slug}/photo-${i}-desktop.png" alt="${escape(title)}"></picture><div class="work-popup"><small>${label}</small><b>${escape(overlay)}</b>${chart}</div><div class="work-check" aria-hidden="true">✓</div>`
              : `<picture style="display:contents"><source media="(max-width:800px)" srcset="/site/generated/${slug}/project-${i}-${locale}-mobile.svg"><img class="work-technical" src="${src}" alt="${escape(title)}"></picture>`;
          return `<article><div class="ds-placeholder work-art work-${escape(slug)}">${art}</div><h3>${escape(title)}</h3><p>${escape(body)}</p></article>`;
        },
      );
      section = section.replace(
        /<header>[\s\S]*?<\/header>/,
        `<header><span>${locale === "ar" ? "نماذج تطبيقية" : "Application concepts"}</span><span class="ds-muted">${locale === "ar" ? "تصوّرات توضيحية للخدمة" : "Illustrative service concepts"}</span></header>`,
      );
      if (locale === "ar") {
        const headings: Record<string, string> = {
          "seo-geo": ".بحث .محتوى<br>.ظهور <em>.إجابات</em>",
          "digital-marketing": ".حملات .محتوى<br>.وصول <em>.نمو</em>",
          "web-mobile-apps": ".ويب .موبايل<br>.تجارب <em>.عمليات</em>",
          "ai-automation": ".مساعدون .أتمتة<br>.تكاملات <em>.معرفة</em>",
        };
        const filters: Record<string, string> = {
          "seo-geo": "الكل / SEO التقني / المحتوى / GEO",
          "digital-marketing": "الكل / الحملات / المحتوى / القياس",
          "web-mobile-apps": "الكل / التطبيقات / البوابات / العمليات",
          "ai-automation": "الكل / المساعدات / الأتمتة / التكاملات",
        };
        section = section
          .replace(/<h2>[\s\S]*?<\/h2>/, `<h2>${headings[slug]}</h2>`)
          .replace(
            /(<div class="ds-filters">)[\s\S]*?(<\/div>)/,
            `$1${filters[slug]}$2`,
          )
          .replaceAll("Hire me", "لنتعاون");
      } else section = section.replaceAll("Hire me", "Let's collaborate");
      const style = `<style data-illustrative-art>.work-art{position:relative!important;padding:0!important;background:transparent!important;overflow:visible}.work-art *{box-sizing:border-box;border-radius:0!important}.work-photo{position:absolute;inset:7% 5% 15% 7%;display:block}.work-photo img{width:100%;height:100%;object-fit:cover}.work-technical{width:100%;height:100%;object-fit:fill}.work-popup{position:absolute;bottom:3%;inset-inline-end:1%;width:66%;padding:13px;background:rgba(255,255,255,.95);box-shadow:0 14px 25px #13244125;color:#17283b;text-align:start;z-index:2}.work-popup small{font-size:9px!important;letter-spacing:0!important;display:block;color:#566c7a}.work-popup b{font-size:13px;line-height:1.45;display:block;margin-top:5px}.work-check{position:absolute;top:0;inset-inline-start:0;background:#fff;color:#179b66;padding:11px 15px;box-shadow:0 10px 25px #142b4626;z-index:2;font-size:24px}.work-mini-chart{display:flex;align-items:end;gap:6px;height:25px;margin-top:8px}.work-mini-chart i{width:13%;background:#35b99a;height:30%}.work-mini-chart i:nth-child(2){height:45%}.work-mini-chart i:nth-child(3){height:40%}.work-mini-chart i:nth-child(4){height:70%}.work-mini-chart i:nth-child(5){height:95%}.work-digital-marketing .work-mini-chart i{background:#ed6a44}.work-web-mobile-apps .work-mini-chart i{background:#3889d6}.work-ai-automation .work-mini-chart i{background:#9b64ce}@media(max-width:800px){.work-popup{padding:7px;width:76%}.work-popup b{font-size:10px}.work-popup small{font-size:7px!important}.work-mini-chart{height:15px;margin-top:5px}.work-check{font-size:15px;padding:5px 8px}}</style>`;
      return (
        style +
        section.replace("<section ", '<section data-illustrative-work="true" ')
      );
    },
  );
}
