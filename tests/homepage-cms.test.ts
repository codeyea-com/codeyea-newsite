import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {db} from '../src/server/db';
import {Prisma} from '../src/generated/prisma/client';
import {defaultHomepage} from '../src/content/homepage-defaults';
import {homepageEditorSchema,homepageEditorSections,type EditorObject} from '../src/schemas/homepage-editor';
import {saveDraft,restoreDraft} from '../src/server/content';
import {publishDraft} from '../src/server/publishing';
const key=randomUUID(),actor='full-owner-'+key,pageId='full-home-'+key;
const original={title:'Full homepage fixture',sections:[{id:'position-'+key,type:'positioning' as const,heading:'Original positioning',body:'Original body'}]};
let version=1;
before(async()=>{await db.user.create({data:{id:actor,name:'Isolated full homepage reviewer',email:actor+'@example.test',roles:{create:{roleId:'administrator'}}}});await db.page.create({data:{id:pageId,slug:pageId,title:original.title,localeId:'en',marketId:'global',publishedSnapshot:original,sections:{create:{...original.sections[0],position:0}}}});});
after(async()=>{await db.auditLog.deleteMany({where:{entityId:pageId}});await db.page.delete({where:{id:pageId}});await db.user.delete({where:{id:actor}});await db.$disconnect();});
test('every section type saves in a complete private snapshot with stable collection identities',async()=>{
 const homepage=defaultHomepage() as unknown as Record<string,EditorObject>;for(const section of homepageEditorSections.filter(s=>s.key!=='positioning')){const object=homepage[section.key];const field=section.fields.find(f=>f.type==='text'||f.type==='copy');if(field)object[field.key]=String(object[field.key])+' review';else{const collection=section.fields.find(f=>f.type==='collection');if(collection){const first=(object[collection.key] as EditorObject[])[0];first.title=String(first.title)+' review';}}}
 homepage.hero.prefix=String(homepage.hero.prefix)+' — مراجعة';
 // Billing labels and textual section fields change; commercial values stay intact.
 const services=(homepage.services.items as EditorObject[]);const ids=services.map(s=>s.id);services.reverse().forEach((s,i)=>s.position=i);services[0].enabled=false;
 (homepage.about.media as EditorObject).mediaId='office';(homepage.about.media as EditorObject).alt='Office review';
 const saved=await saveDraft(actor,{...original,homepage,pageId,expectedVersion:version});version=saved.version;
 assert.deepEqual(saved.publishedSnapshot,original);const snapshot=saved.draftSnapshot as unknown as {homepage:Record<string,EditorObject>};assert.deepEqual((snapshot.homepage.services.items as EditorObject[]).map(s=>s.id),ids.reverse());assert.equal((snapshot.homepage.about.media as EditorObject).mediaId,'office');
 await assert.rejects(()=>saveDraft(actor,{...original,pageId,expectedVersion:version}),/Complete homepage/);
 await assert.rejects(()=>saveDraft(actor,{...original,homepage,pageId,expectedVersion:1}),/changed/);
});
test('bounded content rejects unsafe links, asset paths, duplicate IDs, parent cycles and invalid hosting contracts',()=>{
 const change=(fn:(v:Record<string,EditorObject>)=>void)=>{const value=defaultHomepage() as unknown as Record<string,EditorObject>;fn(value);assert.equal(homepageEditorSchema.safeParse(value).success,false);};
 change(v=>v.hero.ctaHref='javascript:alert(1)');change(v=>(v.hero.media as EditorObject).mediaId='../../secret');change(v=>(v.services.items as EditorObject[])[1].id=(v.services.items as EditorObject[])[0].id);change(v=>(v.header.items as EditorObject[])[0].parentId=(v.header.items as EditorObject[])[0].id);change(v=>(v.hosting.plans as EditorObject[])[0].monthlyPrice='-10');change(v=>(v.hosting.plans as EditorObject[])[0].annualUnit='/week');change(v=>(v.hosting.plans as EditorObject[])[0].values=[]);change(v=>(v.services.items as EditorObject[])[0].localeId='other');change(v=>v.footer.background='custom.css');
});
test('whole homepage publication rolls back on audit failure then publishes atomically and restores as a private revision',async()=>{
 const before=await db.page.findUniqueOrThrow({where:{id:pageId}});const constraint='full_fail_'+key.replaceAll('-','');await db.$executeRawUnsafe(`ALTER TABLE "AuditLog" ADD CONSTRAINT "${constraint}" CHECK ("entityId" <> '${pageId}' OR action <> 'page.published') NOT VALID`);
 try{await assert.rejects(()=>publishDraft(actor,{pageId,expectedVersion:version}));}finally{await db.$executeRawUnsafe(`ALTER TABLE "AuditLog" DROP CONSTRAINT "${constraint}"`);}
 assert.deepEqual(await db.page.findUniqueOrThrow({where:{id:pageId}}),before);assert.equal(await db.pagePublication.count({where:{pageId}}),0);
 const published=await publishDraft(actor,{pageId,expectedVersion:version});version=published.version;const page=await db.page.findUniqueOrThrow({where:{id:pageId}});assert.deepEqual(page.publishedSnapshot,before.draftSnapshot);
 const revision=await db.pageRevision.findFirstOrThrow({where:{pageId},orderBy:{version:'asc'}});const restored=await restoreDraft(actor,{pageId,revisionId:revision.id,expectedVersion:version});version=restored.version;assert.deepEqual(restored.publishedSnapshot,page.publishedSnapshot);assert.deepEqual(restored.draftSnapshot,original);
});
