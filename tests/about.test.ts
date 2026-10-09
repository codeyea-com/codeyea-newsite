import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {db} from '../src/server/db';
import {initializeAbout,saveDraft,restoreDraft} from '../src/server/content';
import {publishDraft} from '../src/server/publishing';
import {defaultAbout} from '../src/content/about-defaults';
import {defaultHomepage} from '../src/content/homepage-defaults';
import {aboutSchema,type AboutSection} from '../src/schemas/about';
import {snapshotSchema} from '../src/schemas/content';
import {Prisma} from '../src/generated/prisma/client';
after(async()=>{await db.$disconnect();});

test('About schema rejects mixed pages, invalid visibility, media and identities',()=>{
 const about=defaultAbout('en','global');
 assert.ok(aboutSchema.safeParse(about).success);
 for(const visibility of ['all','desktop','tablet','mobile'] as const){for(let i=0;i<about.sections.length;i++){const changed=structuredClone(about);changed.sections[i].visibility=visibility;assert.ok(aboutSchema.safeParse(changed).success);}}
 assert.ok(!snapshotSchema.safeParse({title:'About',sections:[{id:'x',type:'positioning',heading:'x',body:''}],about}).success);
 for(const invalid of ['watch','',null]){
  const changed=structuredClone(about);(changed.sections[0] as unknown as {visibility:unknown}).visibility=invalid;
  assert.ok(!aboutSchema.safeParse(changed).success);
 }
 const duplicate=structuredClone(about);duplicate.sections[1].id=duplicate.sections[0].id;
 assert.ok(!aboutSchema.safeParse(duplicate).success);
 const media=structuredClone(about);media.sections[0].media={mediaId:'unknown',alt:'',decorative:false,focalX:50,focalY:50,tabletFocalX:50,tabletFocalY:50,mobileFocalX:50,mobileFocalY:101};
 assert.ok(!aboutSchema.safeParse(media).success);
});

