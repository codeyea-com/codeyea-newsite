import assert from "node:assert/strict";
import { test } from "node:test";
import { renderDocument, sanitizeUnapprovedPublicContent, templateContent, templatePageDraft } from "../src/server/site-documents";

test("public service templates omit draft portfolio/story placeholders without orphaning their scripts", async () => {
  const source = await templateContent("web-mobile-apps");
  const html = sanitizeUnapprovedPublicContent(source, "/contact/");

  assert.doesNotMatch(html, /Approved project material pending|Project content pending/i);
  assert.doesNotMatch(html, /class="[^"]*\bds-works\b/i);
  assert.doesNotMatch(html, /class="[^"]*\bai-stories\b/i);
  assert.doesNotMatch(html, /function (?:storiesMotion|worksMotion)\(\)/);
  assert.match(html, /alt=""/);
  assert.match(html, /href="\/contact\/#contact-form"/);
  assert.match(html, /<main\b[\s\S]*<\/main>/);
});

test("public document rendering preserves the page when removing draft story scripts", async () => {
  const source = await templateContent("web-mobile-apps");
  const draft = templatePageDraft("web-mobile-apps", source);
  const html = await renderDocument("web-mobile-apps", draft.content, "en", draft.title, { public: true });

  assert.match(html, /<main\b[^>]*id="main"/);
  assert.match(html, /Web &amp; Mobile Apps/);
  assert.match(html, /internal-hero-media/);
  assert.match(html, /<\/main>/);
  assert.doesNotMatch(html, /Approved project material pending|Project content pending/i);
});
