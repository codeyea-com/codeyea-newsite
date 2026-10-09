import test from 'node:test';
import assert from 'node:assert/strict';
import { approvedTemplates, applyTemplateImageOverrides, rewritePublicDocumentLinks, templateContent, templatePageDraft } from '../src/server/site-documents';
import {documentPath,existingPageIds,pagePath} from '../src/content/site-routes';

test('public template links resolve review navigation to real English routes', () => {
  const html = `<a href="/preview">Home</a><a href="/preview#services">Services</a><a href="/preview#service-3">Service</a><a href="/preview#hosting">Hosting</a><a href="/preview/industries">Industries</a><a href="/preview/industries/healthcare">Healthcare</a><a href="https://codeyea.com/contact/">Contact</a>`;
  const result = rewritePublicDocumentLinks(html, 'en');
  assert.match(result, /href="\/"/);
  assert.match(result, /href="\/services\/"/);
  assert.match(result, /href="\/#service-3"/);
  assert.match(result, /href="\/website-hosting\/"/);
  assert.match(result, /href="\/industries\/"/);
  assert.match(result, /href="\/industries\/healthcare\/"/);
  assert.match(result, /href="\/contact\/"/);
  assert.doesNotMatch(result, /href="\/preview/);
});

test('Arabic template links retain the Arabic locale prefix for localized pages', () => {
  const html = `<a href="/preview/about">About</a><a href="/preview/pages/website-hosting?locale=ar">Hosting</a><a href="/preview/industries/healthcare">Healthcare</a>`;
  const result = rewritePublicDocumentLinks(html, 'ar');
  assert.match(result, /href="\/ar\/about\/"/);
  assert.match(result, /href="\/ar\/website-hosting\/"/);
  assert.match(result, /href="\/ar\/industries\/healthcare\/"/);
  assert.doesNotMatch(result, /href="\/preview/);
});

test('all public template documents are free of private preview destinations', async () => {
  for (const slug of Object.keys(approvedTemplates)) {
    const html = rewritePublicDocumentLinks(await templateContent(slug), 'en');
    assert.doesNotMatch(html, /href=["']\/preview(?:[/?#]|["'])/i, `${slug} retains a preview link`);
    assert.doesNotMatch(html, /href=["']\/admin(?:[/?#]|["'])/i, `${slug} exposes an admin destination`);
  }
});

test('all internal template navigation points to a registered public route', async () => {
  const routes=new Set([...existingPageIds.map(pagePath).filter(Boolean),...Object.keys(approvedTemplates).map(slug=>documentPath(slug,'en')).filter(Boolean)]);
  for(const slug of Object.keys(approvedTemplates)){
    const html=rewritePublicDocumentLinks(await templateContent(slug),'en');
    for(const match of html.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)){
      const href=match[1];
      if(!href.startsWith('/')||href.startsWith('/api/'))continue;
      assert.ok(routes.has(href.split(/[?#]/)[0]),`${slug} points to an unregistered route: ${href}`);
    }
  }
});

test('approved template initialization creates a private, noindex draft with editable image mappings', () => {
  const html = '<main><h1>Launch a clearer online store</h1><img src="store.webp" alt="Product display"></main>';
  const draft = templatePageDraft('ecommerce', html);
  assert.equal(draft.title, 'eCommerce');
  assert.equal(draft.content.seo?.index, false);
  assert.equal(draft.content.seo?.canonicalPath, '/ecommerce/');
  assert.equal(draft.content.fields.some(field => field.value.includes('Launch a clearer online store')), true);
  assert.deepEqual(draft.content.images, [{ key: 'image-0', mediaId: '', alt: 'Product display', decorative: false }]);
});

test('a selected CMS image replaces the original srcset and carries safe alt text', () => {
  const html='<main><img src="old.webp" srcset="old-small.webp 640w, old-large.webp 1200w" sizes="100vw" alt="Old image"></main>';
  const result=applyTemplateImageOverrides(html,[{key:'image-0',mediaId:'media_12345678-1234-1234-1234-123456789abc',alt:'New image',decorative:false}]);
  assert.match(result,/src="\/api\/media\/media_12345678-1234-1234-1234-123456789abc\/large"/);
  assert.match(result,/alt="New image"/);
  assert.doesNotMatch(result,/srcset=/);
  assert.doesNotMatch(result,/old-small|old-large/);
});
