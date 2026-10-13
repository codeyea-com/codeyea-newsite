import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {renderDocument,templateContent,templatePageDraft} from '../src/server/site-documents';
import {renderIllustrativeWork} from '../src/server/illustrative-work-render';
import registry from '../src/content/generated-service-artwork.json';
import industries from '../src/content/generated-artwork.json';
import {assetUrl} from '../src/content/homepage-assets';
import type {ServiceArtwork} from '../src/content/generated-service-artwork';

const files=new Set<string>();
for(const slots of Object.values(registry as Record<string,Record<string,ServiceArtwork>>))for(const art of Object.values(slots)) {
 files.add(art.src);if('mobileSrc' in art&&art.mobileSrc)files.add(art.mobileSrc);
 if(art.transparent){const info=await sharp('public'+art.src).metadata();const stats=await sharp('public'+art.src).stats();assert(info.hasAlpha&&stats.channels[3].min===0,art.src+' must preserve actual transparency');}
}
for(const art of Object.values(industries)){files.add(art.src);files.add(art.mobileSrc);assert(!/-v[34]-/.test(art.src)||!art.src.includes('strip-1')&&!art.src.includes('strip-3'),'Rejected device draft selected');}
for(const file of files)await fs.access('public'+file);
for(const slug of ['brand-design','seo-geo','ai-automation','website-design']) {
 const source=await templateContent(slug),draft=templatePageDraft(slug,source);
 const html=await renderDocument(slug,draft.content,'en',draft.title,{public:true});
 assert(html.includes('data-generated-desktop='),slug+' missing selected assets');
 assert(!html.includes('work-popup')&&!html.includes('work-check'),slug+' includes rejected card overlays');
 if(slug==='seo-geo'||slug==='ai-automation'){
  assert.equal((html.match(/class="ds-placeholder work-art /g)||[]).length,6);
  assert(html.includes('section-path-2-v2-desktop.webp')||slug==='seo-geo');
  assert(html.includes('section-path-3-v2-desktop.webp'),slug+' path image not connected');
 }
 const custom=structuredClone(draft.content);custom.images![1].mediaId='hero';
 const customHtml=await renderDocument(slug,custom,'en',draft.title,{public:true});
 const firstSource=(registry as Record<string,Record<string,{src:string}>>)[slug]['1'].src;
 assert(customHtml.includes(assetUrl('hero')),'CMS image upload lost');
 assert(!customHtml.includes('data-generated-desktop="'+firstSource+'"'),'Generated default overrides editor choice');
}
const support=await templateContent('technical-support');
assert.equal(renderIllustrativeWork(support,'technical-support','en'),support,'Pricing section altered');
console.log(JSON.stringify({assetFiles:files.size,servicePages:4,cmsOverrides:'preserved',smallCards:'clean',supportPricing:'preserved'}));
