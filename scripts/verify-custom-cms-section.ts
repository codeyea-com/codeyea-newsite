import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {renderWebsiteCustomCms} from '../src/server/website-custom-cms-render';
import {renderDocument, templateContent, templatePageDraft} from '../src/server/site-documents';

const source = await templateContent('website-design');
const draft = templatePageDraft('website-design', source);
for (const locale of ['ar','en']) {
  const html = await renderDocument('website-design', draft.content, locale, draft.title, {public:true});
  assert.equal((html.match(/id="custom-cms"/g)||[]).length, 1);
  assert.equal((html.match(/id="custom-cms-ai"/g)||[]).length, 1);
  assert(html.indexOf('id="custom-cms"') < html.indexOf('class="e-payments'), 'CMS must precede existing payments section');
  assert.equal(renderWebsiteCustomCms(html,'website-design',locale,'/contact'),html,'Repeated rendering duplicates section');
  assert(html.includes(`custom-cms-ai-${locale}-v1.webp`),'Chat image must match page language');
  const images = [...html.matchAll(/src="(\/site\/generated\/website-design\/custom-cms-[^"]+)"/g)];
  assert.equal(images.length,3);
  for(const image of images) await fs.access('public'+image[1]);
  assert(html.includes(locale === 'ar' ? 'استلم النتيجة ورابط الصفحة' : 'Get the result and the page link'));
  assert(html.includes('.ccms-ai-content>figure,.ccms-ai-content>div,.ccms-closing'), 'New section must join existing animation observer');
  assert(html.includes("duration:1300,delay:i*130,easing:'cubic-bezier(.16,1,.3,1)'"), 'Approved commerce motion must remain unchanged');
  assert.equal((html.match(/class="b-btn ccms-cta[^"]*" data-quote-open/g)||[]).length,2,'Both CTAs must reuse the existing button and quote action');
}
assert.equal(renderWebsiteCustomCms(source,'brand-design','en','/contact'),source,'Other services must stay unchanged');
assert.throws(()=>renderWebsiteCustomCms('<html></html>','website-design','en','/contact'),/anchor missing/);
console.log({locales:2,imagesPerPage:3,localizedChat:true,insertion:'idempotent',otherServices:'unchanged'});
