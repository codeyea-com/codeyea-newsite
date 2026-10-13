import fs from "node:fs/promises";
import path from "node:path";
import { illustrativeWork } from "../src/content/illustrative-work";
import {
  renderDocument,
  templateContent,
  templatePageDraft,
} from "../src/server/site-documents";
import { arabicText } from "../src/content/arabic-localization";
const root = "docs/section-imagery-preview/application-concepts";
await fs.mkdir(root, { recursive: true });
const origin = "http://127.0.0.1:3014";
const missingArabic: string[] = [];
const links: string[] = [];
for (const slug of ["seo-geo", "brand-design", "ai-automation", "website-design", "digital-marketing", "ecommerce", "web-mobile-apps", "technical-support", "website-hosting", "wordpress-hosting", "cloud-hosting", "email-hosting", "domains"]) {
  const source = await templateContent(slug),
    draft = templatePageDraft(slug, source);
  for (const locale of ["en", "ar"]) {
    const content = structuredClone(draft.content);
    if (locale === "ar")
      content.fields = content.fields.map((f) => {
        try {
          return { ...f, value: arabicText(f.value) };
        } catch {
          missingArabic.push(f.value);
          return f;
        }
      });
    let html = await renderDocument(slug, content, locale, draft.title, {
      public: true,
    });
    html = html.replaceAll("/site/generated/", origin + "/site/generated/");
    html = html
      .replace(
        /(src|href)="\/(?!\/)([^"]*)"/g,
        '$1="http://127.0.0.1:3014/$2"',
      )
      .replace(
        /url\(["']?\/(?!\/)([^)'"\s]+)["']?\)/g,
        "url(http://127.0.0.1:3014/$1)",
      );
    // Integrated hero scripts insert root-relative images after this static export.
    // Resolve those images against the local app, just like the exported markup.
    html = html.replace('</head>', `<script>(function(){function fix(){document.querySelectorAll('img[src^="/homepage/"],img[src^="/site/"],img[src^="/brand/"],img[src^="/api/site-assets/"]').forEach(function(img){img.src='${origin}'+img.getAttribute('src')})}new MutationObserver(fix).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});document.addEventListener('DOMContentLoaded',fix)})();</script></head>`);
    const file = slug + "-" + locale + ".html";
    await fs.writeFile(path.join(root, file), html);
    links.push(
      `<a href="${file}">${slug} · ${locale === "ar" ? "العربية" : "English"}</a>`,
    );
  }
}
await fs.writeFile(
  path.join(root, "index.html"),
  `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>CODEYEA | مراجعة صور الخدمات</title><style>body{font:18px Arial;padding:40px;color:#18243a}nav{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}a{display:block;padding:22px;border:1px solid #dce3e9;color:#173859;text-decoration:none;border-radius:0}p{line-height:1.8}</style><h1>مراجعة صور الخدمات داخل صفحاتها</h1><p>معاينة خاصة للصفحات بالعربية والإنجليزية. تشمل تصميم المواقع والبراند وSEO وAI، والتسويق الرقمي والتجارة الإلكترونية والتطبيقات والدعم التقني وصفحات الاستضافات والدومينات.</p><nav>${links.join("")}</nav></html>`,
);
await fs.writeFile("docs/REVIEW_ARABIC_COPY_GAPS.json", JSON.stringify([...new Set(missingArabic)],null,2));
console.log({pages:links.length,missingArabic:missingArabic.length});
