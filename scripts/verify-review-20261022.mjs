import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.slice(name.length+3);
const origin=option('origin')||'http://127.0.0.1:3016';
const paths=JSON.parse(await fs.readFile('docs/bilingual-review/routes.json','utf8'));
const results=[];let index=0;
async function worker(){while(index<paths.length){const route=paths[index++];try{const response=await fetch(origin+route.path,{signal:AbortSignal.timeout(45000)}),html=await response.text();const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';results.push({...route,status:response.status,streamError:/data-dgst="(?:NEXT_HTTP_ERROR|[0-9])/.test(html),currentCss:html.includes('/site/live-corrections.css?v=20261022-1'),captions:(main.match(/data-photo-description=/g)||[]).length,brandFaq:(main.match(/id="brand-design-faq"/g)||[]).length,recommended:main.includes('الخطة الموصى بها')||main.includes('Recommended plan'),restaurantDirectory:main.includes('/site/generated/general/industries/restaurant-directory-review-20261022.webp'),imageSources:[...main.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)].map(m=>m[1])});}catch(error){results.push({...route,error:String(error)})}}}
await Promise.all([worker(),worker(),worker(),worker()]);
const pairs=results.filter(p=>p.locale==='en'&&p.path.startsWith('/industries/')).map(en=>({key:en.key,equal:JSON.stringify(en.imageSources)===JSON.stringify(results.find(p=>p.key===en.key&&p.locale==='ar')?.imageSources)}));
const assets=[];
for(const path of ['/site/live-corrections.css','/site/live-corrections.js','/site/hosting-plan-cards.css','/site/hosting-plan-cards.js','/site/generated/general/industries/restaurant-directory-review-20261022.webp']){
 const r=await fetch(origin+path),remote=Buffer.from(await r.arrayBuffer()),local=await fs.readFile('public'+path);const hash=b=>createHash('sha256').update(b).digest('hex'),normalize=b=>/\.(js|css)$/.test(path)?Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')):b;
 assets.push({path,status:r.status,matchesLocal:hash(normalize(local))===hash(normalize(remote))});
}
const failures=[...results.filter(p=>p.status!==200||p.streamError||!p.currentCss),...results.filter(p=>['website-design','brand-design','ecommerce'].includes(p.key)&&p.captions!==5),...results.filter(p=>p.key==='brand-design'&&p.brandFaq!==1),...results.filter(p=>p.key==='industries'&&!p.restaurantDirectory),...results.filter(p=>['website-hosting','wordpress-hosting','cloud-hosting','email-hosting'].includes(p.key)&&!p.recommended),...pairs.filter(p=>!p.equal),...assets.filter(p=>p.status!==200||!p.matchesLocal)];
const file=option('output')||'docs/live-review-2026-10-22/local-checks.json';
await fs.writeFile(file,JSON.stringify({origin,commit:option('commit'),deployment:option('deployment'),checkedAt:new Date().toISOString(),results,pairs,assets,failures},null,2));
console.log(JSON.stringify({origin,pages:results.length,industryPairs:pairs.length,assets:assets.length,failures}));if(failures.length)process.exitCode=1;