test('About initialization, save and restore are isolated atomic private draft operations',async()=>{
 const suffix=randomUUID(),actorId=`about-editor-${suffix}`,roleId=`about-role-${suffix}`;
 const prior=await db.page.findUnique({where:{id:'about'}});
 assert.equal(prior,null,'isolated test fixture must not already contain About');
 const home=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 await db.role.create({data:{id:roleId,name:roleId,permissions:{create:[{permissionId:'edit_pages'},{permissionId:'publish_pages'}]}}});
 await db.user.create({data:{id:actorId,email:`${actorId}@example.test`,name:'About editor',roles:{create:{roleId}}}});
 try{
  await assert.rejects(()=>initializeAbout(null),/Unauthorized/);
  const page=await initializeAbout(actorId);
  assert.equal(page.status,'DRAFT');assert.equal(page.publishedSnapshot,null);assert.equal(page.publishedAt,null);
  const repeated=await initializeAbout(actorId);assert.equal(repeated.version,page.version);
  assert.equal(await db.auditLog.count({where:{entityId:'about',action:'page.draft_initialized'}}),1);
  const saved=snapshotSchema.parse(page.draftSnapshot),changed=structuredClone(saved);
  changed.about!.sections[1].heading='Edited About heading';
  const updated=await saveDraft(actorId,{...changed,pageId:'about',expectedVersion:1});
  assert.equal(updated.version,2);assert.equal(updated.publishedSnapshot,null);
  await assert.rejects(()=>saveDraft(actorId,{...saved,pageId:'about',expectedVersion:1}),/changed/);
  const revision=await db.pageRevision.findFirstOrThrow({where:{pageId:'about',version:1}});
  const restored=await restoreDraft(actorId,{pageId:'about',revisionId:revision.id,expectedVersion:2});
  assert.deepEqual(restored.draftSnapshot,saved);
  const invalid=structuredClone(saved);invalid.about!.localeId='ar';
  await assert.rejects(()=>saveDraft(actorId,{...invalid,pageId:'about',expectedVersion:3}),/locale/);
  const invalidProjects=structuredClone(saved);invalidProjects.about!.sections.find(s=>s.type==='selectedWork')!.enabled=true;
  await assert.rejects(()=>saveDraft(actorId,{...invalidProjects,pageId:'about',expectedVersion:3}),/approved/);
  await assert.rejects(()=>saveDraft(actorId,{...saved,pageId:'homepage',expectedVersion:home.version}),/match/);
  const unchanged=await db.page.findUniqueOrThrow({where:{id:'about'}});
  assert.equal(unchanged.version,3);assert.equal(unchanged.publishedSnapshot,null);
  assert.equal(await db.pageRevision.count({where:{pageId:'about'}}),2);
  assert.equal(await db.auditLog.count({where:{entityId:'about'}}),3);
  assert.deepEqual(await db.page.findUniqueOrThrow({where:{id:'homepage'}}),home);
  // Approval exists only in the isolated test database and is restored after the assertion.
  const shared=snapshotSchema.parse(home.draftSnapshot);
  shared.homepage=shared.homepage??defaultHomepage(home.localeId,home.marketId);
  const projects=(shared.homepage as unknown as {projects:{items:Record<string,unknown>[]}}).projects.items;
  projects[0]={...projects[0],approved:true,enabled:true,title:'Verified test project',body:'A documented test engagement',href:'/work/test'};
  const selected=structuredClone(saved),work=selected.about!.sections.find(s=>s.type==='selectedWork')!;
  work.enabled=true;work.projectIds=[String(projects[0].id)];
  await db.page.update({where:{id:'homepage'},data:{draftSnapshot:shared as Prisma.InputJsonValue}});
  try{
   const approved=await saveDraft(actorId,{...selected,pageId:'about',expectedVersion:3});
   assert.equal(approved.version,4);assert.equal(approved.publishedSnapshot,null);
   await assert.rejects(()=>publishDraft(actorId,{pageId:'about',expectedVersion:4}),/approved/);
   assert.equal(await db.pagePublication.count({where:{pageId:'about'}}),0);
   assert.equal((await db.page.findUniqueOrThrow({where:{id:'about'}})).version,4);
   // Publication uses the published shared record even when its draft has unapproved changes.
   await db.page.update({where:{id:'homepage'},data:{publishedSnapshot:shared as Prisma.InputJsonValue,draftSnapshot:home.draftSnapshot??Prisma.DbNull}});
   const published=await publishDraft(actorId,{pageId:'about',expectedVersion:4});
   assert.equal(published.version,5);
   assert.equal(await db.pagePublication.count({where:{pageId:'about'}}),1);
   const reference=structuredClone(saved);
   reference.about!.schemaVersion=2;
   reference.about!.sections=['hero','who','experience','projectReference','principles','showcase','awards'].map((type,position)=>({id:'about-'+type,type:type as AboutSection['type'],position,enabled:true,visibility:'all',label:'',heading:type==='hero'?'About Us':type,body:'Reference fixture',items:[]}));
   const publication=(await db.page.findUniqueOrThrow({where:{id:'about'}})).publishedSnapshot;
   const referenceSaved=await saveDraft(actorId,{...reference,pageId:'about',expectedVersion:5});
   assert.equal(referenceSaved.version,6);
   assert.deepEqual(referenceSaved.publishedSnapshot,publication);
   await assert.rejects(()=>saveDraft(actorId,{...reference,pageId:'about',expectedVersion:5}),/changed/);
   const legacyRevision=await db.pageRevision.findFirstOrThrow({where:{pageId:'about',version:1}});
   const legacyRestored=await restoreDraft(actorId,{pageId:'about',revisionId:legacyRevision.id,expectedVersion:6});
   assert.equal(snapshotSchema.parse(legacyRestored.draftSnapshot).about!.schemaVersion,1);
   assert.deepEqual(legacyRestored.publishedSnapshot,publication);
  }finally{
   await db.page.update({where:{id:'homepage'},data:{draftSnapshot:home.draftSnapshot??Prisma.DbNull,publishedSnapshot:home.publishedSnapshot??Prisma.DbNull,updatedAt:home.updatedAt}});
  }
 }finally{
  await db.auditLog.deleteMany({where:{entityId:'about'}});
  await db.page.deleteMany({where:{id:'about'}});
  await db.user.delete({where:{id:actorId}});
  await db.role.delete({where:{id:roleId}});
 }
});
