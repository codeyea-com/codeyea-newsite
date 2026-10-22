import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalHtmlLinks, canonicalSiteHref, nestedServiceSlugs } from '../src/content/url-hierarchy';
import { contextualLinks } from '../src/content/contextual-links';
import { documentPath } from '../src/content/site-routes';
import { localizedHref } from '../src/content/arabic-navigation';
import { blogPostPath } from '../src/schemas/blog';
import { industryDestination } from '../src/content/industry-destinations';

test('all bilingual service URLs share a stable hierarchy while retaining deep links', () => {
  for (const slug of nestedServiceSlugs) for (const locale of ['en','ar']) {
    const prefix = locale === 'ar' ? '/ar' : '';
    const destination = `${prefix}/services/${slug === 'seo-geo' ? 'seo-geo-aeo' : slug}/`;
    assert.equal(documentPath(slug,locale),destination);
    assert.equal(canonicalSiteHref(`${prefix}/${slug}?source=card#details`),destination+'?source=card#details');
    assert.equal(canonicalSiteHref(destination),destination);
    assert.equal(canonicalSiteHref(`https://codeyea.com${prefix}/${slug}/`),'https://codeyea.com'+destination);
  }
  assert.equal(localizedHref('/services/website-design/'),'/ar/services/website-design/');
  assert.equal(localizedHref('/ar/services/website-design/',true),'/preview/pages/website-design?locale=ar');
});
test('URL normalization preserves external, asset, and unrelated URLs', () => {
  for (const url of ['https://example.com/website-design/','https://example.com/services/seo-geo/','/api/site-assets/website-design/','/api/services/seo-geo/','/website-hosting/','#website-design','/services/']) assert.equal(canonicalSiteHref(url),url);
  for (const prefix of ['', '/ar', 'https://codeyea.com', 'https://codeyea.com/ar']) {
    assert.equal(canonicalSiteHref(`${prefix}/services/seo-geo/?ref=faq#answers`), `${prefix}/services/seo-geo-aeo/?ref=faq#answers`);
  }
  assert.equal(canonicalHtmlLinks('<a href="/ai-automation/#work">AI</a>'),'<a href="/services/ai-automation/#work">AI</a>');
  assert.equal(blogPostPath('custom-cms','ar'),'/ar/blog/custom-cms/');
  assert.equal(blogPostPath('custom-cms','en'),'/blog/custom-cms/');
  assert.equal(industryDestination('/ar/industries/oil-and-gas/'),'/ar/industries/oil-and-gas/');
  assert.equal(industryDestination('/industries/does-not-exist/'),undefined);
});
test('contextual linking preserves exact text, longest terms, and language', () => {
  const ar = 'CODEYEA تربط الهوية والتصميم والأتمتة والاستضافة وSEO والدعم التقني.';
  const parts = contextualLinks(ar);
  assert.equal(parts.map(p=>p.text).join(''),ar);
  assert.deepEqual(parts.filter(p=>p.href).map(p=>p.href),['/ar/about/','/ar/services/brand-design/','/ar/services/ai-automation/','/ar/website-hosting/','/ar/services/seo-geo-aeo/','/ar/services/technical-support/']);
  const en = 'Brand identity, eCommerce, SEO and technical support with CODEYEA.';
  assert.equal(contextualLinks(en).map(p=>p.text).join(''),en);
  assert.ok(contextualLinks(en).filter(p=>p.href).every(p=>!p.href!.startsWith('/ar/')));
  assert.equal(contextualLinks('pseudoseology').filter(p=>p.href).length,0);
  assert.equal(contextualLinks('SEO, SEO and SEO').filter(p=>p.href).length,1);
});
