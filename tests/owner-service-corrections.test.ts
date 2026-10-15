import { test } from 'node:test';
import assert from 'node:assert/strict';
import { templateContent, templatePageDraft, bindDocumentControls, renderDocument } from '../src/server/site-documents';
import { arabicText } from '../src/content/arabic-localization';

for (const locale of ['en', 'ar']) {
  test(`Brand clients stay editable and can be restored in ${locale}`, async () => {
    const template = await templateContent('brand-design');
    const content = await bindDocumentControls('brand-design', template, templatePageDraft('brand-design', template).content);
    const clients = content.controls.sections.find(section => section.label === 'Clients')!;
    assert.equal(clients.enabled, false);
    const hidden = await renderDocument('brand-design', content, locale, 'Brand Design', {public: true});
    assert.match(hidden, /<section class="b-clients b-dark" hidden data-cms-hidden="true">/);
    assert.match(hidden, /Client identity 01/);
    clients.enabled = true;
    const restored = await renderDocument('brand-design', content, locale, 'Brand Design', {public: true});
    assert.match(restored, /<section class="b-clients b-dark">/);
  });

  test(`SEO title includes AEO without linking the page heading in ${locale}`, async () => {
    const template = await templateContent('seo-geo');
    const {content, title} = templatePageDraft('seo-geo', template);
    if (locale === 'ar') content.fields = content.fields.map(field => ({...field, value: arabicText(field.value)}));
    const html = await renderDocument('seo-geo', content, locale, title, {public: true});
    assert.match(html.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/)![0], /AEO/);
    assert.doesNotMatch(html.match(/<p class="internal-hero-brand">[\s\S]*?<\/p>/)![0], /<a\b/);
    assert.match(html, /<a class="cy-context-link"/);
  });
}
