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
for (const slug of ["seo-geo", "brand-design", "ai-automation"]) {
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
    const file = slug + "-" + locale + ".html";
    await fs.writeFile(path.join(root, file), html);
    links.push(
      `<a href="${file}#ds-works">${slug} · ${locale === "ar" ? "العربية" : "English"}</a>`,
    );
  }
}
await fs.writeFile(
  path.join(root, "index.html"),
  `<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><title>CODEYEA | النماذج التطبيقية</title><style>body{font:18px Arial;padding:40px;color:#18243a}nav{display:grid;grid-template-columns:repeat(2,1fr);gap:15px}a{display:block;padding:22px;border:1px solid #dce3e9;color:#173859;text-decoration:none;border-radius:0}p{line-height:1.8}</style><h1>النماذج التطبيقية داخل الصفحات</h1><p>مراجعة صور SEO والبراند وAI داخل صفحاتها بالعربية والإنجليزية. صور الخدمات الأخرى بانتظار توجيه صاحب الموقع.</p><nav>${links.join("")}</nav></html>`,
);
await fs.writeFile("docs/REVIEW_ARABIC_COPY_GAPS.json", JSON.stringify([...new Set(missingArabic)],null,2));
console.log({pages:links.length,missingArabic:missingArabic.length});
