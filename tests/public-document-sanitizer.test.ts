import assert from "node:assert/strict";
import { test } from "node:test";
import { sanitizeUnapprovedPublicContent, templateContent } from "../src/server/site-documents";

test("public service templates omit draft portfolio/story placeholders without orphaning their scripts", async () => {
  const source = await templateContent("web-mobile-apps");
  const html = sanitizeUnapprovedPublicContent(source, "/contact/");

  assert.doesNotMatch(html, /Approved project material pending|Project content pending/i);
  assert.doesNotMatch(html, /class="[^"]*\bds-works\b/i);
  assert.doesNotMatch(html, /class="[^"]*\bai-stories\b/i);
  assert.doesNotMatch(html, /function (?:storiesMotion|worksMotion)\(\)/);
  assert.match(html, /alt=""/);
  assert.match(html, /href="\/contact\/#contact-form"/);
});
