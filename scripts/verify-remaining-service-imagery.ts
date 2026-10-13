import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import sharp from 'sharp';
import {renderDocument,templateContent,templatePageDraft} from '../src/server/site-documents';
import {renderIllustrativeWork} from '../src/server/illustrative-work-render';
import {arabicText} from '../src/content/arabic-localization';
import {serviceArtwork} from '../src/content/generated-service-artwork';
import {assetUrl} from '../src/content/homepage-assets';

const specs:Record<string,[string|number,string,number,number,boolean,string,string][]>=JSON.parse(await fs.readFile('docs/REMAINING_SERVICE_SCENES.json','utf8'));
const jobs:{page:string;slot:string|number;variant:string}[]=JSON.parse(await fs.readFile('docs/REMAINING_SERVICE_GENERATIONS.json','utf8'));
const files=new Set<string>();
for(const [slug,scenes] of Object.entries(specs)){
 const source=await templateContent(slug),draft=templatePageDraft(slug,source);
 for(const [slot] of scenes){
  const art=serviceArtwork(slug,slot);assert(art,`${slug}/${slot} missing artwork`);
  assert(jobs.some(j=>j.page===slug&&j.slot===slot&&j.variant==='desktop'),`${slug}/${slot} missing original record`);
  files.add(art.src);if(art.mobileSrc)files.add(art.mobileSrc);
  if(art.transparent){const metadata=await sharp('public'+art.src).metadata(),stats=await sharp('public'+art.src).stats();assert(metadata.hasAlpha&&stats.channels[3].min===0,`${slug}/${slot} lacks true alpha`);}
 }
 for(const locale of ['en','ar']){
  const content=structuredClone(draft.content);
  if(locale==='ar')content.fields=content.fields.map(f=>({...f,value:arabicText(f.value)}));
  const html=await renderDocument(slug,content,locale,draft.title,{public:true});
  for(const [slot] of scenes){const art=serviceArtwork(slug,slot)!;assert(html.includes(art.src),`${slug}/${locale}/${slot} asset not connected`);if(art.mobileSrc)assert(html.includes(art.mobileSrc),`${slug}/${locale}/${slot} mobile asset not connected`);}
  assert(!/class="[^"]*\b(?:work-popup|work-check)\b/.test(html),`${slug}/${locale} rejected card overlays`);
 }
 const index=scenes.find(s=>typeof s[0]==='number')![0] as number;
 const custom=structuredClone(draft.content);custom.images![index].mediaId='hero';
 const html=await renderDocument(slug,custom,'en',draft.title,{public:true});
 assert(html.includes(assetUrl('hero')),slug+' CMS upload missing');
 assert(!html.includes('data-generated-desktop="'+serviceArtwork(slug,index)!.src+'"'),slug+' overrides uploaded image');
}
for(const file of files){await fs.access('public'+file);const m=await sharp('public'+file).metadata();assert(m.width&&m.height,file+' invalid dimensions');}
const support=await templateContent('technical-support');
assert.equal(renderIllustrativeWork(support,'technical-support','en'),support,'Support pricing altered');
console.log(JSON.stringify({pages:Object.keys(specs).length,locales:2,assets:files.size,connections:'verified',cmsUploads:'preserved',supportPricing:'preserved'}));
