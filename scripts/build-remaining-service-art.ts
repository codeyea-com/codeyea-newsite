import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type {ServiceArtwork} from '../src/content/generated-service-artwork';
type Job={page:string;slot:string|number;name:string;variant:string;path:string;transparent:boolean;alt:string;scene:string;prompt:string;version?:string};
const jobs:Job[]=JSON.parse(await fs.readFile('docs/REMAINING_SERVICE_GENERATIONS.json','utf8'));
const slots=JSON.parse(await fs.readFile('docs/TEMPLATE_IMAGE_SLOTS.json','utf8'));
const registry:Record<string,Record<string,ServiceArtwork>>=JSON.parse(await fs.readFile('src/content/generated-service-artwork.json','utf8'));
const archive='C:/Users/grdez/Documents/codex-projects/codeyea/Generated images';
const selected=[];
for(const j of jobs){
 if(!j.path)throw Error('Missing original '+j.name);
 const stem=j.name+'-directed-'+(j.version||'v1')+'-'+j.variant;
 const folder=path.join(archive,j.page,'owner-directed-2026-10-13');
 const dest=path.join('public/site/generated',j.page,stem+'.webp');
 await fs.mkdir(folder,{recursive:true});await fs.mkdir(path.dirname(dest),{recursive:true});
 await fs.copyFile(j.path,path.join(folder,stem+'.png'));
 await sharp(j.path).webp({quality:88,effort:5}).toFile(dest);
 await fs.copyFile(dest,path.join(folder,stem+'.webp'));
 const m=await sharp(dest).metadata();
 selected.push({...j,output:dest,width:m.width,height:m.height,alpha:m.hasAlpha,bytes:(await fs.stat(dest)).size});
 const entry=(registry[j.page]||={})[String(j.slot)]||={src:'',transparent:j.transparent,alt:{en:j.scene.split('. ')[0],ar:j.alt}};
 const url='/'+dest.replaceAll('\\','/').replace(/^public\//,'');
 if(j.variant==='desktop'){
  entry.src=url;entry.transparent=j.transparent;entry.alt={en:j.scene.split('. ')[0],ar:j.alt};
  const original=slots[j.page]?.find((s:{n:number})=>String(s.n)===String(j.slot));
  if(original)entry.originalSource=original.source;
 }else entry.mobileSrc=url;
}
// Tiny inline words use their existing decorative companion scene, as on the approved pages.
for(const slug of ['digital-marketing','web-mobile-apps','technical-support'])for(const [target,origin]of [[6,3],[7,4]]){
 if(registry[slug]?.[origin])registry[slug][target]={...registry[slug][origin],originalSource:slots[slug].find((s:{n:number})=>s.n===target).source,alt:{en:'',ar:''}};
}
await fs.writeFile('src/content/generated-service-artwork.json',JSON.stringify(registry,null,2)+'\n');
await fs.writeFile('docs/SELECTED_REMAINING_SERVICE_ASSETS.json',JSON.stringify(selected,null,2)+'\n');
for(const page of new Set(jobs.map(j=>j.page)))await fs.writeFile(path.join(archive,page,'owner-directed-2026-10-13','generation-records.json'),JSON.stringify(selected.filter(j=>j.page===page),null,2));
console.log({assets:selected.length,pages:[...new Set(jobs.map(j=>j.page))]});
