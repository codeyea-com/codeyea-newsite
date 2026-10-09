import {test} from 'node:test';
import assert from 'node:assert/strict';
import {buildPageCatalog} from '../src/content/page-catalog';
import {publishedDocumentSitemap} from '../src/server/site-index';

test('page catalog includes registered routes, localized documents, and honest publication states',()=>{
 const catalog=buildPageCatalog({
  pages:[{id:'homepage',title:'Home',publishedAt:new Date('2026-10-01'),publishedSnapshot:{title:'Home'},updatedAt:new Date('2026-10-02')},{id:'about',title:'About',publishedAt:new Date('2026-10-03'),publishedSnapshot:null,updatedAt:new Date('2026-10-03')}],
  documents:[{id:'doc-en',slug:'website-design',title:'Website design',locale:'en',published:{title:'Published'},updatedAt:new Date('2026-10-04')},{id:'doc-ar',slug:'website-design',title:'تصميم المواقع',locale:'ar',published:null,updatedAt:new Date('2026-10-05')},{id:'doc-custom',slug:'unmapped',title:'Unmapped',locale:'en',published:null,updatedAt:new Date('2026-10-06')}],
 });
 assert.deepEqual(catalog.filter(x=>x.source==='page').slice(0,4).map(x=>[x.id,x.path,x.status]),[
  ['homepage','/','Published'],['about','/about/','Draft'],['services','/services/','Missing CMS record'],['industries','/industries/','Missing CMS record'],
 ]);
 assert.ok(catalog.some(x=>x.id==='healthcare'&&x.path==='/industries/healthcare/'));
 assert.deepEqual(catalog.filter(x=>['doc-en','doc-ar','doc-custom'].includes(x.id)).map(x=>[x.id,x.path,x.status]),[
  ['doc-en','/website-design/','Published'],['doc-ar','/ar/website-design/','Draft'],['doc-custom',null,'Route mapping needed'],
 ]);
 assert.equal(catalog.filter(x=>x.id.startsWith('template:')).length,26);
 assert.ok(catalog.some(x=>x.id==='template:email-hosting:en'&&x.path==='/email-hosting/'&&x.status==='Missing CMS record'));
 assert.ok(catalog.some(x=>x.id==='template:email-hosting:ar'&&x.path==='/ar/email-hosting/'&&x.status==='Missing CMS record'));
 assert.equal(catalog.some(x=>x.path?.startsWith('/admin')||x.path?.startsWith('/preview')),false);
});

test('unknown and unsupported public paths never enter the CMS route catalog',()=>{
 const catalog=buildPageCatalog({pages:[{id:'../admin',title:'Bad',publishedAt:new Date(),updatedAt:new Date()}],documents:[{id:'1',slug:'../../admin',title:'Bad',locale:'en',published:{},updatedAt:new Date()},{id:'2',slug:'contact',title:'Contact post',locale:'en',kind:'post',published:{},updatedAt:new Date()}]});
 assert.equal(catalog.some(x=>x.id==='1'||x.id==='2'||x.path?.includes('admin')),false);
 assert.ok(catalog.some(x=>x.id==='homepage'&&x.status==='Missing CMS record'));
});

test('only published, registered, indexable template pages enter the sitemap',()=>{
 const lastModified=new Date('2026-10-07T10:00:00Z');
 const entries=publishedDocumentSitemap([
  {slug:'website-design',locale:'en',published:{content:{seo:{index:true}}},updatedAt:lastModified},
  {slug:'website-design',locale:'ar',published:{content:{seo:{index:false}}},updatedAt:lastModified},
  {slug:'unmapped',locale:'en',published:{content:{seo:{}}},updatedAt:lastModified},
  {slug:'contact',locale:'en',published:null,updatedAt:lastModified},
 ]);
 assert.deepEqual(entries.map(entry=>entry.url),['https://codeyea.com/website-design/']);
});
