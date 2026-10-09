import {homepageEditorSections} from "../schemas/homepage-editor";
import {db} from './db';
import type {Prisma} from '../generated/prisma/client';
import {AppError} from './errors';
import {approvedTemplates,extractTemplateMediaIds,templateContent} from './site-documents';
export function mediaIds(value:unknown,out=new Set<string>()):Set<string>{if(Array.isArray(value))value.forEach(v=>mediaIds(v,out));else if(value&&typeof value==='object'){for(const [k,v] of Object.entries(value)){if(k==='mediaId'&&typeof v==='string')out.add(v);else mediaIds(v,out);}}return out;}
export async function lockMedia(tx:Prisma.TransactionClient){await tx.$executeRaw`SELECT pg_advisory_xact_lock(71420391)`;}
export async function assertMediaReferences(tx:Prisma.TransactionClient,snapshot:unknown){await lockMedia(tx);const ids=[...mediaIds(snapshot)].filter(id=>id.startsWith('media_'));if(!ids.length)return;const valid=await tx.mediaAsset.count({where:{id:{in:ids},state:'READY',archivedAt:null}});if(valid!==ids.length)throw new AppError(400,'An image is unavailable or archived. Recover it or choose another image before saving/publishing.');}
function locations(snapshot:unknown,id:string){const about=(snapshot as {about?:{sections:{label:string;type:string}[]}}|null)?.about;if(about)return about.sections.filter(s=>mediaIds(s).has(id)).map(s=>s.label||s.type);const homepage=(snapshot as {homepage?:Record<string,unknown>}|null)?.homepage??{};return Object.entries(homepage).filter(([,value])=>mediaIds(value).has(id)).map(([key])=>homepageEditorSections.find(s=>s.key===key)?.label??key);}
export async function references(id:string,tx:Prisma.TransactionClient=db){const pages=await tx.page.findMany({select:{id:true,title:true,draftSnapshot:true,publishedSnapshot:true}});const documents=await tx.siteDocument.findMany({select:{id:true,title:true,draft:true,published:true}});const revisions=await tx.pageRevision.findMany({select:{pageId:true,version:true,snapshot:true}});const publications=await tx.pagePublication.findMany({select:{pageId:true,version:true,snapshot:true,previousSnapshot:true}});return {drafts:[...pages.filter(p=>mediaIds(p.draftSnapshot).has(id)).map(p=>({id:p.id,title:p.title,sections:locations(p.draftSnapshot,id)})),...documents.filter(d=>mediaIds(d.draft).has(id)).map(d=>({id:d.id,title:d.title,sections:['Template page']}))],published:[...pages.filter(p=>mediaIds(p.publishedSnapshot).has(id)).map(p=>({id:p.id,title:p.title,sections:locations(p.publishedSnapshot,id)})),...documents.filter(d=>d.published!==null&&mediaIds(d.published).has(id)).map(d=>({id:d.id,title:d.title,sections:['Template page']}))],revisions:revisions.filter(p=>mediaIds(p.snapshot).has(id)).map(p=>({pageId:p.pageId,version:p.version})),publications:publications.filter(p=>mediaIds(p.snapshot).has(id)||mediaIds(p.previousSnapshot).has(id)).map(p=>({pageId:p.pageId,version:p.version}))};}
let templateMediaIdsPromise:Promise<Set<string>>|undefined;
async function publicTemplateMediaIds(){
 templateMediaIdsPromise??=Promise.all(Object.keys(approvedTemplates).map(async slug=>extractTemplateMediaIds(await templateContent(slug))))
  .then(sets=>new Set(sets.flatMap(ids=>[...ids])));
 return templateMediaIdsPromise;
}
export async function isPublicMedia(id:string){
 if((await publicTemplateMediaIds()).has(id))return true;
 const [pages,allDocuments]=await Promise.all([db.page.findMany({where:{deletedAt:null},select:{publishedSnapshot:true}}),db.siteDocument.findMany({where:{kind:'page'},select:{published:true}})]);
 return pages.some(p=>mediaIds(p.publishedSnapshot).has(id))||allDocuments.some(document=>document.published!==null&&mediaIds(document.published).has(id));
}
