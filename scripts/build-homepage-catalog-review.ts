import fs from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";
import { db } from "../src/server/db";
import { snapshotSchema } from "../src/schemas/content";
import { arabicSnapshot } from "../src/content/arabic-localization";

// Read-only review export. No CMS mutation, authentication change or deployment.
const root = "docs/section-imagery-preview/homepage-catalog";
const preview = "http://127.0.0.1:3011/homepage-catalog";
const origin = "http://127.0.0.1:3014";
await fs.mkdir(root, { recursive: true });
try {
  const [english, arabic] = await Promise.all([
    db.page.findUnique({
      where: { id: "homepage" },
      select: { publishedSnapshot: true, draftSnapshot: true },
    }),
    db.page.findUnique({
      where: { id: "ar-homepage" },
      select: { draftSnapshot: true },
    }),
  ]);
  const en = snapshotSchema.parse(
    english?.publishedSnapshot ?? english?.draftSnapshot,
  );
  const ar = arabic?.draftSnapshot
    ? snapshotSchema.parse(arabic.draftSnapshot)
    : arabicSnapshot(en);
  if (ar.homepage) ar.homepage.localeId = "ar";
  await build({
    entryPoints: ["scripts/homepage-review-entry.tsx"],
    bundle: true,
    minify: true,
    jsx: "automatic",
    outfile: `${root}/home.js`,
    publicPath: preview,
    loader: { ".woff": "file", ".woff2": "file" },
    define: { "process.env.NODE_ENV": '"production"' },
    plugins: [
      {
        name: "local-review-adapters",
        setup(api) {
          api.onResolve({ filter: /^next\/(navigation|script)$/ }, (args) => ({
            path: args.path,
            namespace: "review-adapter",
          }));
          api.onLoad({ filter: /.*/, namespace: "review-adapter" }, (args) => ({
            contents:
              args.path === "next/navigation"
                ? 'export function usePathname(){return document.documentElement.lang === "ar" ? "/ar/" : "/"}'
                : "export default function Script(){return null}",
            loader: "js",
          }));
          api.onResolve({ filter: /^\/(site|brand|homepage)\// }, (args) => ({
            path: origin + args.path,
            external: true,
          }));
        },
      },
    ],
  });
  for (const [locale, snapshot] of [
    ["en", en],
    ["ar", ar],
  ] as const) {
    const data = JSON.stringify(snapshot).replace(/</g, "\\u003c");
    await fs.writeFile(
      path.join(root, `${locale}.html`),
      `<!doctype html><html lang="${locale}" dir="${locale === "ar" ? "rtl" : "ltr"}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>CODEYEA | Homepage catalog review ${locale.toUpperCase()}</title><base href="${origin}/"><link rel="stylesheet" href="${preview}/home.css">${["page-texture", "shared-layout", "post-launch", "owner-review"].map((name) => `<link rel="stylesheet" href="/site/${name}.css">`).join("")}<link rel="stylesheet" href="/api/site-typography"><link rel="stylesheet" href="/site/owner-batch.css"></head><body><div id="root"></div><script type="application/json" id="review-data">${data}</script><script defer src="${preview}/home.js"></script><script defer src="/site/post-launch.js"></script></body></html>`,
    );
  }
  console.log(
    "Read-only homepage review built for English and Arabic with the actual Homepage and Carousel components.",
  );
} finally {
  await db.$disconnect();
}
