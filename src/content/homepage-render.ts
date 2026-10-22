import {assetUrl} from './homepage-assets';
import {approvedMedia} from './approved-media';
import {generatedArtwork} from './generated-artwork';
import type {EditorObject} from '../schemas/homepage-editor';
export const str=(value:unknown)=>typeof value==='string'?value:'';
export function mediaDimensions(value: unknown) {
 const media = value as EditorObject;
 const id = str(media.mediaId);
 const artwork = generatedArtwork(id);
 if (artwork) return {width: artwork.width, height: artwork.height};
 if (['support', 'branding', 'ecommerce'].includes(id)) return {width:1100, height:1117};
 return {width:Number(media.width)||undefined, height:Number(media.height)||undefined};
}
export function mediaProps(value:unknown){const media=value as EditorObject;const id=str(media.mediaId);let srcSet:string|undefined;if(['about','support','branding','ecommerce'].includes(id)){srcSet=id==='about'?'/homepage/about-640.webp 640w, /homepage/about-960.webp 960w, /homepage/about.webp 1200w':`/homepage/${id}-640.webp 640w, /homepage/${id}.webp 1100w`;}if(id.startsWith('media_')&&!approvedMedia[id]&&media.width&&media.height){const w=Number(media.width),h=Number(media.height);const sizes=new Map<number,string>();['small','medium','large'].forEach((name,i)=>{const width=Math.round(w*Math.min(1,[640,1280,1920][i]/w,[640,1280,1920][i]/h));sizes.set(width,'/asset/'+id+'?variant='+name+' '+width+'w');});srcSet=[...sizes.values()].join(', ');}return {src:assetUrl(id),...(srcSet?{srcSet,sizes:'(max-width: 767px) 100vw, 50vw'}:{}),alt:media.decorative?'':str(media.alt),style:{objectPosition:media.focalX+'% '+media.focalY+'%'}};}
