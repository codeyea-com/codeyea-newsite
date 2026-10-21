import type { IndustryDetailContent } from '../schemas/industry-detail';
import type { AboutMedia } from '../schemas/about';
/** Arabic uses the corresponding English placement, retaining translated alt text. */
export function synchronizeIndustryMedia(ar: IndustryDetailContent, en: IndustryDetailContent): IndustryDetailContent {
 if(ar.slug!==en.slug)return ar;
 const media=(target:AboutMedia|undefined,source:AboutMedia|undefined)=>source?{...source,alt:target?.alt||source.alt}:target;
 return {...ar,hero:{...ar.hero,media:media(ar.hero.media,en.hero.media)!},sections:ar.sections.map(section=>{
  const source=en.sections.find(s=>s.id===section.id)??en.sections.find(s=>s.type===section.type);
  if(!source)return section;
  return {...section,media:media(section.media,source.media),pillarMedia:media(section.pillarMedia,source.pillarMedia),items:section.items.map((item,index)=>{
   const counterpart=source.items.find(i=>i.id===item.id)??source.items[index];
   return counterpart?{...item,media:media(item.media,counterpart.media)}:item;
  })};
 })};
}
