import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  approvedTemplates,
  extractFields,
  isPublicTemplateAsset,
  rewriteTemplateAssetCode,
  renderDocument,
} from "../src/server/site-documents";

const concepts: Record<string, string> = {
  "website-design": "website-design-review/website-design-hero",
  "brand-design": "brand-design-review/brand-design-hero-concept",
  ecommerce: "ecommerce-review/ecommerce-hero-concept",
  "seo-geo": "seo-geo-review/seo-geo-hero-concept",
  "digital-marketing": "digital-marketing-review/digital-marketing-hero-concept",
  "web-mobile-apps": "web-mobile-apps-review/web-mobile-apps-hero-concept",
  "ai-automation": "digital-service-template-preview/ai-automation-hero-concept",
  "technical-support": "technical-support-review/technical-support-hero-concept",
  domains: "domain-review/domain-galaxy-concept",
  "website-hosting": "hosting-visual-review/website-hosting-hero-concept",
  "wordpress-hosting": "hosting-visual-review/wordpress-hosting-hero-concept",
  "cloud-hosting": "hosting-visual-review/cloud-hosting-hero-concept",
  "email-hosting": "email-hosting-review/email-hosting-hero-concept",
};

test("every approved service template loads its new hero without replacing page sections", async () => {
  for (const [slug, relative] of Object.entries(approvedTemplates)) {
    const concept = concepts[slug];
    if (!concept) continue;
    const html = await fs.readFile(path.join(process.cwd(), "docs", relative), "utf8");
    assert.match(html, new RegExp(`data-integrated-hero[^>]+${path.posix.basename(concept)}\\.css`), slug);
    assert.match(html, new RegExp(`data-integrated-hero[^>]+${path.posix.basename(concept)}-site\\.js`), slug);
    assert.match(html, /<header\b/, `${slug}: keep the page header`);
    assert.match(html, /<footer\b/, `${slug}: keep the page footer`);
    const main = html.match(/<main\b[\s\S]*?<\/main>/)?.[0];
    assert.ok(main, `${slug}: keep the original page content`);
    assert.ok(main.length > 1000, `${slug}: preserve existing sections`);
    const rendered = await renderDocument(
      slug,
      { fields: extractFields(html), description: "An approved service page." },
      "en",
    );
    const assetPath = `/api/site-assets/${concept}.css`;
    assert.ok(rendered.includes(assetPath), `${slug}: serve hero styles in CMS preview`);
    assert.ok(
      rendered.includes(`/api/site-assets/${concept}-site.js`),
      `${slug}: serve the integrated hero in CMS preview`,
    );
    const publicRendered = await renderDocument(
      slug,
      { fields: extractFields(html), description: "An approved service page." },
      "en",
      undefined,
      { public: true },
    );
    assert.ok(publicRendered.includes("surface=public"), `${slug}: public hero assets use public routes`);
  }
  assert.equal(Object.keys(concepts).length, 13);
});

test("site hero scripts do not hide the existing header, footer or page sections", async () => {
  for (const concept of Object.values(concepts)) {
    const script = await fs.readFile(path.join(process.cwd(), "docs", `${concept}-site.js`), "utf8");
    assert.doesNotMatch(script, /style\.display\s*=\s*['"]none['"]/);
    assert.doesNotMatch(script, /parentElement\.children\.forEach/);
  }
  const websiteScript = await fs.readFile(
    path.join(process.cwd(), "docs", `${concepts["website-design"]}-site.js`),
    "utf8",
  );
  assert.match(websiteScript, /source\.innerHTML/);
  assert.match(websiteScript, /sourceCta\.href/);
});

test("runtime assets remain public for templates that public routes can render", () => {
  assert.equal(isPublicTemplateAsset("seo-geo-review/seo-geo-hero-concept.css"), true);
  assert.equal(isPublicTemplateAsset("digital-service-template-preview/ai-automation-hero-concept-site.js"), true);
  assert.equal(isPublicTemplateAsset("shared-navigation/hosting-menu.js"), true);
  assert.equal(isPublicTemplateAsset("unapproved-template/private.js"), false);
});

test("public template scripts resolve links to public routes instead of preview routes", () => {
  const result = rewriteTemplateAssetCode(
    "shared-navigation/hosting-menu.js",
    "'../seo-geo-review/seo-geo-interactive.html'; '/preview/services'; 'assets/menu.webp'",
    "public",
  );
  assert.ok(result.includes("/seo-geo/"));
  assert.ok(result.includes("/services/"));
  assert.ok(result.includes("/api/site-assets/shared-navigation/assets/menu.webp"));
  assert.ok(!result.includes("/preview/"));
});
