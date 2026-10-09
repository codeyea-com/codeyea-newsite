import {test} from 'node:test';
import assert from 'node:assert/strict';
import {industrySlugs} from '../src/content/industry-registry';
import {industryDetailSchema} from '../src/schemas/industry-detail';
import {roofingHubFixture} from './fixtures/roofing-hub';

test('all industry drafts retain image and section visibility choices',()=>{
 for(const slug of industrySlugs){
  const draft=roofingHubFixture();
  draft.slug=slug;
  draft.sections.forEach(section=>section.id=slug+'-'+section.type);
  draft.hero.enabled=false;
  const needs=draft.sections.find(section=>section.type==='needs')!;
  needs.enabled=false;
  needs.pillarMedia={...draft.hero.media,alt:'Independent pillars background'};
  const saved=industryDetailSchema.parse(draft);
  assert.equal(saved.hero.enabled,false);
  assert.equal(saved.sections.find(section=>section.type==='needs')?.enabled,false);
  assert.equal(saved.sections.find(section=>section.type==='needs')?.pillarMedia?.alt,'Independent pillars background');
  assert.equal(saved.sections.find(section=>section.type==='strip')?.items.every(item=>Boolean(item.media)),true);
 }
});

test('older industry drafts remain valid without new fields',()=>{
 const draft=roofingHubFixture();
 delete draft.hero.enabled;
 delete draft.sections.find(section=>section.type==='needs')!.pillarMedia;
 assert.equal(industryDetailSchema.safeParse(draft).success,true);
});
