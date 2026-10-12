import assert from "node:assert/strict";
import { test } from "node:test";
import {
  renderDocument,
  sanitizeUnapprovedPublicContent,
  templateContent,
  templatePageDraft,
} from "../src/server/site-documents";

test("public service templates omit draft portfolio/story placeholders without orphaning their scripts", async () => {
  const source = await templateContent("web-mobile-apps");
  const html = sanitizeUnapprovedPublicContent(source, "/contact/");

  assert.doesNotMatch(
    html,
    /Approved project material pending|Project content pending/i,
  );
  assert.doesNotMatch(html, /class="[^"]*\bds-works\b/i);
  assert.doesNotMatch(html, /class="[^"]*\bai-stories\b/i);
  assert.doesNotMatch(html, /function (?:storiesMotion|worksMotion)\(\)/);
  assert.match(html, /alt=""/);
  assert.match(html, /class="hp-footer-v2-form"/);
  assert.match(html, /<main\b[\s\S]*<\/main>/);
});

test("public document rendering preserves the page when removing draft story scripts", async () => {
  const source = await templateContent("web-mobile-apps");
  const draft = templatePageDraft("web-mobile-apps", source);
  const html = await renderDocument(
    "web-mobile-apps",
    draft.content,
    "en",
    draft.title,
    { public: true },
  );

  assert.match(html, /<main\b[^>]*id="main"/);
  assert.match(html, /Web &amp; Mobile Apps/);
  assert.match(html, /internal-hero-media/);
  assert.match(html, /<\/main>/);
  assert.doesNotMatch(
    html,
    /Approved project material pending|Project content pending/i,
  );
});

test("illustrative work is bilingual and does not replace technical support pricing", async () => {
  for (const locale of ["en", "ar"]) {
    const source = await templateContent("seo-geo");
    const draft = templatePageDraft("seo-geo", source);
    const html = await renderDocument(
      "seo-geo",
      draft.content,
      locale,
      draft.title,
      { public: true },
    );
    assert.match(html, /data-illustrative-work="true"/);
    assert.match(
      html,
      locale === "ar" ? /نماذج تطبيقية/ : /Application concepts/,
    );
    assert.match(
      html,
      locale === "ar"
        ? /من البحث إلى استفسار واضح/
        : /A clearer route from search to enquiry/,
    );
    assert.doesNotMatch(
      html,
      /OWNER-APPROVED PROJECT|Project content pending|محتوى المشروع قيد التجهيز/,
    );
    assert.equal(
      (html.match(/class="ds-placeholder work-art/g) || []).length,
      6,
    );
    assert.match(html, /project-1-(?:en|ar)-mobile\.svg/);
  }
  const source = await templateContent("technical-support");
  const draft = templatePageDraft("technical-support", source);
  const html = await renderDocument(
    "technical-support",
    draft.content,
    "en",
    draft.title,
    { public: true },
  );
  assert.match(html, /id="care-essential"/);
  assert.doesNotMatch(html, /data-illustrative-work="true"/);
});
