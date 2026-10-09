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
  assert.deepEqual(routes, [
    '/',
    '/industries/roofing/',
    '/website-design/',
    '/website-hosting/',
    '/ar/website-design/',
  ]);
});

test('draft main pages and draft template documents are never internal public targets', () => {
  assert.deepEqual(publishedSitePaths({
    pages: [{ id: 'about', publishedAt: null, publishedSnapshot: { title: 'Draft' } }],
    documents: [{ slug: 'contact', locale: 'en', kind: 'page', published: null }],
  }), []);
});
