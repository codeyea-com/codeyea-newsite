import {canonical} from './seo';
import {arabicNavigation} from './arabic-navigation';
import {industryNames,isIndustrySlug} from './industry-registry';
import {serviceCatalog} from './service-catalog';

const pageNames:Record<string,string>={
 about:'About Us',services:'Services',industries:'Industries',contact:'Contact',
 domains:'Domains','website-hosting':'Website Hosting','wordpress-hosting':'WordPress Hosting',
 'cloud-hosting':'Cloud Hosting','email-hosting':'Email Hosting','case-studies':'Case Studies',
};

/** A real navigation path, serialized as data only; locale is never a breadcrumb level. */
export function breadcrumbSchema(path:string,currentName:string){
 const parts=path.split('/').filter(Boolean);
 const ar=parts[0]==='ar';
 if(ar)parts.shift();
 if(!parts.length)return undefined; // Home has no ancestors; do not invent a two-item trail.
 const prefix=ar?'/ar':'';
 const label=(en:string)=>ar?(en==='Case Studies'?'دراسات الحالة':arabicNavigation[en]||en):en;
 const items=[{name:ar?'الرئيسية':'Home',item:canonical(prefix+'/')}];
 const slug=parts.at(-1)!;
 const service=serviceCatalog.find(s=>s.slug===slug);
 if(parts[0]==='industries'&&parts.length>1){
  items.push({name:label('Industries'),item:canonical(prefix+'/industries/')});
 }else if(parts[0]==='case-studies'&&parts.length>1){
  items.push({name:label('Case Studies'),item:canonical(prefix+'/case-studies/')});
 }else if(service){
  items.push({name:label('Services'),item:canonical(prefix+'/services/')});
 }else if(['wordpress-hosting','cloud-hosting','email-hosting'].includes(slug)){
  items.push({name:label('Website Hosting'),item:canonical(prefix+'/website-hosting/')});
 }
 const name=parts[0]==='industries'&&isIndustrySlug(slug)?label(industryNames[slug])
  :service?(ar?service.ar:service.title)
  :pageNames[slug]?label(pageNames[slug])
  :currentName.replace(/\s*\|\s*CODEYEA\s*$/i,'').trim();
 const url=canonical(prefix+'/'+parts.join('/')+'/');
 items.push({name,item:url});
 return {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:items.map((item,index)=>({'@type':'ListItem',position:index+1,...item}))};
}
