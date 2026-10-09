import {test} from 'node:test';
import assert from 'node:assert/strict';
import {publishedSitemap} from '../src/server/site-index';
import {documentPath,pagePath} from '../src/content/site-routes';
import {bindTemplate,extractFields} from '../src/server/site-documents';

test('sitemap includes valid published routes and excludes drafts, deleted, unknown and mismatched content',()=>{
 const publishedSnapshot={title:'Home',sections:[{id:'intro',type:'positioning',heading:'Welcome',body:'Hello'}]};
 const home={id:'homepage',publishedAt:new Date('2026-09-27'),publishedSnapshot};
 const result=publishedSitemap([home,{...home,id:'about'},{...home,id:'contact'},{...home,publishedAt:null},{...home,deletedAt:new Date()},{...home,publishedSnapshot:{}}]);
 assert.deepEqual(result,[{url:'https://codeyea.com/',lastModified:home.publishedAt}]);
 assert.equal(documentPath('contact','ar'),'/ar/contact/');
 assert.equal(documentPath('missing'),null);
 assert.equal(documentPath('contact','fr'),null);
 assert.equal(pagePath('../admin'),null);
});

test('template binding rejects content drift but permits header changes and text edits',()=>{
 const html='<header>Navigation</header><main><h1>Title</h1><p>Body</p></main>';
 const legacy={fields:extractFields(html),description:''};
 const bound=bindTemplate(html,legacy);
 assert.equal(bindTemplate(html.replace('Navigation','Updated menu'),bound).templateHash,bound.templateHash);
 assert.doesNotThrow(()=>bindTemplate(html,{...bound,fields:bound.fields.map(f=>({...f,value:'Edited'}))}));
 assert.throws(()=>bindTemplate(html.replace('<h1>Title</h1>','<h1>Changed</h1>'),bound));
 assert.throws(()=>bindTemplate(html,{...bound,fields:[]}));
 assert.throws(()=>bindTemplate(html,{...legacy,fields:[...legacy.fields].reverse()}));
});
