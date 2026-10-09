import type {Metadata} from 'next';
import {canonical} from './seo';
import {documentPath} from './site-routes';

const siteName='CODEYEA';
const organization={
 '@type':'Organization',
 '@id':canonical('/#organization'),
 name:siteName,
 url:canonical('/'),
};

export function pageMetadata(path:string,title:string,description:string):Metadata{
 const url=canonical(path);
 return {
  title,description,
  alternates:{canonical:url},
  openGraph:{title,description,url,siteName,type:'website',locale:'en_US'},
  twitter:{card:'summary',title,description},
 };
}

export function publicPageSchema(path:string,name:string,description:string,type='WebPage'){
 const url=canonical(path);
 const parts=path.split('/').filter(Boolean);
 const crumbs=[{name:'Home',url:canonical('/')}];
 let prefix='';
 for(const part of parts){prefix+='/'+part;crumbs.push({name:part.split('-').map(w=>w.charAt(0).toUpperCase()+w.slice(1)).join(' '),url:canonical(prefix+'/')});}
 return {
  '@context':'https://schema.org',
  '@graph':[
   {'@type':type,'@id':url+'#webpage',url,name,description,isPartOf:{'@id':canonical('/#website')},about:{'@id':canonical('/#organization')}},
   {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:crumbs.map((item,position)=>({'@type':'ListItem',position:position+1,name:item.name,item:item.url}))},
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
  {'@type':'BreadcrumbList','@id':url+'#breadcrumb',itemListElement:[
   {'@type':'ListItem',position:1,name:'Home',item:canonical(locale==='ar'?'/ar/':'/')},
   {'@type':'ListItem',position:2,name,item:url},
  ]},
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
