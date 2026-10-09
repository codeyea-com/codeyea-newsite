import {assertTestEnvironment} from '../scripts/test-environment';assertTestEnvironment();
import {registerHooks} from 'node:module';import {before,after,test} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {db} from '../src/server/db';
// Next enforces this boundary at build time; the isolated Node test runner has no client graph.
const hooks=registerHooks({resolve(specifier,context,next){return specifier==='server-only'?{url:'data:text/javascript,export{}',shortCircuit:true}:next(specifier,context)}});
const {searchStock,selectedStock,importStock}=await import('../src/server/stock/service');
const key=randomUUID(),owner='stock-owner-'+key,editor='stock-editor-'+key;const originalFetch=globalThis.fetch;const keys={pexels:process.env.PEXELS_API_KEY,pixabay:process.env.PIXABAY_API_KEY,enabled:process.env.EXTERNAL_STOCK_SEARCH_ENABLED};const cacheIds=new Set<string>();
before(async()=>{for(const [id,role] of [[owner,'administrator'],[editor,'editor']])await db.user.create({data:{id,name:id,email:id+'@example.test',roles:{create:{roleId:role}}}});process.env.PEXELS_API_KEY='test-only';process.env.PIXABAY_API_KEY='test-only';process.env.EXTERNAL_STOCK_SEARCH_ENABLED='true';});
after(async()=>{globalThis.fetch=originalFetch;for(const [name,value] of [['PEXELS_API_KEY',keys.pexels],['PIXABAY_API_KEY',keys.pixabay],['EXTERNAL_STOCK_SEARCH_ENABLED',keys.enabled]]){if(value===undefined)delete process.env[name!];else process.env[name!]=value;}await db.stockSearchCache.deleteMany({where:{id:{in:[...cacheIds]}}});await db.rateLimit.deleteMany({where:{key:{contains:key}}});await db.user.deleteMany({where:{id:{in:[owner,editor]}}});await db.$disconnect();hooks.deregister();});
const photo={id:991,width:1800,height:1200,url:'https://www.pexels.com/photo/test-991/',photographer:'Test',photographer_url:'https://www.pexels.com/@test/',src:{medium:'https://images.pexels.com/photos/991/test.jpeg',large2x:'https://images.pexels.com/photos/991/test.jpeg'}};
test('stock search and preview selection reject anonymous and insufficient permission',async()=>{await assert.rejects(searchStock(null,{query:'test'}),/Unauthorized/);await assert.rejects(searchStock(editor,{query:'test'}),/Forbidden/);await assert.rejects(selectedStock(null,'invalid'),/Unauthorized/);await assert.rejects(selectedStock(owner,'https://localhost/private'),/Invalid stock/);});
test('provider failure isolation, 24-hour durable cache and private URL exclusion',async()=>{
 let calls=0;globalThis.fetch=async url=>{calls++;return String(url).includes('pixabay.com')?new Response('credential must not escape',{status:429}):Response.json({total_results:1,photos:[photo]});};
 const input={query:'cache '+key,provider:'all',orientation:'landscape',page:1};const first=await searchStock(owner,input);assert.equal(first.results[0].photos.length,1);assert.match(first.results[1].error!,/rate limited/);assert.equal(JSON.stringify(first).includes('credential'),false);assert.equal(JSON.stringify(first).includes('images.pexels.com'),false);assert.equal(JSON.stringify(first).includes('downloadUrl'),false);
 const token=first.results[0].photos[0].token;const id=token.split(':')[0];cacheIds.add(id);const cache=await db.stockSearchCache.findUniqueOrThrow({where:{id}});assert.ok(cache.expiresAt.getTime()>Date.now()+86300000);
 const cached=await searchStock(owner,{...input,provider:'pexels'});assert.equal(calls,2);assert.equal(cached.results[0].photos[0].token,token);assert.equal((await selectedStock(owner,token)).providerId,'991');
 await db.stockSearchCache.update({where:{id},data:{expiresAt:new Date(0)}});await assert.rejects(selectedStock(owner,token),/expired/);
});
test('Pixabay cache avoids repeat API calls and independent unavailable-key state is safe',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({totalHits:1,hits:[{id:992,imageWidth:1200,imageHeight:800,pageURL:'https://pixabay.com/photos/test-992/',user:'Person',user_id:1,tags:'work',webformatURL:'https://pixabay.com/get/test_640.jpg',largeImageURL:'https://pixabay.com/get/test_1280.jpg'}]});};
 const input={query:'pixabay '+key,provider:'pixabay',orientation:'landscape',page:1};const first=await searchStock(owner,input);const id=first.results[0].photos[0].token.split(':')[0];cacheIds.add(id);await searchStock(owner,input);assert.equal(calls,1);const stored=await db.stockSearchCache.findUniqueOrThrow({where:{id}});assert.ok(stored.expiresAt.getTime()>Date.now()+86300000);
 delete process.env.PEXELS_API_KEY;const missing=await searchStock(owner,{...input,query:'missing '+key,provider:'pexels'});assert.equal(missing.results[0].error,'PEXELS_API_KEY unavailable');assert.equal(calls,1);
});
test('disabled external stock search makes zero provider requests for search and selection',async()=>{
 let calls=0;globalThis.fetch=async()=>{calls++;return Response.json({});};process.env.EXTERNAL_STOCK_SEARCH_ENABLED='false';
 try {
  await assert.rejects(searchStock(owner,{query:'paused '+key,provider:'all',orientation:'landscape',page:1}),/External stock search is paused during the design milestone/);
  await assert.rejects(selectedStock(owner,'0'.repeat(64)+':991'),/External stock search is paused during the design milestone/);
  await assert.rejects(importStock(owner,'0'.repeat(64)+':991','Temporary image','paused '+key),/External stock search is paused during the design milestone/);
  assert.equal(calls,0);
 } finally {process.env.EXTERNAL_STOCK_SEARCH_ENABLED='true';}
});
