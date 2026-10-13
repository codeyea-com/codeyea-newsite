import fs from 'node:fs/promises';
import { db } from '../src/server/db';
import { snapshotSchema } from '../src/schemas/content';
import { defaultHomepage, resolveHomepage } from '../src/content/homepage-defaults';
import { defaultIndustries } from '../src/content/industries-defaults';
import { defaultServices } from '../src/content/services-defaults';
import { approvedMenuContent } from '../src/content/approved-navigation';
import { servicePageDestinationForText, industryPageDestination } from '../src/content/service-destinations';
import { industrySlugs } from '../src/content/industry-registry';
import { industryServiceCatalog } from '../src/content/industry-service-catalog';
import { enabledItems } from '../src/schemas/homepage-editor';
import { synchronizeIndustryServices } from '../src/content/synchronized-service-lists';
import fallback from '../src/content/approved-industries-fallbacks.json';
import { industryDetailSchema } from '../src/schemas/industry-detail';

const servicePaths = industryServiceCatalog.map(s=>s[2]);
const normalize=(path:string)=>path.replace(/^\/preview\/pages\//,'/').replace(/^\/preview\//,'/').replace(/^\/ar\//,'/').split('?')[0].replace(/\/$/,'')+'/';
const summary=(paths:string[],expected:readonly string[])=>({count:paths.length,unique:new Set(paths).size,missing:expected.filter(p=>!paths.includes(p)),extra:[...new Set(paths)].filter(p=>!expected.includes(p))});
const report:Record<string,unknown>={};
function inspect(id:string,state:string,source:unknown){
 const parsed=snapshotSchema.safeParse(source);if(!parsed.success)return;
 const s=parsed.data, row:Record<string,unknown>={};
 if(s.homepage){
  const h=resolveHomepage(s.homepage);
  const menu=approvedMenuContent(h.header,'public',id.startsWith('ar-')?'ar':'en');
  const items=enabledItems(menu.items);
  const serviceRoot=items.find(i=>!i.parentId&&normalize(String(i.href))==='/services/');
  const industryRoot=items.find(i=>!i.parentId&&normalize(String(i.href))==='/industries/');
  row.menuServices=summary(items.filter(i=>i.parentId===serviceRoot?.id).map(i=>normalize(String(i.href))),servicePaths);
  row.menuIndustries=summary(items.filter(i=>i.parentId===industryRoot?.id).map(i=>normalize(String(i.href))),industrySlugs.map(i=>`/industries/${i}/`));
  row.homeIndustrySlides=enabledItems(h.industries.items).map(i=>String(i.title));
  row.homeServices=enabledItems(h.services.items).map(i=>String(i.title));
  row.caseStudies={sectionEnabled:h.projects.enabled!==false,cards:enabledItems(h.projects.items).length,approved:enabledItems(h.projects.items).filter(i=>i.approved===true).length};
 }
 if(s.industriesPage)row.directory=summary(s.industriesPage.items.filter(i=>i.enabled).map(i=>normalize(i.destination||industryPageDestination(i.title)||'')),industrySlugs.map(i=>`/industries/${i}/`));
 if(s.industryDetail)row.industryServices=summary(synchronizeIndustryServices(s.industryDetail).sections.filter(s=>s.type==='services').flatMap(s=>s.items.map(i=>normalize(i.destination||servicePageDestinationForText(i.id,i.title,i.actionLabel)||''))),servicePaths);
 if(s.servicesPage){const complete=defaultServices(s.servicesPage.localeId,s.servicesPage.marketId,s.servicesPage.hero.media).sections.find(s=>s.id==='services-complete')!;row.completeServices=summary(complete.items.map(i=>normalize(i.destination||'')),servicePaths);}
 if(Object.keys(row).length)report[`${id}:${state}`]=row;
}
try{
 const pages=await db.page.findMany({where:{deletedAt:null},select:{id:true,draftSnapshot:true,publishedSnapshot:true}});
 for(const p of pages){inspect(p.id,'draft',p.draftSnapshot);inspect(p.id,'published',p.publishedSnapshot);}
 report.fallbackDirectoryCount=defaultIndustries('en','global').items.length;
 report.fallbackHomeIndustryCount=enabledItems(resolveHomepage(defaultHomepage()).industries.items).length;
 report.fallbackIndustryServices=Object.entries(fallback.details).map(([slug,data])=>({slug,...summary(synchronizeIndustryServices(industryDetailSchema.parse(data)).sections.filter(s=>s.type==='services').flatMap(s=>s.items.map(i=>normalize(i.destination))),servicePaths)}));
 await fs.writeFile(process.argv[2] || 'docs/CATALOG_SYNC_AUDIT.json',JSON.stringify(report,null,2)+'\n');
 console.log(JSON.stringify({checked:Object.keys(report).length,homepage:report['homepage:published'],services:report['services:draft'],arabicServices:report['ar-services:draft'],fallbackIndustryServices:report.fallbackIndustryServices},null,2));
}finally{await db.$disconnect();}
