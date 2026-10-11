import { assertTestEnvironment } from "../scripts/test-environment";
assertTestEnvironment();
import { test } from "node:test";
import assert from "node:assert/strict";
import { localizedHref } from "../src/content/arabic-navigation";
import { languageSwitchAllowed } from "../src/content/site-language";
import {
  pageAdditionsDefaults,
  pageAdditionsSchema,
} from "../src/schemas/page-additions";
import { renderPageAdditions } from "../src/server/page-additions-render";
import { localizeDocument } from "../src/server/arabic-initialize";
import { documentSlugs } from "../src/content/site-routes";
import {
  templateContent,
  templatePageDraft,
  bindDocumentControls,
} from "../src/server/site-documents";

test("Arabic destinations are idempotent and retain preview query and section fragments", () => {
  for (const href of [
    "/",
    "/ar/",
    "/ar",
    "/services/",
    "/preview/ar/industries/legal",
    "/preview/pages/contact?locale=ar#contact-form",
    "/preview/pages/contact#contact-form",
    "/api/site-assets/logo",
  ]) {
    const localized = localizedHref(href);
    assert.equal(localizedHref(localized), localized);
  }
  assert.equal(
    localizedHref("/preview/pages/contact#contact-form"),
    "/preview/pages/contact?locale=ar#contact-form",
  );
  assert.equal(
    localizedHref("/preview/industries/legal"),
    "/preview/ar/industries/legal",
  );
  assert.equal(
    localizedHref("https://hosting.codeyea.com/login"),
    "https://hosting.codeyea.com/login",
  );
});
test("country rules hide the switch in Europe and the Americas and fail closed without location", () => {
  for (const country of [
    "US",
    "CA",
    "BR",
    "MX",
    "GB",
    "DE",
    "FR",
    "TR",
    null,
    "",
    "unknown",
  ])
    assert.equal(languageSwitchAllowed(country), false);
  for (const country of ["IQ", "AE", "SA", "EG"])
    assert.equal(languageSwitchAllowed(country), true);
});
test("CMS additions reject executable URLs and apply the actual email annual discount", () => {
  const defaults = pageAdditionsDefaults("email-hosting");
  assert.equal(defaults.discount?.percent, 10);
  assert.equal(
    pageAdditionsSchema.safeParse({
      ...defaults,
      support: { ...defaults.support, href: "javascript:alert(1)" },
    }).success,
    false,
  );
  const html =
    '<div class="hp-billing-wrap"></div><script>const config={"slider":{"annualDiscount":0}}</script><section class="v-faq">';
  const rendered = renderPageAdditions(html, "email-hosting", undefined, false);
  assert.match(rendered, /Save 10%/);
  assert.match(rendered, /"annualDiscount":0.1/);
  assert.match(rendered, /hosting-technical-support/);
  const seo = pageAdditionsDefaults("seo-geo");
  seo.search!.heading = "<script>bad</script>";
  const ar = renderPageAdditions(
    '<section class="ai-faq">',
    "seo-geo",
    seo,
    true,
    "ar",
  );
  assert.match(ar, /&lt;script&gt;bad&lt;\/script&gt;/);
  assert.match(ar, /contact\?locale=ar#contact-form/);
});
test("all fourteen Arabic templates preserve the complete CMS control identities and layout", async () => {
  for (const slug of documentSlugs) {
    const html = await templateContent(slug);
    const source = await bindDocumentControls(
      slug,
      html,
      templatePageDraft(slug, html).content,
    );
    const original = JSON.stringify(source);
    const ar = localizeDocument(source, slug);
    assert.equal(
      JSON.stringify(source),
      original,
      "English content mutated: " + slug,
    );
    assert.deepEqual(
      ar.fields.map((f) => f.key),
      source.fields.map((f) => f.key),
    );
    assert.deepEqual(ar.controls?.sections, source.controls?.sections);
    assert.deepEqual(
      ar.images?.map((i) => [i.key, i.mediaId]),
      source.images?.map((i) => [i.key, i.mediaId]),
    );
    assert.equal(ar.templateHash, source.templateHash);
    assert.equal(ar.seo?.canonicalPath, `/ar/${slug}/`);
    assert.equal(ar.seo?.index, false);
    assert.match(ar.seo!.description, /[\u0600-\u06ff]/);
  }
});
