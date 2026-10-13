import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import about from '../src/content/approved-about-fallback.json';
import services from '../src/content/approved-services-fallback.json';
import industries from '../src/content/approved-industries-fallbacks.json';
import type {GeneralArtwork} from '../src/content/generated-general-artwork';
import {aboutSchema} from '../src/schemas/about';
import {servicesPageSchema} from '../src/schemas/services-page';

type Job={page:string;slot:string;variant:string;path:string;alt:string;scene:string;prompt:string;version?:string};
const jobs:Job[]=JSON.parse(await fs.readFile('docs/GENERAL_IMAGE_GENERATIONS_20261013.json','utf8'));
const registry:Record<string,GeneralArtwork>={};
const archive='C:/Users/grdez/Documents/codex-projects/codeyea/Generated images';
const defaults:Record<string,string>={};
const aboutSections=aboutSchema.parse(about.about).sections;
const serviceContent=servicesPageSchema.parse(services.servicesPage);
defaults['about/hero']=aboutSections[0].media!.mediaId;
defaults['about/experience']=aboutSections[2].media!.mediaId;
for(let i=0;i<4;i++){
 defaults['about/project-'+i]=aboutSections[3].media!.mediaId;
 defaults['about/showcase-'+i]=aboutSections[5].items[i].media!.mediaId;
}
defaults['services/hero']=services.servicesPage.hero.media.mediaId;
for(const i of serviceContent.sections[1].items)defaults['services/'+i.id]=i.media!.mediaId;
defaults['services/strategy']=services.servicesPage.sections[2].media!.mediaId;
defaults['services/cta']=services.servicesPage.sections[7].media!.mediaId;
defaults['industries/hero']=industries.industriesPage.hero.media.mediaId;
for(const i of industries.industriesPage.items)defaults['industries/'+i.id]=i.media.mediaId;
for(const id of ['beauty-skincare-med-spa','restaurants-cafes-bakeries','solar-energy'])defaults['industries/industry-'+id]='industry-'+id+'-image';
const selected=[];
for(const j of jobs){
 if(!j.path)throw Error('Missing generated original: '+j.page+'/'+j.slot);
 const stem=j.slot+'-'+(j.version||'v1')+'-'+j.variant;
 const folder=path.join(archive,j.page,'general-pages-2026-10-13');
 const output=path.join('public/site/generated/general',j.page,stem+'.webp');
 await fs.mkdir(folder,{recursive:true});await fs.mkdir(path.dirname(output),{recursive:true});
 await fs.copyFile(j.path,path.join(folder,stem+'.png'));
 await sharp(j.path).webp({quality:88,effort:5}).toFile(output);
 await fs.copyFile(output,path.join(folder,stem+'.webp'));
 const m=await sharp(output).metadata();
 selected.push({...j,output,width:m.width,height:m.height,bytes:(await fs.stat(output)).size});
 const key=j.page+'/'+j.slot;
 const entry=registry[key]||={src:'',expectedMediaId:defaults[key],alt:{en:j.scene.split('. ')[0],ar:j.alt}};
 const url='/'+output.replaceAll('\\','/').replace(/^public\//,'');
 if(j.variant==='desktop')entry.src=url;
 else if(j.variant==='tablet')entry.tabletSrc=url;
 else entry.mobileSrc=url;
}
await fs.writeFile('src/content/generated-general-artwork.json',JSON.stringify(registry,null,2)+'\n');
await fs.writeFile('docs/SELECTED_GENERAL_ASSETS_20261013.json',JSON.stringify(selected,null,2)+'\n');
for(const page of new Set(jobs.map(j=>j.page)))await fs.writeFile(path.join(archive,page,'general-pages-2026-10-13','generation-records.json'),JSON.stringify(selected.filter(j=>j.page===page),null,2));
console.log({assets:selected.length,placements:Object.keys(registry).length});
