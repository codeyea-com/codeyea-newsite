import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin='https://codeyea-newsite.vercel.app';
const option=name=>process.argv.find(arg=>arg.startsWith('--'+name+'='))?.split('=').slice(1).join('=');
const styleVersion=(await fs.readFile('src/app/layout.tsx','utf8')).match(/live-corrections\.css\?v=([^"']+)/)[1];
const routes=JSON.parse(await fs.readFile('docs/bilingual-review/routes.json','utf8'));
const pages=[];let next=0;
async function worker(){while(next<routes.length){const route=routes[next++];try{
 const response=await fetch(origin+route.path,{signal:AbortSignal.timeout(45000)}),html=await response.text();
 const main=html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1]||'';
 const images=[...main.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)].map(m=>m[1]);
 const priorityImages=images.filter(src=>/general\/services\/.*-live-review-v1\.webp/.test(src));
 pages.push({key:route.key,locale:route.locale,path:route.path,status:response.status,bytes:html.length,streamError:/data-dgst="(?:NEXT_HTTP_ERROR|[0-9])/.test(html),currentStyles:html.includes('/site/live-corrections.css?v='+styleVersion),images,priorityImages});
 }catch(error){pages.push({key:route.key,locale:route.locale,path:route.path,error:String(error)});}}}
await Promise.all([worker(),worker(),worker(),worker()]);
const industryPairs=pages.filter(p=>p.locale==='en'&&p.path.startsWith('/industries/')&&p.key!=='industries').map(en=>{const ar=pages.find(p=>p.key===en.key&&p.locale==='ar');return {key:en.key,counts:[en.images.length,ar?.images?.length],equal:JSON.stringify(en.images)===JSON.stringify(ar?.images)};});
const files=new Set(['public/site/live-corrections.css','public/site/live-corrections.js','public/site/post-launch.js']);
for(const name of ['assets','cta-assets','case-cta-assets'])for(const entry of JSON.parse(await fs.readFile(`docs/live-review-2026-10-21/${name}.json`,'utf8')))files.add(entry.target);
const assets=[];
for(const file of files){try{const response=await fetch(origin+file.replace(/^public/,''),{signal:AbortSignal.timeout(20000)}),remote=Buffer.from(await response.arrayBuffer()),local=await fs.readFile(file);const hash=b=>createHash('sha256').update(b).digest('hex');const normalize=b=>/\.(?:js|css)$/.test(file)?Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n')):b;assets.push({path:file.replace(/^public/,''),status:response.status,bytes:remote.length,byteIdentical:hash(remote)===hash(local),matchesLocal:hash(normalize(remote))===hash(normalize(local))});}catch(error){assets.push({path:file,error:String(error)});}}
const redirects=[];for(const prefix of ['','/ar']){const path=prefix+'/services/seo-geo/';const r=await fetch(origin+path,{redirect:'manual'});redirects.push({path,status:r.status,location:r.headers.get('location')});}
const failures=[...pages.filter(p=>p.status!==200||p.streamError||!p.currentStyles),...assets.filter(a=>a.status!==200||!a.matchesLocal),...industryPairs.filter(p=>!p.equal),...pages.filter(p=>p.key==='services'&&p.priorityImages.length!==4),...redirects.filter(r=>r.status!==308||!r.location?.includes('seo-geo-aeo'))];
const report={origin,commit:option('commit'),deploymentId:option('deployment'),checkedAt:new Date().toISOString(),pages,industryPairs,assets,redirects,failures};
await fs.writeFile('docs/live-review-2026-10-21/production-checks.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({pages:pages.length,industryPairs:industryPairs.length,assets:assets.length,failures}));
if(failures.length)process.exitCode=1;
