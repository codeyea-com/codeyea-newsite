import type {IndustryDetailContent} from '../schemas/industry-detail';
import type {AboutMedia} from '../schemas/about';
import {generatedArtwork} from './generated-artwork';
import {assetUrl} from './homepage-assets';

/** Presentation-only replacement. A later CMS upload remains authoritative. */
export function withGeneratedIndustryMedia(content:IndustryDetailContent):IndustryDetailContent {
  const locale = content.localeId.startsWith('ar') ? 'ar' : 'en';
  const overviewMedia=content.sections.find(s=>s.type==='overview')?.media;
  const replace=(media:AboutMedia|undefined,role:string):AboutMedia|undefined=>{
    if(!media)return media;
    const id=`generated-${content.slug}-${role}-${locale}`;
    const art=generatedArtwork(id);
    // Arabic snapshots can still hold a temporary photo copied from another sector.
    // Use this sector's reviewed hero while keeping later custom CMS uploads authoritative.
    const temporaryHero=role==='hero' && content.hero.temporaryMedia===true;
    if(!art || (!temporaryHero && art.expectedSource!==assetUrl(media.mediaId)))return media;
    return {...media,mediaId:id,alt:media.decorative?'':art.alt,width:art.width,height:art.height,focalX:50,focalY:50,tabletFocalX:50,tabletFocalY:50,mobileFocalX:50,mobileFocalY:50};
  };
  return {...content,hero:{...content.hero,media:replace(content.hero.media,'hero')!},sections:content.sections.map(s=>({...s,media:replace(s.media,s.type==='imageBreak'?'image-break':s.type),pillarMedia:replace(s.pillarMedia ?? (s.type==='needs'?overviewMedia:undefined),'pillars'),items:s.type==='strip'?s.items.map((i,n)=>({...i,media:replace(i.media,`strip-${n+1}`)})):s.items}))};
}
