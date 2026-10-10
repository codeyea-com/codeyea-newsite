import {assertTestEnvironment} from '../scripts/test-environment';assertTestEnvironment();
import {test,after} from 'node:test';import assert from 'node:assert/strict';import {randomUUID} from 'node:crypto';
import {db} from '../src/server/db';import {initializeServices,saveDraft,restoreDraft} from '../src/server/content';import {defaultServices} from '../src/content/services-defaults';import {defaultIndustries} from '../src/content/industries-defaults';import {servicesPageSchema} from '../src/schemas/services-page';import {snapshotSchema} from '../src/schemas/content';import {publishDraft} from '../src/server/publishing';
after(async()=>db.$disconnect());
test('Services contract preserves eight sections, bounded collections, unique IDs and nullable safe routes',()=>{
 const content=defaultServices('en','global',defaultIndustries('en','global').hero.media);
 assert.equal(content.sections.length,8);assert.deepEqual(content.sections.map(s=>s.items.length),[4,4,2,8,3,4,8,0]);assert.equal(content.sections[0].outcomes.length,4);
 assert.deepEqual(content.sections[1].items.map(i=>i.destination),['/ai-automation/','/seo-geo/','/web-mobile-apps/','/ecommerce/']);
 assert.deepEqual(content.sections[3].items.map(i=>i.destination),['/ai-automation/','/seo-geo/','/web-mobile-apps/','/ecommerce/','/website-design/','/digital-marketing/','/brand-design/','/brand-design/']);
 const bad=structuredClone(content);bad.sections.reverse();assert.equal(servicesPageSchema.safeParse(bad).success,false);
 const duplicate=structuredClone(content);duplicate.sections[1].items[1].id=duplicate.sections[1].items[0].id;assert.equal(servicesPageSchema.safeParse(duplicate).success,false);
 const route=structuredClone(content);route.sections[1].items[0].destination='javascript:alert(1)';assert.equal(servicesPageSchema.safeParse(route).success,false);
 assert.equal(snapshotSchema.safeParse({title:'Services',servicesPage:content,industriesPage:defaultIndustries('en','global'),sections:[]}).success,false);
});
test('Services authenticated initialize/save/conflict/restore/audit remain independent and unpublished',async()=>{
 const id='services-editor-'+randomUUID(),roleId=id+'-role';const home=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 await db.role.create({data:{id:roleId,name:roleId,permissions:{create:[{permissionId:'edit_pages'}]}}});await db.user.create({data:{id,email:id+'@example.test',name:'Services editor',roles:{create:{roleId}}}});
 try{
  await assert.rejects(()=>initializeServices(null),/Unauthorized/);const page=await initializeServices(id);assert.equal(page.publishedSnapshot,null);assert.equal((await initializeServices(id)).version,page.version);
  const original=snapshotSchema.parse(page.draftSnapshot),changed=structuredClone(original);changed.servicesPage!.sections[0].heading='An edited private introduction';
  const alteredIdentity=structuredClone(original);alteredIdentity.servicesPage!.sections[1].items[0].id='replacement-item';await assert.rejects(()=>saveDraft(id,{...alteredIdentity,pageId:'services',expectedVersion:page.version}),/identities/);
  changed.servicesPage!.sections[2].items.push({id:'services-strategy-partner',label:'Your Digital Growth Partner',title:'Your Digital Growth Partner',body:'Approved partner copy',list:[],destination:'https://codeyea.com/contact/',actionLabel:'Let’s Talk'});
  const invalidPartner=structuredClone(changed);invalidPartner.servicesPage!.sections[2].items[2].id='unapproved-partner';assert.equal(snapshotSchema.safeParse(invalidPartner).success,false);
  const update=await saveDraft(id,{...changed,pageId:'services',expectedVersion:page.version});assert.equal(update.version,page.version+1);assert.equal(update.publishedSnapshot,null);assert.equal(snapshotSchema.parse(update.draftSnapshot).servicesPage!.sections[2].items.length,3);
  await assert.rejects(()=>saveDraft(id,{...original,pageId:'services',expectedVersion:page.version}),/changed/);
  await assert.rejects(()=>saveDraft(id,{...original,pageId:'homepage',expectedVersion:home.version}),/match/);
  await assert.rejects(()=>publishDraft(id,{pageId:'services',expectedVersion:update.version}),/Forbidden|permission/i);
  const revision=await db.pageRevision.findFirstOrThrow({where:{pageId:'services',version:page.version}});const restored=await restoreDraft(id,{pageId:'services',revisionId:revision.id,expectedVersion:update.version});assert.deepEqual(restored.draftSnapshot,original);assert.equal(restored.publishedSnapshot,null);
  assert.ok(await db.auditLog.count({where:{entityId:'services',actorId:id,action:'page.draft_saved'}}));const after=await db.page.findUniqueOrThrow({where:{id:'homepage'}});assert.deepEqual(after.draftSnapshot,home.draftSnapshot);assert.deepEqual(after.publishedSnapshot,home.publishedSnapshot);
 }finally{await db.pageRevision.deleteMany({where:{pageId:'services'}});await db.auditLog.deleteMany({where:{actorId:id}});await db.page.deleteMany({where:{id:'services'}});await db.userRole.deleteMany({where:{userId:id}});await db.user.delete({where:{id}});await db.rolePermission.deleteMany({where:{roleId}});await db.role.delete({where:{id:roleId}});}
});

test('Approved Services presentation keeps stable records while showing two indicators and three outcome rows',()=>{
 const content=defaultServices('en','global',defaultIndustries('en','global').hero.media);
 content.sections[0].outcomes.forEach((item,index)=>{item.enabled=index<2});
 content.sections[5].items.forEach((item,index)=>{item.enabled=index<3});
 const parsed=servicesPageSchema.parse(content);
 assert.equal(parsed.sections[0].outcomes.filter(i=>i.enabled!==false).length,2);
 assert.equal(parsed.sections[5].items.filter(i=>i.enabled!==false).length,3);
 assert.deepEqual(parsed.sections[0].outcomes.map(i=>i.id),content.sections[0].outcomes.map(i=>i.id));
 assert.equal(servicesPageSchema.safeParse({...content,sections:content.sections.map((s,n)=>n===5?{...s,items:s.items.slice(0,3)}:s)}).success,false);
 const invalid=structuredClone(content) as any;invalid.sections[0].outcomes[0].enabled='false';
 assert.equal(servicesPageSchema.safeParse(invalid).success,false);
});
