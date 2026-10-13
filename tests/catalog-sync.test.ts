import test from 'node:test';
import assert from 'node:assert/strict';
import { serviceCatalog } from '../src/content/service-catalog';
import { industryServiceCatalog } from '../src/content/industry-service-catalog';
import { completeServiceItems, synchronizeIndustryServices } from '../src/content/synchronized-service-lists';
import { approvedMenuContent } from '../src/content/approved-navigation';
import { defaultIndustries } from '../src/content/industries-defaults';
import { defaultServices } from '../src/content/services-defaults';
import { industrySlugs } from '../src/content/industry-registry';
import { industryPageDestination } from '../src/content/service-destinations';
import { enabledItems } from '../src/schemas/homepage-editor';
import { industryDetailSchema } from '../src/schemas/industry-detail';
import { arabicText } from '../src/content/arabic-localization';
import fallback from '../src/content/approved-industries-fallbacks.json';
const sorted=(items:readonly string[])=>[...items].sort();
const expected=sorted(serviceCatalog.map(s=>`/${s.slug}/`));
const menuRoot={id:'services',title:'Services',href:'/services/',enabled:true,position:0};

test('all complete service surfaces use eight unique services in both languages',()=>{
 for(const locale of ['en','ar']){
  const prefix=locale==='ar'?'/ar':'';
  const menu=enabledItems(approvedMenuContent({items:[menuRoot]},'public',locale).items).filter(i=>i.parentId==='services');
  const complete=completeServiceItems(locale);
  assert.deepEqual(sorted(menu.map(i=>String(i.href))),expected.map(p=>prefix+p));
  assert.deepEqual(sorted(complete.map(i=>i.destination!)),expected.map(p=>prefix+p));
  for(const s of serviceCatalog){
   assert.equal(complete.find(i=>i.destination===`${prefix}/${s.slug}/`)?.title,locale==='ar'?s.ar:s.title);
   assert.equal(menu.find(i=>i.href===`${prefix}/${s.slug}/`)?.title,locale==='ar'?s.ar:s.title);
  }
 }
 assert.deepEqual(sorted(industryServiceCatalog.map(i=>i[2])),expected);
});

test('saved partial menus preserve owner labels and include missing implemented services',()=>{
 const content={items:[menuRoot,{id:'site',parentId:'services',title:'Owner website label',href:'/website-design/',enabled:true,position:1}]};
 const before=JSON.stringify(content);
 const menu=enabledItems(approvedMenuContent(content,'public').items).filter(i=>i.parentId==='services');
 assert.equal(menu.length,8);
 assert.equal(menu.find(i=>i.href==='/website-design/')?.title,'Owner website label');
 assert.deepEqual(sorted(menu.map(i=>String(i.href))),expected);
 assert.equal(JSON.stringify(content),before);
});

test('industry navigation normalizes trailing slashes and removes duplicate destinations',()=>{
 const root={id:'industries',title:'Industries',href:'/industries/',enabled:true,position:0};
 const content={items:[root,{id:'solar',title:'Solar Energy',href:'/industries/solar-energy/',parentId:'industries',enabled:true,position:1},{id:'solar-copy',title:'Solar Energy',href:'/preview/industries/solar-energy',parentId:'industries',enabled:true,position:2}]};
 for(const locale of ['en','ar']){
  const menu=enabledItems(approvedMenuContent(content,'public',locale).items).filter(i=>i.parentId==='industries');
  assert.equal(menu.length,industrySlugs.length);
  assert.deepEqual(sorted(menu.map(i=>String(i.href))),sorted(industrySlugs.map(s=>`${locale==='ar'?'/ar':''}/industries/${s}/`)));
 }
});

test('every registered industry appears in the shared directory used by related lists',()=>{
 const items=defaultIndustries('en','global').items;
 assert.equal(items.length,industrySlugs.length);
 assert.deepEqual(sorted(items.map(i=>i.destination||industryPageDestination(i.title)!)),sorted(industrySlugs.map(s=>`/industries/${s}/`)));
});

test('all industry fallbacks share service identities without changing section layout or source content',()=>{
 for(const data of Object.values(fallback.details)){
  for(const locale of ['en','ar']){
   const source=industryDetailSchema.parse({...data,localeId:locale});
   const before=JSON.stringify(source),next=synchronizeIndustryServices(source);
   assert.equal(JSON.stringify(source),before);
   const services=next.sections.find(s=>s.type==='services')!;
   assert.equal(services.items.length,8);
   assert.equal(new Set(services.items.map(i=>i.id)).size,8);
   assert.deepEqual(sorted(services.items.map(i=>i.destination)),expected.map(p=>(locale==='ar'?'/ar':'')+p));
   source.sections.forEach((section,index)=>{if(section.type!=='services')assert.deepEqual(next.sections[index],section);});
   assert.doesNotThrow(()=>industryDetailSchema.parse(next));
  }
 }
});

test('the Services page contains support once and combined brand design once',()=>{
 const directory=defaultIndustries('en','global');
 const page=defaultServices('en','global',directory.hero.media);
 const complete=page.sections.find(s=>s.id==='services-complete')!;
 assert.equal(complete.items.filter(i=>i.destination==='/brand-design/').length,1);
 assert.equal(complete.items.filter(i=>i.destination==='/technical-support/').length,1);
 assert.deepEqual(sorted(complete.items.map(i=>i.destination!)),expected);
 for(const service of serviceCatalog){
  assert.equal(arabicText(service.title),service.ar);
  assert.equal(arabicText(service.body),service.bodyAr);
 }
});
