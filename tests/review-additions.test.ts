import { test } from "node:test";
import assert from "node:assert/strict";
import {
  pageAdditionsSchema,
  resolvePageAdditions,
} from "../src/schemas/page-additions";
import { renderReviewAdditions } from "../src/server/review-additions-render";

const page =
  '<main><section class="b-work">' +
  Array.from(
    { length: 5 },
    () =>
      '<figure><img src="/example.webp"><figcaption><h3>Existing title</h3></figcaption></figure>',
  ).join("") +
  '</section><section class="b-contact"><h2>CTA</h2></section></main>';

test("each five-image placement has localized editable copy and preserves its existing cards", () => {
  for (const slug of ["website-design", "brand-design", "ecommerce"])
    for (const locale of ["ar", "en"]) {
      const data = pageAdditionsSchema.parse(
        resolvePageAdditions(slug, undefined, locale),
      );
      assert.equal(data.galleryCaptions?.length, 5);
      assert.equal(
        /\p{Script=Arabic}/u.test(data.galleryCaptions![0].body),
        locale === "ar",
      );
      const html = renderReviewAdditions(page, slug, locale, data);
      assert.equal((html.match(/data-photo-description=/g) || []).length, 5);
      assert.equal((html.match(/<h3>Existing title<\/h3>/g) || []).length, 5);
    }
});

test("CMS overrides round-trip through validation and cannot break popup attributes", () => {
  const edited = resolvePageAdditions("website-design", undefined, "ar");
  edited.galleryCaptions![0] = {
    title: "اسم مخصص",
    body: 'شرح "مخصص" <img src=x onerror=alert(1)>',
  };
  const saved = pageAdditionsSchema.parse(JSON.parse(JSON.stringify(edited)));
  const html = renderReviewAdditions(page, "website-design", "ar", saved);
  assert.ok(html.includes('data-photo-title="اسم مخصص"'));
  assert.ok(html.includes("&quot;مخصص&quot; &lt;img"));
  assert.equal(html.includes("<img src=x"), false);
});

test("Brand FAQ follows its CMS visibility setting and precedes the final CTA", () => {
  for (const locale of ["ar", "en"]) {
    const data = resolvePageAdditions("brand-design", undefined, locale);
    const html = renderReviewAdditions(page, "brand-design", locale, data);
    assert.equal((html.match(/<summary/g) || []).length, 6);
    assert.ok(
      html.indexOf("brand-design-faq") < html.indexOf('class="b-contact"'),
    );
    data.faq!.enabled = false;
    assert.equal(
      renderReviewAdditions(page, "brand-design", locale, data).includes(
        "brand-design-faq",
      ),
      false,
    );
  }
});
