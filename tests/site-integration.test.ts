import { test } from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { approvedMenuContent } from "../src/content/approved-navigation";
import { leadSchema, recipients } from "../src/schemas/lead";
import {
  approvedTemplates,
  extractFields,
  templateContent,
  renderDocument,
} from "../src/server/site-documents";
import {
  gaTable,
  gscTable,
  clarityTable,
  reportQuery,
} from "../src/server/analytics-reports";
const contact = {
  submissionId: "9e621309-a170-4467-b3c0-de20a646f424",
  kind: "contact",
  name: "Example Customer",
  email: "customer@example.test",
  message: "Please discuss this project.",
  consent: true,
};
test("lead validation enforces consent, content and at most two distinct quote services", () => {
  assert.ok(leadSchema.safeParse(contact).success);
  assert.equal(
    leadSchema.safeParse({ ...contact, consent: false }).success,
    false,
  );
  assert.equal(
    leadSchema.safeParse({ ...contact, message: " " }).success,
    false,
  );
  for (const services of [[], ["SEO", "SEO"], ["SEO", "Website", "Support"]])
    assert.equal(
      leadSchema.safeParse({ ...contact, kind: "quote", services }).success,
      false,
    );
  assert.ok(
    leadSchema.safeParse({
      ...contact,
      kind: "quote",
      services: ["SEO", "Website"],
    }).success,
  );
  assert.deepEqual(recipients.contact, [
    "info@codeyea.com",
    "codeyea.cda@gmail.com",
  ]);
  assert.deepEqual(recipients.quote, [
    "qays.zubaidi@codeyea.com",
    "support@codeyea.com",
    "codeyea.cda@gmail.com",
  ]);
  assert.equal(
    "to" in leadSchema.parse({ ...contact, to: ["attacker@example.test"] }),
    false,
  );
});
test("approved templates retain entities and use private integrated assets", async () => {
  for (const slug of Object.keys(approvedTemplates)) {
    const source = await templateContent(slug),
      fields = extractFields(source);
    assert.ok(fields.length > 0, slug);
    const result = await renderDocument(
      slug,
      { fields, description: "" },
      "en",
    );
    assert.ok(result.includes("noindex,nofollow"), slug);
    assert.ok(result.includes("/site/lead-forms.js"), slug);
    assert.ok(!result.includes("http://127.0.0.1:3002/"), slug);
    assert.equal(result.includes("&amp;nbsp;"), false, slug);
    assert.equal(result.includes("&amp;#"), false, slug);
    for (const script of result.matchAll(
      /<script([^>]*)>([\s\S]*?)<\/script>/g,
    )) {
      if (!script[1].includes("application/"))
        assert.doesNotThrow(
          () => new Script(script[2]),
          slug + " inline animation syntax",
        );
    }
  }
});
test("approved navigation groups hosting support and places Domains directly after Hosting", () => {
  const items = [
    {
      id: "services",
      title: "Services",
      href: "/preview#services",
      enabled: true,
      position: 0,
    },
    {
      id: "hosting",
      title: "Hosting",
      href: "/preview#hosting",
      enabled: true,
      position: 1,
    },
    {
      id: "support",
      title: "Technical Support",
      href: "#",
      enabled: true,
      position: 2,
    },
  ];
  const menu = approvedMenuContent({ items }),
    links = menu.items as {
      id: string;
      parentId?: string;
      title: string;
      href: string;
    }[];
  assert.deepEqual(
    links.filter((i) => !i.parentId).map((i) => i.title),
    ["Services", "Hosting", "Domains"],
  );
  assert.equal(links.filter((i) => i.parentId === "hosting").length, 5);
  assert.equal(links.filter((i) => i.parentId === "services").length, 7);
  assert.equal(
    links.find((i) => i.title === "Technical Support")?.href,
    "/preview/pages/technical-support",
  );
});
test("edited page content and titles cannot inject markup", async () => {
  const fields = extractFields(await templateContent("contact"));
  fields[0].value = "<script>alert(1)</script>";
  const result = await renderDocument(
    "contact",
    { fields, description: '"><script>bad</script>' },
    "ar",
    "<img onerror=bad>",
  );
  assert.ok(result.includes("&lt;script&gt;alert(1)&lt;/script&gt;"));
  assert.ok(!result.includes("<script>bad</script>"));
  assert.ok(result.includes('dir="rtl"'));
  assert.ok(
    result.includes("<title>&lt;img onerror=bad&gt; | CODEYEA</title>"),
  );
});
test("report adapters retain dimensions with metrics and reject invalid responses", () => {
  assert.deepEqual(
    gaTable({
      dimensionHeaders: [{ name: "pagePath" }],
      metricHeaders: [{ name: "sessions" }],
      rows: [
        {
          dimensionValues: [{ value: "/contact" }],
          metricValues: [{ value: "12" }],
        },
      ],
    }).rows,
    [["/contact", "12"]],
  );
  assert.deepEqual(
    gscTable(
      {
        rows: [
          {
            keys: ["website design"],
            clicks: 2,
            impressions: 20,
            ctr: 0.1,
            position: 4.5,
          },
        ],
      },
      "query",
    ).rows,
    [["website design", "2", "20", "10.00%", "4.50"]],
  );
  assert.deepEqual(
    clarityTable([
      {
        metricName: "Traffic",
        information: [
          { URL: "/contact", Device: "Mobile", totalSessionCount: "3" },
        ],
      },
    ]).rows,
    [["Traffic", "/contact", "Mobile", "totalSessionCount", "3"]],
  );
  assert.throws(() => gaTable({ rows: "invalid" }));
  assert.equal(
    reportQuery.safeParse({ source: "ga4", days: 10000 }).success,
    false,
  );
});
