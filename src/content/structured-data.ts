import type {Metadata} from 'next';
import {canonical} from './seo';
import {documentPath} from './site-routes';
import type {SeoText} from '@/schemas/seo-text';
import {assetUrl} from './homepage-assets';
import {breadcrumbSchema} from './breadcrumbs';

const siteName='CODEYEA';
const organization={
 '@type':'Organization',
 '@id':canonical('/#organization'),
 name:siteName,
 url:canonical('/'),
};

export function pageMetadata(path:string,title:string,description:string,seo?:Partial<SeoText>):Metadata{
 const url=canonical(seo?.canonicalPath||path);
 const socialTitle=seo?.socialTitle?.trim()||title,socialDescription=seo?.socialDescription?.trim()||description;
 const image=seo?.socialImage?.mediaId?canonical(assetUrl(seo.socialImage.mediaId)):undefined;
 return {
  title,description,
  alternates:{canonical:url},
  openGraph:{title:socialTitle,description:socialDescription,url,siteName,type:'website',locale:'en_US',...(image?{images:[{url:image,alt:seo?.socialImage?.alt||socialTitle}]}:{})},
  twitter:{card:image?'summary_large_image':'summary',title:socialTitle,description:socialDescription,...(image?{images:[image]}:{})},
 };
}

export function publicPageSchema(path:string,name:string,description:string,type='WebPage'){
 const url=canonical(path);
 const breadcrumb=breadcrumbSchema(path,name);
 return {
  '@context':'https://schema.org',
  '@graph':[
   {'@type':type,'@id':url+'#webpage',url,name,description,isPartOf:{'@id':canonical('/#website')},about:{'@id':canonical('/#organization')}},
   ...(breadcrumb?[breadcrumb]:[]),
  ],
 };
}

export function homeSchema(name:string,description:string){
 return {
  '@context':'https://schema.org',
  '@graph':[
   {...organization,'@type':'Organization'},
   {'@type':'WebSite','@id':canonical('/#website'),url:canonical('/'),name:siteName, publisher:{'@id':canonical('/#organization')}},
   {'@type':'WebPage','@id':canonical('/#webpage'),url:canonical('/'),name,description,isPartOf:{'@id':canonical('/#website')}},
  ],
 };
}

const purchaseCategories:Record<string,string>={
 'website-hosting':'Web hosting',
 'wordpress-hosting':'WordPress hosting',
 'cloud-hosting':'Cloud hosting',
 'email-hosting':'Email hosting',
 domains:'Domain name registration',
 'technical-support':'Technical support services',
};

export function commercialProductSchema(slug:string,name:string,description:string,url:string){
 const category=purchaseCategories[slug];
 if(!category)return undefined;
 return {
  '@context':'https://schema.org',
  '@type':'Product',
  name,
  description,
  category,
  brand:{'@type':'Brand',name:siteName},
  url,
 };
}

export function documentStructuredSchema(slug:string,name:string,description:string,locale='en'){
 const path=documentPath(slug,locale);
 if(!path)return undefined;
 const url=canonical(path);
 const product=commercialProductSchema(slug,name,description,url);
 const graph:Record<string,unknown>[]=[
  {'@type':'WebPage','@id':url+'#webpage',url,name,description},
  breadcrumbSchema(path,name)!,
 ];
 if(product){
  const {['@context']:_,...productNode}=product;
  graph.push(productNode);
 }
 return {'@context':'https://schema.org','@graph':graph};
}

export function jsonLdText(value:unknown){
 return JSON.stringify(value).replace(/</g,'\\u003c');
}
