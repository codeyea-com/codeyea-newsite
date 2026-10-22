import test from 'node:test';
import assert from 'node:assert/strict';
import {breadcrumbSchema} from '../src/content/breadcrumbs';
import {documentStructuredSchema,jsonLdText,publicPageSchema} from '../src/content/structured-data';
import {englishPageIds} from '../src/content/industry-registry';
import {documentSlugs,documentPath,pagePath} from '../src/content/site-routes';
import {conceptCaseStudies} from '../src/content/concept-case-studies';

test('all 76 internal public routes have unique canonical localized breadcrumb paths',()=>{
 for(const locale of ['en','ar']){
  const prefix=locale==='ar'?'/ar':'';
  const paths=[...englishPageIds.filter(id=>id!=='homepage').map(id=>pagePath((locale==='ar'?'ar-':'')+id)!),...documentSlugs.map(s=>documentPath(s,locale)!),prefix+'/case-studies/',...conceptCaseStudies.map(c=>prefix+'/case-studies/'+c.slug+'/')];
  assert.equal(paths.length,38);
  const available=new Set([prefix+'/',...paths]);
  for(const path of paths){
   const schema=breadcrumbSchema(path,'Project name')!;
   assert.equal(schema['@type'],'BreadcrumbList');
   assert.ok(schema.itemListElement.length>=2);
   assert.equal(schema.itemListElement[0].name,locale==='ar'?'الرئيسية':'Home');
   assert.equal(schema.itemListElement.at(-1)!.item,'https://www.codeyea.com'+path);
   assert.equal(new Set(schema.itemListElement.map(x=>x.item)).size,schema.itemListElement.length);
   for(const [i,item] of schema.itemListElement.entries()){
    assert.equal(item.position,i+1);
    assert.ok(available.has(new URL(item.item).pathname),item.item);
    assert.ok(item.name.trim());
    assert.notEqual(item.name,'Ar');
   }
  }
 }
});
test('services, hosting and sectors use real parent sections and catalogue names',()=>{
 assert.deepEqual(breadcrumbSchema('/ar/services/website-design/','ignored')!.itemListElement.map(x=>x.name),['الرئيسية','الخدمات','تصميم وتطوير المواقع']);
 assert.deepEqual(breadcrumbSchema('/wordpress-hosting/','ignored')!.itemListElement.map(x=>x.name),['Home','Website Hosting','WordPress Hosting']);
 assert.deepEqual(breadcrumbSchema('/ar/industries/solar-energy/','ignored')!.itemListElement.map(x=>x.name),['الرئيسية','القطاعات','الطاقة الشمسية']);
 assert.deepEqual(breadcrumbSchema('/industries/beauty-skincare-med-spa/','ignored')!.itemListElement.map(x=>x.name),['Home','Industries','Beauty, Skincare & Med Spa']);
});
test('case studies retain project names and their index parent',()=>{
 assert.deepEqual(breadcrumbSchema('/ar/case-studies/velora-skin-clinic/','Velora | CODEYEA')!.itemListElement.map(x=>x.name),['الرئيسية','دراسات الحالة','Velora']);
});
test('home pages do not invent breadcrumbs and JSON-LD safely escapes content',()=>{
 assert.equal(breadcrumbSchema('/','Home'),undefined);
 assert.equal(breadcrumbSchema('/ar/','الرئيسية'),undefined);
 assert.ok(!jsonLdText(breadcrumbSchema('/case-studies/example/','</script><script>')).includes('<'));
});
test('both existing schema generators emit exactly one corrected breadcrumb',()=>{
 for(const locale of ['en','ar'])for(const slug of documentSlugs){
  const graph=documentStructuredSchema(slug,'SEO title | CODEYEA','Description',locale)!['@graph'];
  assert.equal(graph.filter(x=>x['@type']==='BreadcrumbList').length,1);
  assert.deepEqual(graph.find(x=>x['@type']==='BreadcrumbList'),breadcrumbSchema(documentPath(slug,locale)!,'SEO title | CODEYEA'));
 }
 const graph=publicPageSchema('/ar/industries/roofing/','Title','Description')['@graph'];
 assert.equal(graph.filter(x=>x['@type']==='BreadcrumbList').length,1);
});
