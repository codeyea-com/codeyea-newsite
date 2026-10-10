import test from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import {
  approvedTemplates,
  templateContent,
} from "../src/server/site-documents";
import { templateControlsSchema } from "../src/schemas/template-controls";
import {
  templateControlManifest,
  bindControls,
  applyTemplateControls,
  extractArtworkText,
  applyArtworkControls,
  applyAssetControls,
} from "../src/server/template-controls";
import { blogMetadataSchema, blogPostPath } from "../src/schemas/blog";

test("all fourteen templates expose schema-valid sections, links, assets and artwork controls", async () => {
  for (const [slug, template] of Object.entries(approvedTemplates)) {
    const controls = await templateControlManifest(
      await templateContent(slug),
      template,
    );
    const result = templateControlsSchema.safeParse(controls);
    assert.ok(
      result.success,
      slug + ": " + JSON.stringify(result.error?.issues),
    );
    assert.ok(controls.sections.length > 0, slug);
  }
});
test("controls preserve source identities and reject scripts in links", async () => {
  const manifest = await templateControlManifest(
    '<main><section><h1>Hero</h1><a href="/contact/">Contact</a><img src="cover.jpg"></section></main>',
    "contact-review/contact-interactive.html",
  );
  const changed = structuredClone(manifest);
  changed.assets[0].source = "https://attacker.invalid/a.jpg";
  assert.throws(() => bindControls(manifest, changed));
  changed.assets[0].source = manifest.assets[0].source;
  changed.links[0].href = "javascript:alert(1)";
  assert.equal(templateControlsSchema.safeParse(changed).success, false);
});
test("visibility and destinations change independently without changing page composition", async () => {
  const html =
    '<main><section><h1>First</h1><a href="/contact/">Talk</a></section><section><h2>Second</h2></section></main>';
  const controls = await templateControlManifest(
    html,
    "contact-review/contact-interactive.html",
  );
  controls.sections[1].enabled = false;
  controls.links[0].href = "/services/";
  const result = applyTemplateControls(html, controls);
  assert.match(result, /<section hidden data-cms-hidden="true"><h2>Second/);
  assert.match(result, /href="\/services\/">Talk/);
  assert.equal((result.match(/<section/g) || []).length, 2);
});
test("generated artwork copy remains inert JavaScript and duplicate labels are edited independently", () => {
  const source = "const html='<b>Same</b><b>Same</b>'; const compare=5>2&&2<3;";
  const items = extractArtworkText(source, "hero.js");
  assert.equal(items.length, 2);
  const controls = {
    sections: [],
    links: [],
    assets: [],
    artworkText: items.map(({ raw, offset, ...entry }) => entry),
  };
  controls.artworkText[1].value =
    "Owner's ${alert(1)} `text` \\ newline\n<script>";
  const result = applyArtworkControls(source, "hero.js", controls);
  assert.match(result, /<b>Same<\/b>/);
  assert.match(result, /Owner&#39;s/);
  assert.doesNotThrow(() => new Script(result));
  assert.ok(result.includes("const compare=5>2&&2<3"));
});
test("generated images can use the library without a new external image request", () => {
  const result = applyAssetControls('img.src="/old.jpg";', {
    sections: [],
    links: [],
    artworkText: [],
    assets: [
      {
        key: "asset-0",
        label: "Hero",
        source: "/old.jpg",
        mediaId: "media_12345678-1234-1234-1234-123456789abc",
      },
    ],
  });
  assert.match(result, /\/asset\/media_/);
});
test("future articles have independent locale paths and validated editorial metadata", () => {
  assert.equal(blogPostPath("agency-news"), "/blog/agency-news/");
  assert.equal(blogPostPath("agency-news", "ar"), "/ar/blog/agency-news/");
  assert.equal(blogPostPath("../contact"), null);
  assert.equal(
    blogMetadataSchema.safeParse({
      author: "Editor",
      excerpt: "Article summary",
      categories: ["News", "News"],
    }).success,
    false,
  );
  assert.equal(blogMetadataSchema.parse({}).author, "");
  assert.equal(
    blogMetadataSchema.safeParse({
      coverImage: { mediaId: "evil", alt: "Cover", decorative: false },
    }).success,
    false,
  );
});

test("responsive artwork variants and srcset obey the same image replacement", () => {
  const src =
    "/api/site-assets/web-mobile-apps-review/assets/menu-grain-420.jpg";
  const controls = {
    sections: [],
    links: [],
    artworkText: [],
    assets: [
      {
        key: "asset-0",
        label: "Bowl",
        source: src,
        mediaId: "media_12345678-1234-1234-1234-123456789abc",
        alt: "Owner image",
        decorative: false,
      },
    ],
  };
  const html =
    '<img src="' +
    src +
    '" srcset="' +
    src +
    ' 420w" alt="Old"><img src="' +
    src.replace("420", "720") +
    '">';
  const result = applyAssetControls(html, controls);
  assert.equal((result.match(/\/asset\/media_/g) || []).length, 2);
  assert.ok(!result.includes("srcset"));
  assert.equal((result.match(/alt="Owner image"/g) || []).length, 2);
});
test("interactive Web Apps product copy and prices are editable without executable code", async () => {
  const fs = await import("node:fs/promises");
  const source = await fs.readFile(
      "site-templates/web-mobile-apps-review/web-mobile-apps-hero-concept-site.js",
      "utf8",
    ),
    id = "web-mobile-apps-review/web-mobile-apps-hero-concept-site.js";
  const controls = {
    sections: [],
    links: [],
    assets: [],
    artworkText: extractArtworkText(source, id).map(
      ({ key, label, value }) => ({ key, label, value }),
    ),
  };
  const product = controls.artworkText.find(
      (item) => item.label === "grain name",
    )!,
    price = controls.artworkText.find((item) => item.label === "grain price")!;
  assert.ok(product);
  product.value = "Owner's <img src=x onerror=alert(1)> bowl";
  price.value = "21.50";
  const result = applyArtworkControls(source, id, controls);
  assert.doesNotThrow(() => new Script(result));
  assert.ok(result.includes("21.5"));
  assert.ok(result.includes("String(x.name).replace"));
  assert.ok(result.includes("\\u003cimg"));
  price.value = "alert(1)";
  assert.equal(templateControlsSchema.safeParse(controls).success, false);
});
