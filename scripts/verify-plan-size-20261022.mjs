import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
const origin=process.env.PLAN_REVIEW_ORIGIN||'http://127.0.0.1:3016';
const paths=['website-hosting','wordpress-hosting','cloud-hosting','email-hosting'].flatMap(s=>['/'+s+'/','/ar/'+s+'/']);
const results=await Promise.all(paths.map(async path=>{const r=await fetch(origin+path),html=await r.text();return {path,status:r.status,css:html.includes('/site/hosting-plan-cards.css?v=20261022-2'),js:html.includes('/site/hosting-plan-cards.js?v=20261022-2'),cards:(html.match(/class="card [^"]*reveal"/g)||[]).length,error:/data-dgst="(?:NEXT_HTTP_ERROR|[0-9])/.test(html)};}));
const assets=await Promise.all(['css','js'].map(async extension=>{const path='/site/hosting-plan-cards.'+extension,r=await fetch(origin+path),remote=await r.text(),local=await fs.readFile('public'+path,'utf8');const hash=t=>createHash('sha256').update(t.replace(/\r\n/g,'\n')).digest('hex');return {path,status:r.status,matchesLocal:hash(remote)===hash(local)}}));
const failures=[...results.filter(r=>r.status!==200||!r.css||!r.js||!r.cards||r.error),...assets.filter(r=>r.status!==200||!r.matchesLocal)];
const output=origin.includes('127.0.0.1')?'local-checks.json':'production-checks.json';
await fs.writeFile('docs/plan-size-review-2026-10-22/'+output,JSON.stringify({origin,checkedAt:new Date().toISOString(),results,assets,failures},null,2));console.log(JSON.stringify({pages:results.length,assets:assets.length,failures}));if(failures.length)process.exitCode=1;
