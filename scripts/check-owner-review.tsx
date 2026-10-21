import React from 'react';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {IndustryIcon} from '../src/components/sections/shared-navigation-view';
import {industrySlugs} from '../src/content/industry-registry';
import {synchronizeIndustryServices} from '../src/content/synchronized-service-lists';
import {synchronizeIndustryMedia} from '../src/content/synchronize-industry-media';
import {refineArabicIndustryCopy} from '../src/content/arabic-industry-refinements';
for(const slug of industrySlugs){
 assert.equal(renderToStaticMarkup(<IndustryIcon title="English" href={`/industries/${slug}/`}/>),renderToStaticMarkup(<IndustryIcon title="العربي" href={`/ar/industries/${slug}/`}/>));
 const snapshot=(locale:string)=>JSON.parse(readFileSync(`docs/section-imagery-preview/owner-batch/${slug}-${locale}.html`,'utf8').match(/<script id="review-data" type="application\/json">([\s\S]*?)<\/script>/)![1]).snapshot.industryDetail;
 const ar=snapshot('ar'),en=snapshot('en');
 const before=JSON.stringify(ar),refined=refineArabicIndustryCopy(ar);
 assert.equal(JSON.stringify(ar),before);
 assert.deepEqual(refined.sections.map(s=>[s.id,s.type,s.items.length]),ar.sections.map((s:any)=>[s.id,s.type,s.items.length]));
 assert.equal(refineArabicIndustryCopy(en),en);
 assert(refined.sections.filter(s=>s.type==='needs').every(s=>s.body.includes('\n\n')));
 const section=synchronizeIndustryServices(ar).sections.find(s=>s.type==='services')!;
 assert.equal(section.listLabel,'كيف نساعد نشاطك');assert.notEqual(section.actionLabel,section.listLabel);
 assert.equal(section.items.length,8);assert(section.items.every(i=>i.destination?.startsWith('/ar/services/')));
 const synced=synchronizeIndustryMedia(ar,en);assert.equal(synced.hero.media.mediaId,en.hero.media.mediaId);
 assert.equal(synced.hero.media.alt,ar.hero.media.alt);
}
console.log('PASS: 14 bilingual icon pairs, 14 service lists and 14 corresponding hero media placements.');
