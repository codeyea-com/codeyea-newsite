import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { approvedTemplates, applyTemplateImageOverrides, extractTemplateMediaIds, replaceSharedSiteShell, rewritePublicDocumentLinks, templateContent, templatePageDraft } from '../src/server/site-documents';
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

test('hosting template links resolve nested HTML labels to their public pages', () => {
  const html = '<a href="website-hosting-interactive.html">Website Hosting</a><a href="wordpress-hosting-interactive.html">WordPress Hosting</a><a href="cloud-hosting-interactive.html">Cloud Hosting</a>';
  const result = rewritePublicDocumentLinks(html, 'en');
  assert.match(result, /href="\/website-hosting\/"/);
  assert.match(result, /href="\/wordpress-hosting\/"/);
  assert.match(result, /href="\/cloud-hosting\/"/);
});

test('site documents receive the shared header and footer while preserving page content', () => {
  const html = '<html><body><header>Old header</header><main><h1>Page content</h1></main><footer>Old footer</footer></body></html>';
  const result = replaceSharedSiteShell(html, '<header>Shared header</header>', '<footer>Shared footer</footer>');
  assert.match(result, /<header>Shared header<\/header>/);
  assert.match(result, /<footer>Shared footer<\/footer>/);
  assert.match(result, /<main><h1>Page content<\/h1><\/main>/);
  assert.doesNotMatch(result, /Old header|Old footer/);
});

test('shared mega menus stay within the viewport and align below the visible header', async () => {
  const [css, script] = await Promise.all([
    readFile(new URL('../site-templates/shared-navigation/hosting-menu.css', import.meta.url), 'utf8'),
    readFile(new URL('../site-templates/shared-navigation/hosting-menu.js', import.meta.url), 'utf8'),
  ]);
  assert.match(css, /position:fixed;top:var\(--cy-panel-top/);
  assert.match(css, /left:50vw/);
  assert.match(css, /width:min\(1220px,calc\(100vw - 48px\)\)/);
  assert.match(script, /header\.getBoundingClientRect\(\)\.bottom/);
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
  assert.match(result,/src="\/asset\/media_12345678-1234-1234-1234-123456789abc"/);
  assert.match(result,/alt="New image"/);
  assert.doesNotMatch(result,/srcset=/);
  assert.doesNotMatch(result,/old-small|old-large/);
});

test('public templates expose only the media IDs embedded in their approved image markup', async () => {
  const ids = extractTemplateMediaIds(await templateContent('website-hosting'));
  assert.equal(ids.has('media_144cde21-93c7-4a91-87b1-0b8fe5ad799e'), true);
  assert.equal(ids.has('media_not-used-by-any-public-template'), false);
});
