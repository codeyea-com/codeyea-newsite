import { createRequire } from 'node:module';
import { test } from 'node:test';
import assert from 'node:assert/strict';

const require = createRequire(import.meta.url);
const fallback = require('../src/content/approved-industries-fallbacks.json') as {
  details: Record<string, { hero: { media: { mediaId: string; alt: string } }; sections: Array<{ type: string; heading: string; items: Array<{ title: string; media?: { mediaId: string; alt: string } }> }> }>;
};

test('industry fallback copy has no accidental trailing underscores', () => {
  const accidentalMarkers = Object.entries(fallback.details).flatMap(([slug, page]) =>
    page.sections.flatMap(section => section.items.filter(item => /_+$/.test(item.title)).map(item => `${slug}/${section.type}: ${item.title}`)),
  );

  assert.deepEqual(accidentalMarkers, []);
});

test('restaurant page imagery uses food and hospitality assets with truthful descriptions', () => {
  const page = fallback.details['restaurants-cafes-bakeries'];
  const strip = page.sections.find(section => section.type === 'strip')!;

  assert.equal(page.hero.media.mediaId, 'media_7744f88d-d486-443f-80bf-713dd21e0234');
  assert.match(page.hero.media.alt, /bakery|food|restaurant|café/i);
  assert.deepEqual(strip.items.map(item => item.media?.mediaId), [
    'media_7744f88d-d486-443f-80bf-713dd21e0234',
    'media_b6c09a97-921a-4b28-8e0f-dfd35d2c1d38',
    'media_7744f88d-d486-443f-80bf-713dd21e0234',
    'media_b6c09a97-921a-4b28-8e0f-dfd35d2c1d38',
  ]);
  assert.ok(!/temporary|pending/i.test(strip.heading));
});

test('roofing and fashion galleries use varied images that match their descriptions', () => {
  const roofing = fallback.details.roofing.sections.find(section => section.type === 'strip')!;
  const fashion = fallback.details['fashion-and-lifestyle'].sections.find(section => section.type === 'strip')!;

  assert.ok(new Set(roofing.items.map(item => item.media?.mediaId)).size >= 3);
  assert.ok(fashion.items.every(item => /fabric|fashion|clothing|orders|storefront/i.test(item.media?.alt ?? '')));
  assert.ok(!fashion.items.some(item => /laboratory|science|medical/i.test(item.media?.alt ?? '')));
});
