import fs from 'node:fs/promises';
const url=new URL(process.env.DATABASE_URL!);
if(!['127.0.0.1','localhost'].includes(url.hostname))throw Error('Local review database required');
url.pathname='/codeyea_owner_review_oct19';process.env.DATABASE_URL=url.href;
const {db}=await import('../src/server/db');
const pages=await db.page.findMany({where:{id:{in:['services','ar-services','industries','ar-industries']}},select:{publishedSnapshot:true}});
const file='src/content/generated-general-artwork.json';
const registry=JSON.parse(await fs.readFile(file,'utf8'));
const keys=Object.keys(registry).filter(key=>key.startsWith('services/sv-priority-')||key==='industries/industry-online-magazine');
for(const key of keys){
 const ids=new Set<string>([registry[key].expectedMediaId].filter(Boolean));
 function visit(value:any){if(!value||typeof value!=='object')return;if(value.id===key.split('/')[1]&&value.media?.mediaId)ids.add(value.media.mediaId);for(const child of Object.values(value))visit(child);}
 pages.forEach(page=>visit(page.publishedSnapshot));
 registry[key].expectedMediaIds=[...ids];
}
await fs.writeFile(file,JSON.stringify(registry,null,2)+'\n');
console.log(JSON.stringify(keys.map(key=>({key,recognizedMedia:registry[key].expectedMediaIds.length}))));
await db.$disconnect();
export {};
