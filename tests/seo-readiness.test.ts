import {test} from 'node:test';
import assert from 'node:assert/strict';
import {canonical,publicRobots,resolveSeoText} from '../src/content/seo';
import {industryDestination} from '../src/content/industry-destinations';
import {publishedPagePaths} from '../src/content/site-routes';
import robots from '../src/app/robots';
import {extractFields,renderDocument,templateContent} from '../src/server/site-documents';
import {pageMetadata,commercialProductSchema,publicPageSchema,homeSchema} from '../src/content/structured-data';

test('canonical URLs use the intended public origin and one path',()=>{
 assert.equal(canonical('/'),'https://codeyea.com/');
 assert.equal(canonical('/services/'),'https://codeyea.com/services/');
 assert.equal(canonical('/industries/roofing/'),'https://codeyea.com/industries/roofing/');
});

test('page metadata consistently emits canonical Open Graph and Twitter tags',()=>{
 const metadata=pageMetadata('/services/','Digital Services | CODEYEA','Digital services for growing businesses.');
 assert.equal(metadata.alternates?.canonical,'https://codeyea.com/services/');
 assert.equal(metadata.openGraph?.url,'https://codeyea.com/services/');
 assert.equal(metadata.openGraph?.siteName,'CODEYEA');
 assert.deepEqual(metadata.twitter,{card:'summary',title:'Digital Services | CODEYEA',description:'Digital services for growing businesses.'});
 const schema=publicPageSchema('/about/','About CODEYEA','Our story.','AboutPage');
 const breadcrumb=schema['@graph'].find((item)=>item['@type']==='BreadcrumbList');
 assert.deepEqual(breadcrumb?.itemListElement?.map((x:{name:string})=>x.name),['Home','About']);
 assert.equal((homeSchema('Homepage title','Homepage description')['@graph'][1] as {name:string}).name,'CODEYEA');
});

test('commercial product schema describes purchase pages without invented prices or ratings',()=>{
 for(const slug of ['website-hosting','wordpress-hosting','cloud-hosting','email-hosting','domains','technical-support']){
  const schema=commercialProductSchema(slug,'CODEYEA '+slug,'Description for '+slug,'/preview/pages/'+slug);
  assert.ok(schema);
  assert.equal(schema['@type'],'Product');
  assert.ok(schema.name);
  assert.equal('offers' in schema,false);
  assert.equal('aggregateRating' in schema,false);
 }
 assert.equal(commercialProductSchema('contact','Contact','Contact us','/contact/'),undefined);
});

test('saved SEO text overrides defaults while blank values keep safe defaults',()=>{
 const fallback={title:'Fallback title',description:'Fallback description'};
 assert.deepEqual(resolveSeoText({title:'Custom search title',description:'Custom search description'},fallback),{title:'Custom search title',description:'Custom search description'});
 assert.deepEqual(resolveSeoText({title:'  ',description:''},fallback),fallback);
});

test('industry links activate only for published destinations',()=>{
 const destination='/industries/roofing/';
 assert.equal(industryDestination(destination,new Set()),undefined);
 assert.equal(industryDestination(destination,new Set([destination])),destination);
});

test('published internal links use the actual nested industry route and skip private pages',()=>{
 const publishedAt=new Date('2026-10-07T12:00:00Z');
 assert.deepEqual(publishedPagePaths([
  {id:'roofing',publishedAt,publishedSnapshot:{}},
  {id:'services',publishedAt,publishedSnapshot:{}},
  {id:'healthcare',publishedAt:null,publishedSnapshot:{}},
  {id:'unknown',publishedAt,publishedSnapshot:{}},
 ]),['/industries/roofing/','/services/']);
});

test('robots excludes private route roots and their descendants',()=>{
 const rules=robots().rules;
 assert.equal(Array.isArray(rules),false);
 assert.deepEqual((rules as {disallow:string[]}).disallow,['/admin','/login','/preview','/api']);
});

test('private imported previews keep one robots tag and one editable description',async()=>{
 const source=await templateContent('website-design');
 const html=await renderDocument('website-design',{fields:extractFields(source),description:'Custom website design and development for businesses.'},'en','Website Design');
 assert.equal([...html.matchAll(/<meta\s+name="robots"/gi)].length,1);
 assert.equal([...html.matchAll(/<meta\s+name="description"/gi)].length,1);
 assert.match(html,/<meta name="description" content="Custom website design and development for businesses\."/);
 assert.equal([...html.matchAll(/property="og:title"/gi)].length,1);
 assert.equal([...html.matchAll(/name="twitter:card"/gi)].length,1);
 assert.equal([...html.matchAll(/application\/ld\+json/gi)].length,1);
});

test('commercial preview templates include Product JSON-LD while remaining noindex',async()=>{
 for(const slug of ['website-hosting','wordpress-hosting','cloud-hosting','email-hosting','domains','technical-support']){
  const source=await templateContent(slug);
  const html=await renderDocument(slug,{fields:extractFields(source),description:'Current offer details are managed in the CMS.'},'en','CODEYEA '+slug);
  assert.match(html,/<meta name="robots" content="noindex,nofollow">/);
  assert.equal([...html.matchAll(/application\/ld\+json/gi)].length,1,slug);
  const raw=html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
  const graph=JSON.parse(raw??'{}')['@graph'] as Record<string,unknown>[];
  const product=graph.find((item)=>item['@type']==='Product');
  assert.ok(product,slug);
  assert.equal('offers' in product,false,slug);
 }
});

test('publication alone cannot expose pages to indexing before the launch switch',()=>{
 const previous=process.env.SITE_INDEXING_ENABLED;
 try{
  delete process.env.SITE_INDEXING_ENABLED;
  assert.deepEqual(publicRobots(true),{index:false,follow:false});
  process.env.SITE_INDEXING_ENABLED='true';
  assert.deepEqual(publicRobots(false),{index:false,follow:false});
  assert.deepEqual(publicRobots(true),{index:true,follow:true});
 }finally{
  if(previous===undefined)delete process.env.SITE_INDEXING_ENABLED;
  else process.env.SITE_INDEXING_ENABLED=previous;
 }
});
