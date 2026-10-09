import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roofingHubFixture} from './fixtures/roofing-hub';
import {newIndustryContracts,newIndustrySnapshot} from '../src/content/new-industry-defaults';
import {industrySlugs} from '../src/content/industry-registry';

test('new industry contracts retain the frozen structure, local media and approved content',()=>{
 const detail=roofingHubFixture();
 const services=detail.sections.find(s=>s.type==='services')!;
 while(services.items.length<8)services.items.push({...services.items[0],id:`roofing-services-${services.items.length+1}`});
 detail.sections.find(s=>s.type==='faq')!.items=detail.sections.find(s=>s.type==='faq')!.items.slice(0,5);
 const template={title:'Roofing',sections:[],industryDetail:detail},before=structuredClone(template);
 for(const slug of Object.keys(newIndustryContracts) as (keyof typeof newIndustryContracts)[]){
  const result=newIndustrySnapshot(template,slug).industryDetail!,copy=newIndustryContracts[slug];
  assert.deepEqual(result.sections.map(s=>[s.type,s.enabled,s.items.length]),detail.sections.map(s=>[s.type,s.enabled,s.items.length]));
  assert.deepEqual(result.hero.media,detail.hero.media);
  assert.equal(result.hero.temporaryMedia,true);
  assert.equal(result.sections.find(s=>s.type==='overview')!.body,copy.introduction.join('\n\n'));
  assert.deepEqual(result.sections.find(s=>s.type==='faq')!.items.map(i=>[i.title,i.body]),copy.faq);
  assert.deepEqual(result.sections.find(s=>s.type==='growth')!.items.map(i=>[i.title,i.body]),copy.growth);
  assert.deepEqual(result.seo,copy.seo);
  assert.ok(result.sections.find(s=>s.type==='services')!.items.every(i=>i.destination===''));
  for(const s of result.sections)if(s.media||s.items.some(i=>i.media))assert.equal(s.temporaryMedia,true);
 }
 assert.deepEqual(template,before);
 assert.equal(industrySlugs.length,14);
});
