import { test } from "node:test";
import assert from "node:assert/strict";
// @ts-expect-error Node runs this TS test directly using native type stripping.
import { adjacentHeroIndex, createHeroServiceSlides } from "../src/components/sections/homepage-hero-model.ts";
// @ts-expect-error Node runs this TS test directly using native type stripping.
import { buildMorphBand } from "../src/components/sections/homepage-hero-geometry.ts";

test("hero slides follow enabled CMS service order and keep their copy paired", () => {
  assert.deepEqual(
    createHeroServiceSlides([
      { id: "seo", title: "SEO", body: "Be found", enabled: true, position: 2 },
      { id: "disabled", title: "Hidden", body: "No", enabled: false, position: 1 },
      { id: "web", title: "Web Apps", body: "Build better", enabled: true, position: 0 },
    ]),
    [
      { id: "web", title: "Web Apps", body: "Build better" },
      { id: "seo", title: "SEO", body: "Be found" },
    ],
  );
});

test("hero navigation wraps in either direction and tolerates a single slide", () => {
  assert.equal(adjacentHeroIndex(2, 1, 3), 0);
  assert.equal(adjacentHeroIndex(0, -1, 3), 2);
  assert.equal(adjacentHeroIndex(0, 1, 1), 0);
});

test("the hero artwork is one deep, open C-shaped band that can dissolve and reform", () => {
  const faces = buildMorphBand(1, 4, 1);
  const front = faces.filter((face) => face.surface === "front");
  const upperEnd = front[0].points[0];
  const rightmost = front[Math.floor(front.length / 2)].points[0];
  const lowerEnd = front[front.length - 1].points[1];
  assert.ok(upperEnd.x < -0.45 && lowerEnd.x < -0.45);
  assert.ok(rightmost.x > 0.95);
  assert.ok(front.some((face) => face.points.some((point) => Math.abs(point.z) > 0.1)));
  assert.ok(buildMorphBand(1, 4, 0.5).every((face) => face.alpha < 0.01));
});
