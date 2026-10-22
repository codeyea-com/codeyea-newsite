import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  homepageCatalog,
  caseStudyHref,
} from "../src/content/homepage-catalog";
import {
  defaultHomepage,
  resolveHomepage,
} from "../src/content/homepage-defaults";
import { serviceCatalog } from "../src/content/service-catalog";
import { industrySlugs } from "../src/content/industry-registry";
import { generalArtwork } from "../src/content/generated-general-artwork";
import { conceptCaseStudies } from "../src/content/concept-case-studies";
import { caseStudyCards } from "../src/content/case-study-catalog";
import { caseIndexMain } from "../src/server/case-index";
import { homepageEditorSchema } from "../src/schemas/homepage-editor";
import { caseStudyResponse } from "../src/server/public-case-study";
import { localizedHref } from "../src/content/arabic-navigation";

test("Arabic case links retain their case-study handler in public and private previews", () => {
  assert.equal(
    localizedHref("/case-studies/atlas-supply/"),
    "/ar/case-studies/atlas-supply/",
  );
  assert.equal(
    localizedHref("/ar/case-studies/atlas-supply/", true),
    "/preview/case-studies/atlas-supply/?locale=ar",
  );
  assert.equal(
    localizedHref("/preview/case-studies?locale=en", true),
    "/preview/case-studies?locale=ar",
  );
});

test("homepage lists match the canonical services, industries and new images in both languages", () => {
  for (const locale of ["en", "ar"] as const) {
    const home = resolveHomepage(defaultHomepage(locale)),
      before = JSON.stringify(home);
    const catalog = homepageCatalog(locale, home.projects),
      prefix = locale === "ar" ? "/ar" : "";
    assert.deepEqual(
      catalog.services.map((s) => s.ctaHref).sort(),
      serviceCatalog.map((s) => `${prefix}/services/${s.slug}/`).sort(),
    );
    assert.deepEqual(
      catalog.industries.map((s) => s.href).sort(),
      industrySlugs.map((s) => `${prefix}/industries/${s}/`).sort(),
    );
    assert.equal(new Set(catalog.industries.map((s) => s.id)).size, 14);
    for (const industry of catalog.industries) {
      assert.equal(
        industry.image,
        generalArtwork(`industries/${industry.id}`)?.src,
      );
      assert.ok(fs.existsSync("public" + industry.image));
      assert.ok(industry.title && industry.body && industry.alt);
    }
    assert.equal(
      JSON.stringify(home),
      before,
      "rendering must not overwrite CMS content",
    );
  }
});

test("Iraq Home Expo leads the Homepage and directory, followed by the six concept cards", () => {
  for (const locale of ["en", "ar"] as const) {
    const home = resolveHomepage(defaultHomepage(locale)),
      catalog = homepageCatalog(locale, home.projects);
    const cards = caseStudyCards(locale);
    assert.equal(catalog.projects.length, 7);
    assert.equal(catalog.projects[0].id, "iraq-home-expo");
    assert.equal(cards[0].concept, false);
    assert.deepEqual(catalog.projects.map((item) => item.id), cards.map((item) => item.slug));
    assert.equal(catalog.projects[0].href, caseStudyHref(locale, "iraq-home-expo"));
    assert.ok(fs.existsSync("public" + catalog.projects[0].image));
    const directory = caseIndexMain(locale, {
      detail: (slug, language) => caseStudyHref(language, slug),
      index: (language) => caseStudyHref(language),
    });
    const directoryLinks = [...directory.matchAll(/class="case-index-link" href="([^"]+)"/g)].map((match) => match[1]);
    assert.deepEqual(directoryLinks, catalog.projects.map((item) => item.href));
    conceptCaseStudies.forEach((item, i) => {
      assert.equal(catalog.projects[i + 1].href, caseStudyHref(locale, item.slug));
      assert.equal(catalog.projects[i + 1].image, item.images[0].src);
      assert.equal(catalog.projects[i + 1].title, item[locale].name);
    });
    assert.equal(catalog.projectIntro.heading, home.projects.heading);
    assert.equal(catalog.projectIntro.eyebrow, home.projects.eyebrow);
    assert.match(
      String(catalog.projectIntro.disclosure),
      locale === "ar" ? /افتراضية/ : /concept/i,
    );
    assert.equal(catalog.projectIntro.ctaHref, caseStudyHref(locale));
    assert.ok(
      (home.projects.items as { approved?: boolean }[]).every(
        (item) => item.approved !== true,
      ),
    );
  }
});

test("homepage editor accepts the complete industry collection and legacy eight-card snapshots", () => {
  const home = resolveHomepage(defaultHomepage());
  assert.doesNotThrow(() => homepageEditorSchema.parse(home));
  const items = home.industries.items as Record<string, unknown>[];
  const full = industrySlugs.map((slug, i) => ({
    ...items[i % items.length],
    id: `industry-${slug}`,
    position: i,
  }));
  assert.doesNotThrow(() =>
    homepageEditorSchema.parse({
      ...home,
      industries: { ...home.industries, items: full },
    }),
  );
});

test("homepage case destinations render all twelve articles, correct locale links and unknown-slug 404", async () => {
  for (const locale of ["en", "ar"] as const) {
    for (const item of conceptCaseStudies) {
      const response = await caseStudyResponse([item.slug], locale);
      assert.equal(response.status, 200);
      assert.match(response.headers.get("X-Robots-Tag")!, /noindex/);
      const html = await response.text();
      assert.ok(html.includes(item[locale].title));
      assert.ok(html.includes(caseStudyHref(locale)));
    }
    assert.equal((await caseStudyResponse(["unknown"], locale)).status, 404);
    assert.equal(
      (await caseStudyResponse(["atlas-supply", "unknown"], locale)).status,
      404,
    );
  }
});
