import { test } from "node:test";
import assert from "node:assert/strict";
import { defaultAbout } from "../src/content/about-defaults";
import { aboutSchema } from "../src/schemas/about";

test("public About fallback keeps the approved editorial section order", () => {
  const page = defaultAbout();
  assert.equal(aboutSchema.safeParse(page).success, true);
  assert.equal(page.schemaVersion, 2);
  assert.deepEqual(
    page.sections.map((section) => section.type),
    ["hero", "who", "experience", "projectReference", "principles", "showcase", "awards"],
  );
  assert.equal(page.sections.find((section) => section.type === "showcase")?.items.length, 4);
  assert.equal(page.sections.find((section) => section.type === "awards")?.label, "OUR CAPABILITIES");
});
