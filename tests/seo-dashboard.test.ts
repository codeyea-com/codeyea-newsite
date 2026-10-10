import test from "node:test";
import assert from "node:assert/strict";
import { assessSeo, editorialText } from "../src/content/seo-assessment";
import { reportQuery, gscTable } from "../src/server/analytics-reports";
import { inspectionQuery } from "../src/server/seo-inspection";
test("SEO setup scores identify their actual failed checks and never claim a Google ranking", () => {
  const result = assessSeo(
    { title: "Agency", description: "Agency services", focusPhrase: "Agency" },
    "/services/",
    "Agency services",
  );
  assert.ok(result.score > 0 && result.score < 100);
  assert.ok(
    result.checks.find((c) => c.label === "Social sharing image is selected")
      ?.passed === false,
  );
  assert.equal(assessSeo(undefined, "/about/", "").contentScore, 0);
  const text = editorialText({
    heading: "Copy",
    mediaId: "secret",
    href: "/contact/",
    seo: { title: "Metadata" },
    sections: [{ body: "Actual body" }],
  });
  assert.match(text, /Actual body/);
  assert.doesNotMatch(text, /secret|Metadata|contact/);
});
test("page analytics filters reject cross-site URLs and preserve query/date history dimensions", () => {
  assert.equal(
    reportQuery.safeParse({ source: "gsc", path: "https://attacker.invalid" })
      .success,
    false,
  );
  assert.equal(
    reportQuery.parse({
      source: "gsc",
      group: "queryHistory",
      path: "/about/",
      previous: "true",
    }).previous,
    "true",
  );
  const report = gscTable(
    {
      rows: [
        {
          keys: ["agency", "2026-10-01"],
          clicks: 4,
          impressions: 50,
          ctr: 0.08,
          position: 6,
        },
      ],
    },
    ["query", "date"],
  );
  assert.equal(report.columns.length, report.rows[0].length);
  assert.equal(report.rows[0][1], "2026-10-01");
  assert.equal(inspectionQuery.safeParse({ path: "/admin/" }).success, false);
  assert.equal(
    inspectionQuery.safeParse({ path: "/web-mobile-apps/" }).success,
    true,
  );
});
