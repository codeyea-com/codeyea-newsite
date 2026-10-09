import test from 'node:test';
import assert from 'node:assert/strict';
import { publishedSitePaths } from '../src/content/site-routes';

test('published CMS template pages join main pages as eligible internal-link targets', () => {
  const routes = publishedSitePaths({
    pages: [
      { id: 'homepage', publishedAt: new Date(), publishedSnapshot: { sections: [] } },
      { id: 'services', publishedAt: null, publishedSnapshot: null },
      { id: 'roofing', publishedAt: new Date(), publishedSnapshot: { title: 'Roofing' } },
    ],
    documents: [
      { slug: 'website-design', locale: 'en', kind: 'page', published: { title: 'Website Design' } },
      { slug: 'website-hosting', locale: 'en', kind: 'page', published: { title: 'Hosting' } },
      { slug: 'website-design', locale: 'ar', kind: 'page', published: { title: 'تصميم المواقع' } },
      { slug: 'private-post', locale: 'en', kind: 'post', published: { title: 'Post' } },
      { slug: 'unknown', locale: 'en', kind: 'page', published: { title: 'Unknown' } },
      { slug: 'email-hosting', locale: 'en', kind: 'page', published: null },
    ],
  });
  for (const route of [
    '/', '/industries/roofing/', '/website-design/', '/website-hosting/',
    '/contact/', '/technical-support/', '/industries/healthcare/',
    '/industries/construction/',
  ]) assert.ok(routes.includes(route), `expected ${route} to be linkable`);
  assert.ok(routes.includes('/ar/website-design/'));
  assert.ok(!routes.includes('/private-post/'));
});

test('public fallback routes remain linkable while unregistered main drafts remain private', () => {
  const routes=publishedSitePaths({
    pages: [{ id: 'about', publishedAt: null, publishedSnapshot: { title: 'Draft' } }],
    documents: [{ slug: 'contact', locale: 'en', kind: 'page', published: null }],
  });
  assert.ok(routes.includes('/contact/'));
  assert.ok(routes.includes('/industries/roofing/'));
  assert.ok(!routes.includes('/about/'));
});
