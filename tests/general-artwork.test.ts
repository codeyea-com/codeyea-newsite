import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { generalArtwork } from '../src/content/generated-general-artwork';
import registry from '../src/content/generated-general-artwork.json';
import { defaultAbout } from '../src/content/about-defaults';
import { renderDocument, templateContent, templatePageDraft } from '../src/server/site-documents';

test('general page images have all 33 placements and 45 available responsive files', async () => {
  const entries = Object.values(registry);
  assert.equal(entries.length, 33);
  const files = entries.flatMap((a: {src:string; mobileSrc?:string; tabletSrc?:string}) => [a.src, a.mobileSrc, a.tabletSrc].filter(Boolean) as string[]);
  assert.equal(files.length, 45);
  for (const file of files) assert.ok((await fs.stat('public' + file)).size > 1000, file);
});

test('choosing a custom CMS image takes precedence over general-page defaults', () => {
  const media = defaultAbout().sections[0].media!;
  const original = generalArtwork('about/hero');
  assert.ok(original?.mobileSrc && original.tabletSrc);
  assert.equal(generalArtwork('about/hero', {...media, mediaId:'custom-cms-image'}), undefined);
  assert.equal(generalArtwork('about/hero', {...media, mediaId: original.expectedMediaId!}), original);
});

test('Contact renders the new image and official logo in both locales while honoring a custom image', async () => {
  const source = await templateContent('contact');
  const draft = templatePageDraft('contact', source);
  for (const locale of ['en','ar']) {
    const html = await renderDocument('contact', draft.content, locale, draft.title, {public:true});
    assert.ok(html.includes(generalArtwork('contact/hero')!.src));
    assert.ok(html.includes('class="general-brand-plaque"'));
    assert.ok(html.includes('data-generated-mobile='));
  }
  const custom = {...draft.content, images:[{key:'image-0',mediaId:'custom-contact-photo',alt:'Custom image',decorative:false}]};
  const html = await renderDocument('contact', custom, 'en', draft.title, {public:true});
  assert.ok(!html.includes(generalArtwork('contact/hero')!.src));
  assert.ok(!html.includes('class="general-brand-plaque"'));
});
