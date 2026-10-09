import { test } from 'node:test';
import assert from 'node:assert/strict';
import { applyTemporaryIndustryFallbackMedia, attachLocalIndustryAssets } from '../src/content/industry-assets';
import fallback from '../src/content/approved-industries-fallbacks.json';
import { industryDetailSchema } from '../src/schemas/industry-detail';
import type { IndustryDetailContent } from '../src/schemas/industry-detail';

test('industry fallback keeps each approved media selection instead of replacing every photo with one industry alias', () => {
  const fallback = {
    hero: { mediaId: 'media_7744f88d-d486-443f-80bf-713dd21e0234', alt: 'Bakery counter' },
    sections: [
      { media: { mediaId: 'media_b6c09a97-921a-4b28-8e0f-dfd35d2c1d38', alt: 'Restaurant dining room' } },
    ],
  };

  assert.deepEqual(attachLocalIndustryAssets(fallback, 'restaurants-cafes-bakeries'), {
    hero: { mediaId: 'media_7744f88d-d486-443f-80bf-713dd21e0234', alt: 'Bakery counter' },
    sections: [
      { media: { mediaId: 'media_b6c09a97-921a-4b28-8e0f-dfd35d2c1d38', alt: 'Restaurant dining room' } },
    ],
  });
});

test('industry fallback still maps an unavailable uploaded asset to its local industry image', () => {
  assert.deepEqual(
    attachLocalIndustryAssets({ media: { mediaId: 'media_00000000-0000-0000-0000-000000000000', alt: 'Fallback' } }, 'restaurants-cafes-bakeries'),
    { media: { mediaId: 'commerce', alt: 'Fallback' } },
  );
});

test('published temporary photos are replaced with the reviewed industry gallery', () => {
  const source = structuredClone(fallback.details['restaurants-cafes-bakeries'] as unknown as IndustryDetailContent);
  source.hero.media = { ...source.hero.media, mediaId: 'media_da347870-256b-48e0-bb16-865b0690a592', alt: 'Roofing professionals installing a roof' };
  for (const section of source.sections) {
    if (!section.temporaryMedia) continue;
    if (section.media) section.media = { ...section.media, mediaId: 'media_da347870-256b-48e0-bb16-865b0690a592', alt: 'Roofing professionals installing a roof' };
    section.items = section.items.map(item => item.media
      ? { ...item, media: { ...item.media, mediaId: 'media_da347870-256b-48e0-bb16-865b0690a592', alt: 'Roofing professionals installing a roof' } }
      : item);
  }
  const saved = industryDetailSchema.parse(source);
  const reviewed = industryDetailSchema.parse(fallback.details['restaurants-cafes-bakeries']);
  const result = applyTemporaryIndustryFallbackMedia(saved, reviewed);
  assert.equal(result.hero.media.alt, 'A bakery employee standing behind a counter of prepared goods');
  const gallery = result.sections.find(section => section.id === 'restaurants-cafes-bakeries-strip');
  assert.equal(gallery?.items[0]?.media?.alt, 'A bakery employee standing behind a counter of prepared goods');
  assert.equal(gallery?.items[1]?.media?.alt, 'A restaurant dining room arranged for guests');
});
