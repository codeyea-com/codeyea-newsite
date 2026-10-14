import { test } from "node:test";
import assert from "node:assert/strict";
import sharp from "sharp";
import {
  conceptCaseStudies,
  conceptDisclosure,
} from "../src/content/concept-case-studies";
import {
  renderConceptCaseStudy,
  renderConceptCaseIndex,
} from "../src/server/concept-case-study-render";

test("all six scenarios retain five stages, three comparable outcomes and 36 distinct images", async () => {
  assert.equal(conceptCaseStudies.length, 6);
  const images = new Set<string>();
  for (const item of conceptCaseStudies) {
    for (const locale of ["en", "ar"] as const) {
      assert.equal(item[locale].stages.length, 5, item.slug);
      assert.equal(item[locale].metrics.length, 3, item.slug);
      assert.ok(item[locale].requirements.length >= 4);
      assert.ok(
        item[locale].stages.every(
          (stage) => stage.length === 2 && stage.every(Boolean),
        ),
      );
    }
    assert.equal(item.images.length, 6);
    for (const image of item.images) {
      assert.ok(!images.has(image.src), "a stage must not reuse another image");
      images.add(image.src);
      const meta = await sharp("public" + image.src).metadata();
      assert.ok(Math.abs(meta.width! / meta.height! - 4 / 3) < 0.02, image.src);
    }
  }
  assert.equal(images.size, 36);
  assert.deepEqual(
    conceptCaseStudies[0].en.metrics.map((m) => m.slice(1, 3)),
    [
      ["72", "128"],
      ["54%", "86%"],
      ["30", "16"],
    ],
  );
  assert.equal(conceptCaseStudies[3].en.metrics[2][2], "≈87 h");
});

test("each locale renders ordered stages, concept disclosures, localised navigation and the approved entrance motion", async () => {
  for (const item of conceptCaseStudies)
    for (const locale of ["en", "ar"] as const) {
      const html = await renderConceptCaseStudy(item, locale);
      assert.equal((html.match(/<h1\b/g) || []).length, 1);
      assert.ok(html.includes(conceptDisclosure[locale]));
      assert.ok(html.includes("noindex,nofollow"));
      assert.ok(
        !html.includes("application/ld+json"),
        "no service schema or invented client reviews",
      );
      assert.ok(html.includes("window.CODEYEA_LEADS_ENABLED=false"));
      assert.ok(html.includes("function commerceMotion()"));
      assert.ok(html.includes("duration:1300,delay:i*130"));
      assert.ok(
        !/function (activateBrand|referenceMotion|focusedSectionMotion)/.test(
          html,
        ),
      );
      let previous = html.indexOf('id="requirements"');
      for (const id of [
        "stage-1",
        "stage-2",
        "stage-3",
        "stage-4",
        "stage-5",
        "results",
      ]) {
        const position = html.indexOf(`id="${id}"`);
        assert.ok(position > previous, id);
        previous = position;
      }
      for (const image of item.images) assert.ok(html.includes(image.src));
      assert.ok(
        html.includes(`/${item.slug}?locale=${locale === "en" ? "ar" : "en"}`),
      );
      if (locale === "ar") {
        assert.ok(html.includes('dir="rtl"'));
        assert.ok(html.includes("أطلب التسعيرة المجانية الآن"));
        assert.ok(!html.includes("Have a project in mind?"));
      }
    }
});

test("private index links to all six scenarios in each locale", async () => {
  for (const locale of ["en", "ar"] as const) {
    const index = await renderConceptCaseIndex(locale);
    for (const item of conceptCaseStudies)
      assert.ok(
        index.includes(`/preview/case-studies/${item.slug}?locale=${locale}`),
      );
  }
});
