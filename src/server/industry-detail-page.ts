import {db} from './db';import {snapshotSchema} from '../schemas/content';import {publishedSitePaths} from '../content/site-routes';
import {isIndustrySlug,industryNames,type IndustrySlug} from '../content/industry-registry';
import {industryDetailSchema} from '../schemas/industry-detail';
import {industriesPageSchema} from '../schemas/industries-page';
import fallback from '../content/approved-industries-fallbacks.json';
import {attachLocalIndustryAssets} from '../content/industry-assets';
import {defaultHomepage} from '../content/homepage-defaults';
import {industrySlugForName} from '../content/industry-assets';
export async function roofingPageData(preview=false){return industryPageData('roofing',preview)}
export async function industryPageData(slug:IndustrySlug,preview=false){
 if(!isIndustrySlug(slug))return null;
 const page=await db.page.findFirst({where:{id:slug,deletedAt:null}});const source=preview?page?.draftSnapshot:page?.publishedSnapshot;
 const saved=source?snapshotSchema.parse(source).industryDetail:undefined;
 const fallbackDetail=(fallback.details as Record<string,unknown>)[slug];
 if(preview&&!saved)return null;
 if(!saved&&!fallbackDetail)return null;
 const detail=saved??industryDetailSchema.parse(attachLocalIndustryAssets(fallbackDetail,slug));
 const shared=await db.page.findUnique({where:{id:'homepage'}}),sharedSource=preview?shared?.draftSnapshot:shared?.publishedSnapshot;
 const [pages,documents]=await Promise.all([db.page.findMany({where:{deletedAt:null},select:{id:true,draftSnapshot:true,publishedSnapshot:true,publishedAt:true,deletedAt:true}}),db.siteDocument.findMany({where:{kind:'page'},select:{slug:true,locale:true,kind:true,draft:true,published:true}})]);
 const industries=pages.find(p=>p.id==='industries');const industrySource=preview?industries?.draftSnapshot:industries?.publishedSnapshot;
 const directoryInput=structuredClone(fallback.industriesPage);
 directoryInput.items=directoryInput.items.map((item)=>{
  const itemSlug=industrySlugForName(item.title);
  return itemSlug?attachLocalIndustryAssets(item,itemSlug):item;
 });
 directoryInput.hero=attachLocalIndustryAssets(directoryInput.hero,'roofing');
 const fallbackDirectory=industriesPageSchema.parse(directoryInput);
 const industryItems=industrySource?snapshotSchema.parse(industrySource).industriesPage?.items.filter(i=>i.enabled).sort((a,b)=>a.position-b.position)??[]:fallbackDirectory.items.filter(i=>i.enabled).sort((a,b)=>a.position-b.position);
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
 const availablePages=pages.map(p=>({id:p.id,publishedAt:preview?(p.draftSnapshot?new Date():null):p.publishedAt,publishedSnapshot:preview?p.draftSnapshot:p.publishedSnapshot,deletedAt:p.deletedAt}));
 const availableDocuments=documents.map(d=>({...d,published:preview?d.draft:d.published}));
 return {detail,industryItems,shared:sharedSource?snapshotSchema.parse(sharedSource).homepage:defaultHomepage(),version:page?.version??0,availablePaths:publishedSitePaths({pages:availablePages,documents:availableDocuments})};
}
