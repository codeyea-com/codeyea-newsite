import {mkdir,writeFile} from 'node:fs/promises';
import {documentSlugs,documentPath,pagePath} from '../src/content/site-routes';
import {englishPageIds} from '../src/content/industry-registry';
import {caseStudyCards} from '../src/content/case-study-catalog';
const selected=process.argv.find(arg=>arg.startsWith('--keys='))?.slice(7).split(',');
const routes=[...englishPageIds.map(id=>({key:id,path:pagePath(id)!})),...documentSlugs.map(id=>({key:id,path:documentPath(id)!})),{key:'case-studies',path:'/case-studies/'},...caseStudyCards('en').map(c=>({key:'case-'+c.slug,path:'/case-studies/'+c.slug+'/'}))].filter(route=>!selected||selected.includes(route.key));
const dir='docs/bilingual-review';await mkdir(dir,{recursive:true});let next=0;const results:any[]=[];
async function worker(){while(next<routes.length){const route=routes[next++];for(const locale of ['en','ar']){const path=locale==='ar'?'/ar'+route.path:route.path;try{const response=await fetch('http://127.0.0.1:3016'+path,{signal:AbortSignal.timeout(30000)});const html=await response.text();await writeFile(`${dir}/${route.key}-${locale}.html`,html);results.push({...route,locale,status:response.status,path,bytes:html.length,streamError:/data-dgst="(?:NEXT_HTTP_ERROR|[0-9])/.test(html)})}catch(error){results.push({...route,locale,path,error:String(error)})}}}}
await Promise.all([worker(),worker(),worker()]);if(!selected)await writeFile(`${dir}/routes.json`,JSON.stringify(results,null,2));console.log(JSON.stringify({pairs:routes.length,pages:results.length,failures:results.filter(r=>r.status!==200||r.streamError)}));
