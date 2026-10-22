import {readFile,writeFile,access} from 'node:fs/promises';

const routes=[];
for(const path of ['/services/seo-geo/','/ar/services/seo-geo/','/services/seo-geo-aeo/','/ar/services/seo-geo-aeo/']){
 const response=await fetch('http://127.0.0.1:3016'+path,{redirect:'manual'});
 const html=await response.text();
 routes.push({path,status:response.status,location:response.headers.get('location'),faqAEO:/What is AEO and how does it relate to content\?|ما هو AEO وكيف يرتبط بالمحتوى؟/.test(html),oldLinks:(html.match(/href=["'](?:\/ar)?\/services\/seo-geo\//g)||[]).length});
}
const comparison=JSON.parse(await readFile('docs/bilingual-review/comparison.json','utf8'));
const industries=comparison.filter((pair:any)=>pair.path.includes('/industries/')&&pair.key!=='industries').map((pair:any)=>({slug:pair.key,imageCounts:pair.imageCounts,differences:pair.imageDiffs.length,responsiveEqual:JSON.stringify(pair.responsiveAndBackground[0])===JSON.stringify(pair.responsiveAndBackground[1])}));
const manifests=['assets.json','cta-assets.json','case-cta-assets.json'];
let generatedAssets=0;
for(const name of manifests){const entries=JSON.parse(await readFile('docs/live-review-2026-10-21/'+name,'utf8'));for(const entry of Array.isArray(entries)?entries:Object.values(entries)){const item=entry as any;const file=item.target||item.output||item.publicPath;if(file)await access(file.startsWith('/')?'public'+file:file);generatedAssets++;}}
const report={routes,industries,generatedAssets,checkedAt:new Date().toISOString()};
await writeFile('docs/live-review-2026-10-21/checks.json',JSON.stringify(report,null,2));
console.log(JSON.stringify(report));
if(routes.some(r=>r.path.includes('aeo')?(r.status!==200||!r.faqAEO||r.oldLinks):(r.status!==308||!r.location?.includes('seo-geo-aeo')))||industries.some((p:any)=>p.differences||!p.responsiveEqual))process.exitCode=1;
export {};
