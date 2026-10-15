import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  renderDocument,
  templateContent,
  templatePageDraft,
  bindDocumentControls,
  approvedTemplates,
} from "../src/server/site-documents";
import { arabicText } from "../src/content/arabic-localization";

const scenes: Record<string, string> = {
  "website-design": "hero-art",
  "brand-design": "brand-stage",
  ecommerce: "ecom-stage",
  "seo-geo": "seo-scene",
  "digital-marketing": "campaign-scene",
  "web-mobile-apps": "app-journey",
  "ai-automation": "automation-scene",
  "technical-support": "support-scene",
  "website-hosting": "hosting-scene",
  "wordpress-hosting": "wp-scene",
  "cloud-hosting": "cloud-scene",
  "email-hosting": "mail-scene",
  domains: "domain-cosmos",
};

for (const [slug, scene] of Object.entries(scenes)) {
  for (const locale of ["en", "ar"] as const) {
    test(`${slug} ${locale}: the response contains the new hero before any script runs`, async () => {
      const template = await templateContent(slug);
      const draft = templatePageDraft(slug, template);
      const content = structuredClone(draft.content);
      if (locale === "ar")
        content.fields = content.fields.map((field) => ({
          ...field,
          value: arabicText(field.value),
        }));
      for (const isPublic of [false, true]) {
        const html = await renderDocument(slug, content, locale, draft.title, {
          public: isPublic,
        });
        const main = html
          .match(/<main\b[\s\S]*?<\/main>/)![0]
          .replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, "");
        assert.equal(
          (main.match(new RegExp(`class="${scene}"`, "g")) ?? []).length,
          1,
          "exactly one ready scene",
        );
        assert.match(main, /data-hero-rendered="true"/);
        assert.doesNotMatch(
          html,
          /data-hero-upgrade-pending|visibility:hidden!important/,
          "no hide-then-reveal gate",
        );
        assert.doesNotMatch(
          main,
          /class="b-hero-images"|class="b-hero-shade"/,
          "retired slideshow absent",
        );
        assert.doesNotMatch(
          main,
          /class="internal-hero-media"[^>]*>\s*(?:<picture|<img)/,
          "retired photograph absent",
        );
        assert.doesNotMatch(
          main,
          /(?:src|href)="(?:\.\/|\.\.\/)?assets\//,
          "all new hero images are resolved",
        );
        assert.match(
          html,
          /<link\b[^>]*data-integrated-hero[^>]*>/,
          "hero stylesheet is render blocking in head",
        );
        assert.match(
          html,
          /<script\b[^>]*data-integrated-hero[^>]*>/,
          "original interactions still load",
        );
        assert.match(html, /<footer\b/, "page shell preserved");
      }
    });
  }
}

test("first-render artwork respects CMS text, images, CTA and section visibility", async () => {
  const slug = "website-design",
    template = await templateContent(slug);
  const content = await bindDocumentControls(
    slug,
    template,
    templatePageDraft(slug, template).content,
  );
  const heroSection = content.controls!.sections[0];
  heroSection.enabled = false;
  const cta = content.controls!.links.find((link) =>
    /Let.s build your website/.test(link.label),
  );
  assert.ok(cta);
  cta.href = "/contact/?source=hero-review";
  const image = content.controls!.assets.find((asset) =>
    asset.source.includes("hero-portrait-close-v2"),
  );
  assert.ok(image);
  image.alt = "Approved hero portrait";
  image.decorative = false;
  const artwork = content.controls!.artworkText.find(
    (item) => item.value === "CREATIVE THINKING",
  );
  assert.ok(artwork);
  artwork.value = "تفكير إبداعي";
  const html = await renderDocument(slug, content, "ar", undefined, {
    public: true,
  });
  const hero = html.match(
    /<section\b[^>]*data-hero-rendered="true"[\s\S]*?<\/section>/,
  )![0];
  assert.match(hero, /data-cms-hidden="true"/);
  assert.match(hero, /href="[^\"]*contact\/\?source=hero-review"/);
  assert.match(hero, /alt="Approved hero portrait"/);
  assert.match(hero, /تفكير إبداعي/);
});

test("the renderer covers every integrated hero, including future template changes", async () => {
  for (const [slug, relative] of Object.entries(approvedTemplates)) {
    const html = await fs.readFile(
      path.join("site-templates", relative),
      "utf8",
    );
    if (html.includes("data-integrated-hero"))
      assert.ok(scenes[slug], `Register first-paint coverage for ${slug}`);
  }
});
