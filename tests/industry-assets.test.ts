import { test } from 'node:test';
import assert from 'node:assert/strict';
import { attachLocalIndustryAssets } from '../src/content/industry-assets';

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
