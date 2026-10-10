import { test } from "node:test";
import assert from "node:assert/strict";
import { Script } from "node:vm";
import { approvedMenuContent } from "../src/content/approved-navigation";
import type { EditorObject } from "../src/schemas/homepage-editor";
import { industrySlugs } from "../src/content/industry-registry";
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
test("saved CMS menu children supply their labels and destinations to the shared shell", () => {
  const content = {
    items: [
      {
        id: "services",
        parentId: "",
        title: "Services",
        href: "/services",
        enabled: true,
        position: 0,
      },
      {
        id: "website",
        parentId: "services",
        title: "Owner website label",
        href: "/website-design",
        enabled: true,
        position: 1,
      },
      {
        id: "contact",
        parentId: "",
        title: "Contact",
        href: "/contact",
        enabled: true,
        position: 2,
      },
    ],
  };
  const items = approvedMenuContent(content).items as {
    title: string;
    href: string;
    parentId?: string;
  }[];
  assert.equal(
    items.find((i) => i.parentId === "services")?.title,
    "Owner website label",
  );
  assert.equal(
    items.find((i) => i.parentId === "services")?.href,
    "/preview/pages/website-design",
  );
  assert.equal(
    items.find((i) => i.title === "Contact")?.href,
    "/preview/pages/contact",
  );
});
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
      { fields, description: "An approved page." },
      "en",
    );
    assert.ok(result.includes("noindex,nofollow"), slug);
    assert.ok(result.includes("/site/lead-forms.js"), slug);
    assert.ok(
      result.includes("data-shared-shell"),
      slug + " canonical shell styles",
    );
    assert.ok(
      result.includes("hp-footer-v2-layout"),
      slug + " canonical footer",
    );
    assert.ok(
      result.includes("approved-nav-1"),
      slug + " canonical services menu",
    );
    assert.equal(
      result.includes("shared-navigation/hosting-menu.js"),
      false,
      slug + " no legacy menu builder",
    );
    assert.equal(
      (result.match(/src="[^"]*quote-review\/quote-panel\.js"/g) || []).length,
      1,
      slug + " one quote controller",
    );
    assert.ok(result.includes("/site/quote-panel.css"), slug + " quote styles");
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
test("public shared navigation removes Work and sends quote actions to the contact form", async () => {
  const source = await templateContent("contact");
  const html = await renderDocument(
    "contact",
    { fields: extractFields(source), description: "Contact CODEYEA." },
    "en",
    "Contact",
    { public: true },
  );
  assert.match(
    html,
    /class="[^"]*\bhp-header-quote\b[^"]*" href="\/contact\/#contact-form"/,
  );
  assert.match(html, /<form class="ct-form" id="contact-form">/);
  const desktopNav =
    html.match(
      /<nav[^>]*class="[^"]*hp-desktop-nav[^"]*"[^>]*>[\s\S]*?<\/nav>/,
    )?.[0] ?? "";
  const mobileNav =
    html.match(
      /<nav[^>]*aria-label="Mobile navigation"[^>]*>[\s\S]*?<\/nav>/,
    )?.[0] ?? "";
  assert.doesNotMatch(desktopNav, />\s*Work\s*</i);
  assert.doesNotMatch(mobileNav, />\s*Work\s*</i);
  assert.match(desktopNav, /href="\/contact\/">Contact<\/a>/);
});
test("integrated service heroes never flash the legacy hero and retain both animated logo variants", async () => {
  for (const slug of [
    "website-design",
    "web-mobile-apps",
    "ecommerce",
    "brand-design",
  ]) {
    const source = await templateContent(slug);
    const html = await renderDocument(
      slug,
      {
        fields: extractFields(source),
        description: "An approved service page.",
      },
      "en",
      undefined,
      { public: true },
    );
    assert.match(
      html,
      /class="hp-logo-dark" src="\/brand\/logo-animated-dark\.svg"/,
      slug,
    );
    assert.match(
      html,
      /class="hp-logo-light" src="\/brand\/logo-animated-light\.svg"/,
      slug,
    );
    assert.match(html, /data-hero-upgrade-pending/, slug);
    assert.match(html, /onload="document\.querySelectorAll\(/, slug);
    assert.match(html, /onerror="document\.querySelectorAll\(/, slug);
    assert.match(html, /\/site\/page-texture\.css/, slug);
  }
});
test("approved navigation lists support under Services only and places Domains directly after Hosting", () => {
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
    ["Services", "Hosting", "Domains", "Contact"],
  );
  assert.equal(links.filter((i) => i.parentId === "hosting").length, 4);
  assert.equal(links.filter((i) => i.parentId === "services").length, 8);
  assert.equal(
    links.find((i) => i.title === "Technical Support")?.href,
    "/preview/pages/technical-support",
  );
});
test("public approved navigation links point to public page routes", () => {
  const items: EditorObject[] = [
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
      id: "industries",
      title: "Industries",
      href: "/preview/industries",
      enabled: true,
      position: 2,
    },
    {
      id: "industry-healthcare",
      parentId: "industries",
      title: "Healthcare & Aesthetic Clinics",
      href: "/#industry-list",
      enabled: true,
      position: 3,
    },
  ];
  const links = approvedMenuContent({ items }, "public").items as {
    id: string;
    parentId?: string;
    title: string;
    href: string;
  }[];
  assert.equal(
    links.find((item) => item.title === "Services")?.href,
    "/services/",
  );
  assert.equal(
    links.find((item) => item.title === "Hosting")?.href,
    "/website-hosting/",
  );
  assert.equal(
    links.find((item) => item.title === "Industries")?.href,
    "/industries/",
  );
  assert.equal(
    links.find((item) => item.title === "Domains")?.href,
    "/domains/",
  );
  assert.equal(
    links.find((item) => item.title === "SEO & GEO")?.href,
    "/seo-geo/",
  );
  assert.equal(
    links.find((item) => item.title === "Technical Support")?.href,
    "/technical-support/",
  );
  assert.equal(
    links.find((item) => item.title === "Healthcare & Aesthetic Clinics")?.href,
    "/industries/healthcare/",
  );
  assert.equal(
    links.find((item) => item.title === "Contact")?.href,
    "/contact/",
  );
  assert.ok(!links.some((item) => item.title.toLowerCase() === "work"));
  assert.equal(
    links.filter((item) => item.parentId === "industries").length,
    14,
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

test("hosting in-page links resolve sibling templates to protected previews", async () => {
  for (const slug of [
    "website-hosting",
    "wordpress-hosting",
    "cloud-hosting",
  ]) {
    const source = await templateContent(slug);
    const html = await renderDocument(
      slug,
      { fields: extractFields(source), description: "" },
      "en",
    );
    const nav = html.match(/<nav class="v-hosting-nav"[\s\S]*?<\/nav>/)?.[0];
    assert.ok(nav, slug);
    for (const target of [
      "website-hosting",
      "wordpress-hosting",
      "cloud-hosting",
    ])
      assert.ok(
        nav.includes('href="/preview/pages/' + target + '"'),
        slug + " → " + target,
      );
    assert.doesNotMatch(nav, /href="[^"\s]+\.html"/);
  }
});

test("approved navigation hides Work without mutating saved content", () => {
  const content = {
    items: [
      { id: "work", title: "Work", href: "#work", enabled: true, position: 0 },
    ],
  };
  const baseline = JSON.stringify(content);
  const menu = approvedMenuContent(content);
  assert.equal(
    (menu.items as { title: string }[]).some((item) => item.title === "Work"),
    false,
  );
  assert.equal(JSON.stringify(content), baseline);
});
test("the common navigation exposes all fourteen implemented industry previews and keeps public destinations public", () => {
  const content = {
    items: [
      {
        id: "industry",
        title: "Industries",
        href: "#industries",
        enabled: true,
        position: 0,
      },
    ],
  };
  const baseline = JSON.stringify(content);
  const privateItems = approvedMenuContent(content).items as {
    parentId?: string;
    href: string;
  }[];
  assert.deepEqual(
    privateItems.filter((i) => i.parentId === "industry").map((i) => i.href),
    industrySlugs.map((slug) => "/preview/industries/" + slug),
  );
  const publicItems = approvedMenuContent(content, false).items as {
    href: string;
  }[];
  assert.ok(publicItems.every((i) => !i.href.startsWith("/preview")));
  assert.equal(JSON.stringify(content), baseline);
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
