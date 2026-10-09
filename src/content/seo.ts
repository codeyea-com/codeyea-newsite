import type {Metadata} from 'next';
import type {SeoText} from '@/schemas/seo-text';

export const siteOrigin='https://codeyea.com';

export function resolveSeoText(value:Partial<SeoText>|undefined,fallback:SeoText):SeoText{
 return {title:value?.title?.trim()||fallback.title,description:value?.description?.trim()||fallback.description};
}

export function canonical(pathname:string){
 return new URL(pathname,siteOrigin).href;
}

export function publicRobots(hasPublishedContent:boolean):Metadata['robots']{
 const index=hasPublishedContent&&process.env.SITE_INDEXING_ENABLED==='true';
 return {index,follow:index};
}
