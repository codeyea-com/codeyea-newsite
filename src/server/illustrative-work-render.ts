import { illustrativeWork } from "../content/illustrative-work";
const escape = (s: string) =>
  s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
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
          const contextual = ['seo-geo', 'ai-automation'].includes(slug);
          const stem = c.visual === 'technical' && contextual ? 'work-' + i + '-context' : 'photo-' + i;
          const extension = contextual ? 'webp' : 'png';
          const art = c.visual === 'photo' || contextual
            ? `<picture class="work-clean-photo"><source media="(max-width:1199px)" srcset="/site/generated/${slug}/${stem}-mobile.${extension}"><img src="/site/generated/${slug}/${stem}-desktop.${extension}" alt="${escape(title)}" loading="lazy" decoding="async"></picture>`
            : `<picture style="display:contents"><source media="(max-width:1199px)" srcset="/site/generated/${slug}/project-${i}-${locale}-mobile.svg"><img class="work-technical" src="/site/generated/${slug}/project-${i}-${locale}.svg" alt="${escape(title)}" loading="lazy"></picture>`;
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
      const style = '<style data-illustrative-art>.work-art{position:relative!important;padding:0!important;background:transparent!important;overflow:hidden}.work-art *{box-sizing:border-box;border-radius:0!important}.work-clean-photo{display:block;width:100%;height:100%}.work-clean-photo img,.work-technical{display:block;width:100%;height:100%;object-fit:cover;box-shadow:none!important}</style>';
      return (
        style +
        section.replace("<section ", '<section data-illustrative-work="true" ')
      );
    },
  );
}
