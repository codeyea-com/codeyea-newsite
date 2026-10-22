import type {Metadata} from 'next';
import type {SeoText} from '@/schemas/seo-text';

export const siteOrigin='https://codeyea.com';

export function resolveSeoText(value:Partial<SeoText>|undefined,fallback:SeoText):SeoText{
 return {...fallback,...value,title:value?.title?.trim()||fallback.title,description:value?.description?.trim()||fallback.description};
}

export function canonical(pathname:string){
 return new URL(pathname,siteOrigin).href;
}

export function publicRobots(hasPublishedContent:boolean,seo?:Partial<SeoText>):Metadata['robots']{
 const enabled=hasPublishedContent&&process.env.SITE_INDEXING_ENABLED==='true';
 return {index:enabled&&seo?.index!==false,follow:enabled&&seo?.follow!==false};
}
