import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {db} from '../src/server/db';
import {initializeIndustries,saveDraft,restoreDraft} from '../src/server/content';
import {defaultIndustries} from '../src/content/industries-defaults';
import {industriesPageSchema} from '../src/schemas/industries-page';
import {snapshotSchema} from '../src/schemas/content';
import {industryDestination} from '../src/content/industry-destinations';
import legacy from '../src/content/industries-initial.json';
after(async()=>{await db.$disconnect()});
test('Industries v1 revisions normalize purely to one media contract without enabling new content',()=>{
 const before=JSON.stringify(legacy);const migrated=industriesPageSchema.parse(legacy);
 assert.equal(JSON.stringify(legacy),before);assert.equal(migrated.schemaVersion,2);assert.equal(migrated.introduction.enabled,false);
 assert.equal(migrated.items[0].media.mediaId,legacy.items[0].images[0].mediaId);assert.equal(migrated.items[0].heading,legacy.items[0].title);assert.ok(!('images' in migrated.items[0]));
 const invalid={...migrated,items:[{...migrated.items[0],images:legacy.items[0].images}]};assert.ok(!industriesPageSchema.safeParse(invalid).success);
 const current=defaultIndustries('en','global');assert.equal(current.introduction.paragraphs.length,3);
 for(const item of current.items.slice(0,11)){assert.ok(item.body.split(/\s+/).length>=60&&item.body.split(/\s+/).length<=90);assert.ok(item.highlights.every(h=>h.body.split(/\s+/).length>=20&&h.body.split(/\s+/).length<=40));}
});
test('Industries dynamic collection validates identities, destinations and isolated snapshots',()=>{
 const content=defaultIndustries('en','global');assert.equal(content.items.length,14);
 assert.ok(industriesPageSchema.safeParse({...content,items:content.items.slice(0,2)}).success);
 assert.ok(!industriesPageSchema.safeParse({...content,items:[content.items[0],content.items[0]]}).success);
 assert.ok(!snapshotSchema.safeParse({title:'Industries',industriesPage:content,sections:[{id:'x',type:'positioning',heading:'x',body:''}]}).success);
 const changed=structuredClone(content);changed.items[0].destination='/industries/roofing/';assert.ok(industriesPageSchema.safeParse(changed).success);assert.equal(industryDestination(changed.items[0].destination),undefined);
 changed.items[0].destination='https://invented.example';assert.ok(!industriesPageSchema.safeParse(changed).success);
});
test('Directory additions preserve edits, disabled entries, order and source revisions',()=>{
 const source=defaultIndustries('en','global');
 const old={...source,items:source.items.slice(0,11).map((item,n)=>({...item,position:n*2}))};
 const before=JSON.stringify(old),completed=industriesPageSchema.parse(old);
 assert.equal(JSON.stringify(old),before);
 assert.deepEqual(completed.items.slice(0,11),old.items);
 assert.deepEqual(completed.items.slice(11).map(i=>i.destination),['/industries/beauty-skincare-med-spa/','/industries/restaurants-cafes-bakeries/','/industries/solar-energy/']);
 assert.deepEqual(completed.items.slice(11).map(i=>i.position),[21,22,23]);
 completed.items[11].enabled=false;completed.items[11].heading='Owner heading';completed.items[11].body='Owner copy';
 assert.deepEqual(industriesPageSchema.parse(completed),completed);
});
test('Industries initialization, versioned save, restore and audit preserve public and homepage snapshots',async()=>{
 const id='industries-editor-'+randomUUID(),roleId=id+'-role';
 const home=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 await db.role.create({data:{id:roleId,name:roleId,permissions:{create:[{permissionId:'edit_pages'}]}}});
 await db.user.create({data:{id,email:id+'@example.test',name:'Industries editor',roles:{create:{roleId}}}});
 try{
  await assert.rejects(()=>initializeIndustries(null),/Unauthorized/);
  const page=await initializeIndustries(id);assert.equal(page.publishedSnapshot,null);
  const same=await initializeIndustries(id);assert.equal(same.version,page.version);
  const saved=snapshotSchema.parse(page.draftSnapshot),changed=structuredClone(saved);
  changed.industriesPage!.items[0].enabled=false;
  changed.industriesPage!.items[11].heading='Edited beauty heading';
  changed.industriesPage!.items[11].body='Edited beauty directory summary';
  changed.industriesPage!.items[12].enabled=false;
  const update=await saveDraft(id,{...changed,pageId:'industries',expectedVersion:page.version});assert.equal(update.version,page.version+1);assert.equal(update.publishedSnapshot,null);
  assert.deepEqual(snapshotSchema.parse(update.draftSnapshot).industriesPage,changed.industriesPage);
  await assert.rejects(()=>saveDraft(id,{...saved,pageId:'industries',expectedVersion:page.version}),/changed/);
  await assert.rejects(()=>saveDraft(id,{...saved,pageId:'homepage',expectedVersion:home.version}),/match/);
  const revision=await db.pageRevision.findFirstOrThrow({where:{pageId:'industries',version:page.version}});
  const restored=await restoreDraft(id,{pageId:'industries',revisionId:revision.id,expectedVersion:update.version});assert.deepEqual(restored.draftSnapshot,saved);assert.equal(restored.publishedSnapshot,null);
  assert.ok(await db.auditLog.count({where:{entityId:'industries',actorId:id,action:'page.draft_saved'}}));
  const afterHome=await db.page.findUniqueOrThrow({where:{id:'homepage'}});assert.deepEqual(afterHome.draftSnapshot,home.draftSnapshot);assert.deepEqual(afterHome.publishedSnapshot,home.publishedSnapshot);
 }finally{
  await db.pageRevision.deleteMany({where:{pageId:'industries'}});await db.auditLog.deleteMany({where:{actorId:id}});await db.page.deleteMany({where:{id:'industries'}});await db.userRole.deleteMany({where:{userId:id}});await db.user.delete({where:{id}});await db.rolePermission.deleteMany({where:{roleId}});await db.role.delete({where:{id:roleId}});
 }
});
