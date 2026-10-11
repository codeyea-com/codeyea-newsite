import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml } from "../src/server/site-documents";
test("CMS text treats pasted nonbreaking-space entities as spacing while escaping markup", () => {
  assert.equal(
    escapeHtml("تطبيقات الويب.&nbsp; تطبيقات الموبايل.&amp;nbsp; التكاملات."),
    "تطبيقات الويب.  تطبيقات الموبايل.  التكاملات.",
  );
  assert.equal(
    escapeHtml('<img src=x onerror="alert(1)">&nbsp;'),
    "&lt;img src=x onerror=&quot;alert(1)&quot;&gt; ",
  );
});
