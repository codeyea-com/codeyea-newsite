import {db} from './db';
import {requirePermission} from './permissions';
import {assertPageSnapshot} from './content';
import {assertMediaReferences} from './media-references';
import {snapshotSchema,type Snapshot} from '../schemas/content';
import {industryNames,type IndustrySlug} from '../content/industry-registry';
import {AppError} from './errors';
import type {Prisma} from '../generated/prisma/client';

export async function initializeIndustry(actorId:string|null,input:{pageId:IndustrySlug;templateVersion:5;snapshot:Snapshot}){
 await requirePermission(actorId,'edit_pages');
 if(input.pageId==='roofing')throw new AppError(400,'The approved Roofing template cannot be replaced through initialization.');
 const snapshot=snapshotSchema.parse(input.snapshot);
 return db.$transaction(async tx=>{
  await requirePermission(actorId,'edit_pages',tx);await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420395)`;
  if(await tx.page.findUnique({where:{id:input.pageId}}))throw new AppError(409,'This industry already has a draft. Open it and save with its current version.');
  const template=await tx.page.findUnique({where:{id:'roofing'}});
  if(!template||template.version!==input.templateVersion)throw new AppError(409,'The approved Roofing template version changed. Review it before creating a draft.');
  const base=snapshotSchema.parse(template.draftSnapshot).industryDetail;
  const detail=snapshot.industryDetail;
  if(!detail||!base||detail.schemaVersion!==2||snapshot.title!==industryNames[input.pageId]||detail.hero.title!==industryNames[input.pageId]||detail.sections.some((s,n)=>s.type!==base.sections[n].type||s.enabled!==base.sections[n].enabled||s.items.length!==base.sections[n].items.length))throw new AppError(400,'Preserve the approved template structure and industry identity.');
  await assertPageSnapshot(tx,{id:input.pageId,localeId:template.localeId,marketId:template.marketId},snapshot);await assertMediaReferences(tx,snapshot);
  const page=await tx.page.create({data:{id:input.pageId,slug:'industries/'+input.pageId,title:snapshot.title,localeId:template.localeId,marketId:template.marketId,status:'DRAFT',draftSnapshot:snapshot as Prisma.InputJsonValue,createdBy:actorId,updatedBy:actorId}});
  await tx.pageRevision.create({data:{pageId:page.id,version:1,snapshot:snapshot as Prisma.InputJsonValue,reason:'Private industry initialized from approved Roofing draft 5',actorId:actorId!}});
  await tx.auditLog.create({data:{actorId,entityType:'Page',entityId:page.id,action:'page.draft_initialized',after:snapshot as Prisma.InputJsonValue}});
  return page;
 });
}
