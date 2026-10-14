import fs from 'node:fs/promises';
import {englishPageIds} from '../src/content/industry-registry';
import {documentSlugs,pagePath,documentPath} from '../src/content/site-routes';
import {conceptCaseStudies} from '../src/content/concept-case-studies';
import {breadcrumbSchema} from '../src/content/breadcrumbs';

const origin=process.argv[2]||'http://127.0.0.1:3014';
const output=process.argv[3]||'.local/breadcrumb-audit.json';
const paths=['en','ar'].flatMap(locale=>[
 ...englishPageIds.map(id=>pagePath((locale==='ar'?'ar-':'')+id)!),
 ...documentSlugs.map(slug=>documentPath(slug,locale)!),
 `${locale==='ar'?'/ar':''}/case-studies/`,
 ...conceptCaseStudies.map(c=>`${locale==='ar'?'/ar':''}/case-studies/${c.slug}/`),
]);
const results:any[]=[];
let next=0;
await Promise.all(Array.from({length:3},async()=>{
 while(next<paths.length){
  const path=paths[next++];
  try{
   const response=await fetch(new URL(path,origin),{signal:AbortSignal.timeout(90000)});
   const html=await response.text();
   const nodes=[...html.matchAll(/<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)].flatMap(m=>{
    const data=JSON.parse(m[1]);return Array.isArray(data)?data:data['@graph']||[data];
   });
   const crumbs=nodes.filter(n=>n['@type']==='BreadcrumbList');
   const home=['/','/ar/'].includes(path);
   const locale=path.startsWith('/ar/')?'ar':'en';
   const caseItem=conceptCaseStudies.find(c=>path.endsWith('/case-studies/'+c.slug+'/'));
   const expected=breadcrumbSchema(path,caseItem?.[locale].name||'');
   const errors:string[]=[];
   if(response.status!==200)errors.push(`HTTP ${response.status}`);
   if(crumbs.length!==(home?0:1))errors.push(`Expected ${home?0:1} BreadcrumbList, found ${crumbs.length}`);
   if(crumbs.length===1&&JSON.stringify(crumbs[0].itemListElement)!==JSON.stringify(expected?.itemListElement))errors.push('Trail differs from localized navigation catalogue');
   if(path.includes('/case-studies/')&&/<a\b[^>]*>\s*(English|العربية)\s*<\/a>/.test(html.match(/<main\b[\s\S]*?<\/main>/)?.[0]||''))errors.push('Inline case-study language switch remains');
   for(const crumb of crumbs){
    const items=crumb.itemListElement||[];
    if(items.length<2)errors.push('Fewer than two items');
    items.forEach((item:any,i:number)=>{
     if(item.position!==i+1||item['@type']!=='ListItem'||!item.name?.trim())errors.push(`Invalid item ${i+1}`);
     if(!item.item?.startsWith('https://codeyea.com/'))errors.push(`Noncanonical item ${i+1}`);
     if(path.startsWith('/ar/')&&!item.item?.startsWith('https://codeyea.com/ar/'))errors.push(`Wrong locale at item ${i+1}`);
    });
    if(items.at(-1)?.item!==`https://codeyea.com${path}`)errors.push('Last item does not identify current page');
    if(items[0]?.name!==(path.startsWith('/ar/')?'الرئيسية':'Home'))errors.push('Incorrect home label');
   }
   results.push({path,status:response.status,robots:response.headers.get('x-robots-tag'),home,errors,breadcrumbs:crumbs});
  }catch(error){results.push({path,errors:[String(error)]});}
 }
}));
results.sort((a,b)=>a.path.localeCompare(b.path));
for(const result of results)for(const crumb of result.breadcrumbs||[])for(const item of crumb.itemListElement){
 const linked=results.find(r=>r.path===new URL(item.item).pathname);
 if(!linked||linked.status!==200)result.errors.push(`Breadcrumb destination unavailable: ${item.item}`);
}
await fs.mkdir(output.replace(/[/\\][^/\\]+$/,''),{recursive:true});
await fs.writeFile(output,JSON.stringify({origin,checkedAt:new Date().toISOString(),total:results.length,results},null,2));
console.log(JSON.stringify({total:results.length,passed:results.filter(r=>!r.errors.length).length,failures:results.filter(r=>r.errors.length).map(({path,errors})=>({path,errors})),output},null,2));
if(results.some(r=>r.errors.length))process.exitCode=1;
