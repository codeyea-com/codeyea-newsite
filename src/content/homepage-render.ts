import {assetUrl} from './homepage-assets';
import {approvedMedia} from './approved-media';
import type {EditorObject} from '../schemas/homepage-editor';
export const str=(value:unknown)=>typeof value==='string'?value:'';
export function mediaProps(value:unknown){const media=value as EditorObject;const id=str(media.mediaId);let srcSet:string|undefined;if(id.startsWith('media_')&&!approvedMedia[id]&&media.width&&media.height){const w=Number(media.width),h=Number(media.height);const sizes=new Map<number,string>();['small','medium','large'].forEach((name,i)=>{const width=Math.round(w*Math.min(1,[640,1280,1920][i]/w,[640,1280,1920][i]/h));sizes.set(width,'/asset/'+id+'?variant='+name+' '+width+'w');});srcSet=[...sizes.values()].join(', ');}return {src:assetUrl(id),...(srcSet?{srcSet,sizes:'(max-width: 767px) 100vw, 50vw'}:{}),alt:media.decorative?'':str(media.alt),style:{objectPosition:media.focalX+'% '+media.focalY+'%'}};}
