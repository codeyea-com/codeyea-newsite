import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const git=(...args)=>execFileSync('git',args,{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
const sources=git('ls-files','--cached','--others','--exclude-standard','--','src','site-templates','public/site');
const reviewed=await fs.readdir('docs/bilingual-review');
sources.push(...reviewed.filter(file=>file.endsWith('.html')).map(file=>'docs/bilingual-review/'+file));
const refs=new Set();
for(const file of sources){
 if(!/\.(?:tsx?|jsx?|json|css|html|svg)$/.test(file))continue;
 const text=await fs.readFile(file,'utf8');
 for(const match of text.matchAll(/\/(?:site\/(?:generated|brand)|brand|homepage|approved-media)\/[^\s"'<>`\\)]+?\.(?:png|webp|svg|jpe?g|gif|avif)/g))if(!match[0].includes('${'))refs.add('public'+match[0]);
}
for(const name of ['assets','cta-assets','case-cta-assets']){
 for(const job of JSON.parse(await fs.readFile(`docs/live-review-2026-10-21/${name}.json`,'utf8')))refs.add(job.target);
}
const missing=[];
for(const file of refs){try{await fs.access(file);}catch{missing.push(file);}}
if(missing.length)throw Error('Missing referenced public assets: '+JSON.stringify(missing));
const candidates=git('ls-files','--others','--exclude-standard','--','public');
const assets=candidates.filter(file=>refs.has(file)||['public/site/live-corrections.css','public/site/live-corrections.js'].includes(file));
const tracked=git('diff','--name-only','--','src','public','site-templates','next.config.ts');
const code=git('ls-files','--others','--exclude-standard','--','src');
const docs=['docs/LIVE_REVIEW_2026-10-21.md',...git('ls-files','--others','--exclude-standard','--','docs/live-review-2026-10-21')];
const tests=['tests/url-hierarchy.test.ts','tests/concept-case-studies.test.ts','tests/general-artwork-overrides.test.ts'];
const scripts=['scripts/prepare-live-review-release.mjs','scripts/install-live-review-assets.mjs','scripts/check-live-review.ts','scripts/record-review-media-identities.ts'];
const files=[...new Set([...tracked,...code,...assets,...docs,...tests,...scripts])].sort();
await fs.mkdir('.local/live-corrections',{recursive:true});
await fs.writeFile('.local/live-corrections/release-files.json',JSON.stringify(files,null,2));
await fs.writeFile('.local/live-corrections/release-pathspec.txt',files.join('\n')+'\n');
const bytes=(await Promise.all(assets.map(file=>fs.stat(file)))).reduce((sum,stat)=>sum+stat.size,0);
console.log(JSON.stringify({files:files.length,newRuntimeAssets:assets.length,assetMB:+(bytes/1024/1024).toFixed(2),excludedUnreferencedAssets:candidates.length-assets.length,missing}));
