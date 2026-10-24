import assert from "node:assert/strict";
import { test } from "node:test";
import { readFile } from "node:fs/promises";
import { Script } from "node:vm";
import { hostingServerFeatureArtwork, hostingServerFeatures } from "../src/content/hosting-server-features";
import { integrateHostingServerFeatures } from "../src/server/hosting-server-features-render";
import { extractFields, renderDocument, templateContent } from "../src/server/site-documents";
import { defaultHostingServerFeatures } from "../src/schemas/hosting-server-features";
import { pageAdditionsSchema, resolvePageAdditions } from "../src/schemas/page-additions";

const slugs = ["website-hosting", "wordpress-hosting", "cloud-hosting", "email-hosting"];

test("all hosting pages keep the six features before their existing FAQ in both languages", async () => {
  for (const slug of slugs) {
    const source = await templateContent(slug);
    for (const locale of ["en", "ar"] as const) {
      const html = await renderDocument(slug, { fields: extractFields(source), description: "Hosting." }, locale, "Hosting", { public: true });
      assert.equal((html.match(/id="server-specifications"/g) || []).length, 1, `${slug}/${locale}`);
      const section = html.match(/<section id="server-specifications"[\s\S]*?<\/section>/)?.[0];
      assert.ok(section, `${slug}/${locale}`);
      assert.equal((section.match(/class="cy-spec-slide"/g) || []).length, 6);
      assert.ok(section.includes(`dir="${locale === "ar" ? "rtl" : "ltr"}"`));
      assert.ok(section.includes(" / 6"));
      assert.ok(section.includes('href="#hosting-plans"'));
      for (const feature of hostingServerFeatures[locale].slides) {
        assert.ok(section.includes(`data-feature="${feature.id}"`));
        assert.ok(section.includes(feature.title));
        assert.ok(section.includes(`/site/server-features/${hostingServerFeatureArtwork[feature.id].file}`));
      }
      assert.ok(!/testimonial|customer stories|sample logo/i.test(section));
      const after = html.slice(html.indexOf(section) + section.length);
      assert.match(after, /^<section\b[^>]*\bv-faq\b/);
      assert.equal(integrateHostingServerFeatures(html, slug, locale), html, "Repeated rendering must not duplicate the section or its assets");
    }
  }
});

test("the hosting feature addition leaves service pages and missing insertion points intact", () => {
  const html = '<html><head></head><body><section class="v-faq">FAQ</section></body></html>';
  assert.equal(integrateHostingServerFeatures(html, "ai-automation", "en"), html);
  assert.equal(integrateHostingServerFeatures("<main>Owner content</main>", "website-hosting", "ar"), "<main>Owner content</main>");
});

test("feature interactions parse and the owner logos and email icons are available", async () => {
  const script = await readFile("public/site/hosting-server-features.js", "utf8");
  assert.doesNotThrow(() => new Script(script));
  for (const slide of hostingServerFeatures.en.slides) {
    const file = hostingServerFeatureArtwork[slide.id].file;
    const bytes = await readFile(`public/site/server-features/${file}`);
    if (file.endsWith(".svg")) {
      const icon = bytes.toString("utf8");
      assert.match(icon, /<svg\b/);
      assert.ok(!icon.includes("<script"));
      assert.doesNotMatch(icon, /(?:href|src)=["']https?:/);
    } else {
      assert.equal(bytes.toString("ascii", 0, 4), "RIFF");
      assert.equal(bytes.toString("ascii", 8, 12), "WEBP");
    }
  }
});

test("CMS feature copy survives validation and appears in preview and public documents", async () => {
  const source = await templateContent("website-hosting");
  for (const locale of ["en", "ar"]) {
    const value = defaultHostingServerFeatures(locale);
    value.heading = locale === "ar" ? "مواصفات محفوظة من اللوحة" : "Saved CMS server features";
    value.slides[0].body = 'Edited CMS text <script>alert("x")</script>';
    const additions = pageAdditionsSchema.parse(JSON.parse(JSON.stringify({ serverFeatures: value })));
    assert.deepEqual(resolvePageAdditions("website-hosting", additions, locale).serverFeatures, value);
    for (const publicPage of [false, true]) {
      const html = await renderDocument("website-hosting", { fields: extractFields(source), description: "Hosting", additions }, locale, "Hosting", { public: publicPage });
      assert.ok(html.includes(value.heading));
      assert.ok(html.includes('Edited CMS text &lt;script&gt;'));
      assert.ok(!html.includes(value.slides[0].body));
    }
  }
});

test("CMS visibility and six distinct feature identities are retained", () => {
  const value = defaultHostingServerFeatures("en");
  value.enabled = false;
  const html = integrateHostingServerFeatures('<head></head><body><section class="v-faq">FAQ</section></body>', "website-hosting", "en", value);
  assert.ok(!html.includes('id="server-specifications"'));
  value.slides[1].id = value.slides[0].id;
  assert.equal(pageAdditionsSchema.safeParse({ serverFeatures: value }).success, false);
});
