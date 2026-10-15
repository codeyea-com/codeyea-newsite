import 'dotenv/config';
import fs from 'node:fs/promises';
import {db} from '../src/server/db';
import {snapshotSchema} from '../src/schemas/content';
// Reversible CMS draft edit. Publication remains a separate action.
const report:object[]=[];
try {
 const pages=await db.page.findMany({where:{deletedAt:null}});
 for(const page of pages){
  const parsed=snapshotSchema.safeParse(page.draftSnapshot);
  if(!parsed.success || !parsed.data.industryDetail)continue;
  const snapshot=parsed.data;
  const strip=snapshot.industryDetail!.sections.find(s=>s.type==='strip');
  if(!strip || !strip.enabled)continue;
  strip.enabled=false;
  await db.$transaction(async tx=>{
   const result=await tx.page.updateMany({where:{id:page.id,version:page.version},data:{draftSnapshot:snapshot,version:{increment:1}}});
   if(result.count!==1)throw new Error(`Concurrent edit: ${page.id}`);
   await tx.auditLog.create({data:{entityType:'Page',entityId:page.id,actorKind:'SYSTEM',actorLabel:'Owner-requested gallery toggle',action:'UPDATE_DRAFT',before:page.draftSnapshot!,after:snapshot}});
  });
  report.push({id:page.id,section:strip.id,enabled:false,version:page.version+1});
 }
 await fs.mkdir('docs/owner-batch-review',{recursive:true});
 await fs.writeFile('docs/owner-batch-review/cms-gallery-settings.json',JSON.stringify(report,null,2));
 console.log({updatedDrafts:report.length});
} finally {await db.$disconnect()}
