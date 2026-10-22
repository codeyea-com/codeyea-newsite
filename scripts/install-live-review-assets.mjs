import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const root=process.cwd();
const jobs=(await Promise.all(['assets','cta-assets','case-cta-assets'].map(async name=>JSON.parse(await fs.readFile(`docs/live-review-2026-10-21/${name}.json`,'utf8'))))).flat();
for(const job of jobs){
 const archive=path.join('C:/Users/grdez/Documents/codex-projects/codeyea/Generated images',job.page,'2026-10-21-live-review');
 await fs.mkdir(archive,{recursive:true});await fs.copyFile(job.source,path.join(archive,job.key+'.png'));
 await fs.writeFile(path.join(archive,job.key+'-prompt.txt'),job.prompt);
 await fs.mkdir(path.dirname(job.target),{recursive:true});await sharp(job.source).resize({width:1800,withoutEnlargement:true}).webp({quality:88}).toFile(job.target);
}
const registry=JSON.parse(await fs.readFile('src/content/generated-artwork.json','utf8'));
const patches={'restaurant_needs':['restaurants-cafes-bakeries','needs'],'restaurant_waiter':['restaurants-cafes-bakeries','image-break'],'restaurant_cta':['restaurants-cafes-bakeries','cta'],'magazine_needs':['online-magazine','needs'],'lifestyle_break':['fashion-and-lifestyle','image-break']};
for(const [key,[slug,role]]of Object.entries(patches)){
 const job=jobs.find(j=>j.key===key),meta=await sharp(job.target).metadata();
 for(const lang of ['en','ar']){const id=`generated-${slug}-${role}-${lang}`;registry[id]={...registry[id],src:job.target.replace(/^public/,''),mobileSrc:job.target.replace(/^public/,''),width:meta.width,height:meta.height};}
}
await fs.writeFile('src/content/generated-artwork.json',JSON.stringify(registry,null,2)+'\n');
const general=JSON.parse(await fs.readFile('src/content/generated-general-artwork.json','utf8'));
for(const [key,id] of Object.entries({magazine_cover:'industries/industry-online-magazine',services_ai:'services/sv-priority-ai',services_seo:'services/sv-priority-seo',services_apps:'services/sv-priority-development',services_commerce:'services/sv-priority-commerce'})){
 const src=jobs.find(j=>j.key===key).target.replace(/^public/,'');general[id]={...general[id],src,mobileSrc:src,tabletSrc:src};
}
await fs.writeFile('src/content/generated-general-artwork.json',JSON.stringify(general,null,2)+'\n');
console.log(`Installed ${jobs.length} distinct images; originals and prompts archived.`);
