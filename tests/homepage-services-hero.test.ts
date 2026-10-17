import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import {
  heroContent,
  buttonMarkup,
} from "../src/components/sections/homepage-services-hero/content";

for (const arabic of [false, true]) {
  test(`approved Homepage hero has complete initial markup and four uniquely linked panels (${arabic ? "ar" : "en"})`, async () => {
    const { html, slides } = heroContent(arabic);
    assert.equal(slides.length, 4);
    assert.equal((html.match(/role="tabpanel"/g) ?? []).length, 4);
    assert.equal((html.match(/role="tab"/g) ?? []).length, 4);
    assert.equal((html.match(/class="scene is-active"/g) ?? []).length, 1);
    assert.equal((html.match(/aria-hidden="true" inert/g) ?? []).length, 3);
    assert.match(
      html,
      new RegExp(arabic ? "أعمالك تستحق" : "Your business deserves"),
    );
    assert.match(
      html,
      new RegExp(`href="${arabic ? "/ar" : ""}/website-hosting/"`),
    );
    assert.match(html, new RegExp(`href="${arabic ? "/ar" : ""}/about/"`));
    assert.doesNotMatch(
      html,
      /localhost|127\.0\.0\.1|homepage\/hero(?:[-.]|$)|<header|<iframe|<script/,
    );
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(ids.length, new Set(ids).size);
    for (const match of html.matchAll(
      /aria-(?:controls|labelledby)="([^"]+)"/g,
    ))
      assert.ok(ids.includes(match[1]));
    for (const match of html.matchAll(/<img[^>]+src="([^"]+)"/g))
      await fs.access(path.join("public", match[1]));
  });
}

test("Arabic button animation preserves joined words", () => {
  const html = buttonMarkup("اكتشف الذكاء الاصطناعي", true);
  assert.equal((html.match(/class="button-unit"/g) ?? []).length, 3);
  assert.match(html, />الاصطناعي<\/span>/);
});

test("Homepage replaces the old renderer and preserves the CMS visibility toggle", async () => {
  const page = await fs.readFile(
    "src/components/sections/homepage.tsx",
    "utf8",
  );
  assert.match(page, /hero\.enabled !== false && <HomepageServicesHero/);
  assert.doesNotMatch(
    page,
    /className="hp-hero|mediaProps\(hero\.media\)|<WordRotator/,
  );
});
