import {test} from 'node:test';
import assert from 'node:assert/strict';
import fallback from '../src/content/approved-industries-fallbacks.json';
import {industryDetailSchema} from '../src/schemas/industry-detail';
import {withGeneratedIndustryMedia} from '../src/content/generated-industry-media';
import {generatedArtwork} from '../src/content/generated-artwork';

test('a temporary Arabic hero inherited from roofing resolves to its own sector artwork',()=>{
  const content=industryDetailSchema.parse(fallback.details['restaurants-cafes-bakeries']);
  content.localeId='ar';
  content.hero.temporaryMedia=true;
  content.hero.media.mediaId='media_da347870-256b-48e0-bb16-865b0690a592';
  const result=withGeneratedIndustryMedia(content);
  assert.equal(result.hero.media.mediaId,'generated-restaurants-cafes-bakeries-hero-ar');
  assert.match(generatedArtwork(result.hero.media.mediaId)!.src,/restaurants-cafes-bakeries\/hero-light-/);
  assert.equal(content.hero.media.mediaId,'media_da347870-256b-48e0-bb16-865b0690a592');
});

test('a custom non-temporary CMS hero remains authoritative',()=>{
  const content=industryDetailSchema.parse(fallback.details['restaurants-cafes-bakeries']);
  content.hero.temporaryMedia=false;
  content.hero.media.mediaId='media_00000000-0000-0000-0000-000000000000';
  assert.deepEqual(withGeneratedIndustryMedia(content).hero.media,content.hero.media);
});
