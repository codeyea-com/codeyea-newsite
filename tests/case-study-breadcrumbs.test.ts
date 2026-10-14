import test from 'node:test';
import assert from 'node:assert/strict';
import {caseStudyResponse} from '../src/server/public-case-study';
import {conceptCaseStudies} from '../src/content/concept-case-studies';
import {GET} from '../src/app/api/site-language/route';

test('all 14 public case pages emit one breadcrumb, retain noindex, and use only the shared language slot',async()=>{
 for(const locale of ['en','ar'] as const)for(const slug of ['',...conceptCaseStudies.map(c=>c.slug)]){
  const response=await caseStudyResponse(slug?[slug]:[],locale);
  const html=await response.text();
  const scripts=[...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  assert.equal(response.status,200);
  assert.equal(response.headers.get('x-robots-tag'),'noindex, nofollow');
  assert.equal(scripts.length,1);
  assert.equal(scripts[0]['@type'],'BreadcrumbList');
  assert.equal(scripts[0].itemListElement.length,slug?3:2);
  assert.ok(html.includes('class="cy-language-slot"'));
  assert.doesNotMatch(html.match(/<main\b[\s\S]*?<\/main>/)![0], /<a\b[^>]*>\s*(English|العربية)\s*<\/a>/);
 }
});
test('shared language switch resolves the matching case and keeps the existing country rule',async()=>{
 for(const locale of ['en','ar'])for(const slug of ['',...conceptCaseStudies.map(c=>c.slug)]){
  const suffix='/case-studies/'+(slug?slug+'/':'');
  const path=(locale==='ar'?'/ar':'')+suffix;
  const data=await (await GET(new Request('https://codeyea.com/api/site-language?path='+encodeURIComponent(path),{headers:{'x-vercel-ip-country':'IQ'}}))).json();
  assert.deepEqual(data,{enabled:true,href:(locale==='en'?'/ar':'')+suffix,label:locale==='en'?'العربية':'English'});
 }
 const blocked=await (await GET(new Request('https://codeyea.com/api/site-language?path=/case-studies/',{headers:{'x-vercel-ip-country':'US'}}))).json();
 assert.deepEqual(blocked,{enabled:false});
 const missing=await (await GET(new Request('https://codeyea.com/api/site-language?path=/case-studies/not-real/',{headers:{'x-vercel-ip-country':'IQ'}}))).json();
 assert.equal(missing.enabled,false);
});
