import fs from 'node:fs/promises';
import {build} from 'esbuild';
import {db} from '../src/server/db';
import {industrySlugs} from '../src/content/industry-registry';
import {snapshotSchema} from '../src/schemas/content';
import {arabicIndustrySnapshot,arabicSnapshot} from '../src/content/arabic-localization';

const root='docs/section-imagery-preview/owner-batch';
const origin='http://127.0.0.1:3014';
const preview='http://127.0.0.1:3011/owner-batch';
await fs.mkdir(root,{recursive:true});
try {
  await build({entryPoints:['scripts/hero-review-entry.tsx'],bundle:true,minify:true,jsx:'automatic',outfile:root+'/hero.js',publicPath:preview,loader:{'.woff':'file','.woff2':'file'},define:{'process.env.NODE_ENV':'"production"'},plugins:[{name:'review-adapter',setup(api){
    api.onResolve({filter:/^next\/(navigation|script)$/},args=>({path:args.path,namespace:'review'}));
    api.onLoad({filter:/.*/,namespace:'review'},args=>({contents:args.path==='next/navigation'?'export function usePathname(){return document.documentElement.lang === "ar" ? "/ar/" : "/"}':'export default function Script(){return null}',loader:'js'}));
    api.onResolve({filter:/^\/(site|brand|homepage)\//},args=>({path:origin+args.path,external:true}));
  }}]});
  for (const id of ['about','services','industries',...industrySlugs]) {
    const rows=await db.page.findMany({where:{id:{in:[id,'ar-'+id]}},select:{id:true,publishedSnapshot:true,draftSnapshot:true}});
    const enRow=rows.find(p=>p.id===id);
    const en=snapshotSchema.parse(enRow?.draftSnapshot??enRow?.publishedSnapshot);
    const arRow=rows.find(p=>p.id==='ar-'+id);
    const ar=arRow?.draftSnapshot?snapshotSchema.parse(arRow.draftSnapshot):en.industryDetail?arabicIndustrySnapshot(en):arabicSnapshot(en);
    for (const [locale,snapshot] of [['en',en],['ar',ar]] as const) {
      const json=JSON.stringify({snapshot,locale}).replace(/</g,'\\u003c');
      await fs.writeFile(`${root}/${id}-${locale}.html`,`<!doctype html><html lang="${locale}" dir="${locale==='ar'?'rtl':'ltr'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>${snapshot.title} | Hero review</title><base href="${origin}/"><link rel="stylesheet" href="${preview}/hero.css">${['page-texture','shared-layout','post-launch','owner-review'].map(f=>`<link rel="stylesheet" href="/site/${f}.css">`).join('')}<link rel="stylesheet" href="/api/site-typography"><link rel="stylesheet" href="/site/owner-batch.css"></head><body><div id="root"></div><script id="review-data" type="application/json">${json}</script><script defer src="${preview}/hero.js"></script><script defer src="/site/post-launch.js"></script></body></html>`);
    }
  }
  console.log('Built 34 full-page batch reviews from real components and existing snapshots, without CMS changes.');
} finally {await db.$disconnect();}
