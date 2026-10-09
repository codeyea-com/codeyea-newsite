import {db} from './db';import {snapshotSchema} from '../schemas/content';
import {isIndustrySlug,industrySlugs,industryNames,type IndustrySlug} from '../content/industry-registry';
export async function roofingPageData(preview=false){return industryPageData('roofing',preview)}
export async function industryPageData(slug:IndustrySlug,preview=false){
 if(!isIndustrySlug(slug))return null;
 const page=await db.page.findFirst({where:{id:slug,deletedAt:null}});const source=preview?page?.draftSnapshot:page?.publishedSnapshot;if(!source)return null;
 const detail=snapshotSchema.parse(source).industryDetail;if(!detail)return null;
 const shared=await db.page.findUnique({where:{id:'homepage'}}),sharedSource=preview?shared?.draftSnapshot:shared?.publishedSnapshot;
 const pages=await db.page.findMany({where:{deletedAt:null},select:{id:true,draftSnapshot:true,publishedSnapshot:true}});
 const industries=pages.find(p=>p.id==='industries');const industrySource=preview?industries?.draftSnapshot:industries?.publishedSnapshot;
 const industryItems=industrySource?snapshotSchema.parse(industrySource).industriesPage?.items.filter(i=>i.enabled).sort((a,b)=>a.position-b.position)??[]:[];
 // Draft-only additions are derived for the three new previews, never saved into
 // the frozen directory or rendered on existing/public pages.
 const additions=['beauty-skincare-med-spa','restaurants-cafes-bakeries','solar-energy'] as const;
 if(preview&&additions.includes(slug as typeof additions[number])&&industryItems[0]){
  for(const id of additions){
   const record=pages.find(p=>p.id===id);if(!record?.draftSnapshot)continue;
   if(industryItems.some(i=>i.destination===`/industries/${id}/`))continue;
   industryItems.push({...industryItems[0],id,position:industryItems.length,title:industryNames[id],heading:industryNames[id],destination:`/industries/${id}/`,ctaLabel:`Explore ${industryNames[id]}`});
  }
 }
 const paths:Record<string,string>={homepage:'/',about:'/about/',industries:'/industries/',...Object.fromEntries(industrySlugs.map(id=>[id,'/industries/'+id+'/']))};
 return {detail,industryItems,shared:sharedSource?snapshotSchema.parse(sharedSource).homepage:undefined,version:page!.version,availablePaths:pages.filter(p=>preview?p.draftSnapshot:p.publishedSnapshot).map(p=>paths[p.id]).filter(Boolean)};
}
