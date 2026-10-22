import fs from 'node:fs/promises';
import { resolvePageAdditions, pageAdditionsSchema } from '../src/schemas/page-additions';

const connection=new URL(process.env.DATABASE_URL!);
if(!['127.0.0.1','localhost'].includes(connection.hostname))throw Error('Local review database required');
connection.pathname='/codeyea_owner_review_oct19';process.env.DATABASE_URL=connection.href;
const { db }=await import('../src/server/db');
const { permissionsFor }=await import('../src/server/permissions');
const { saveSiteDraft, documentContent }=await import('../src/server/site-editing');
const { bindDocumentControls, bindTemplate, templateContent }=await import('../src/server/site-documents');

const users=await db.user.findMany({select:{id:true}});
let actor:string|undefined;
for(const user of users)if((await permissionsFor(user.id)).includes('edit_pages')){actor=user.id;break}
if(!actor)throw Error('No existing page editor in the local review database');
const documents=await db.siteDocument.findMany({where:{slug:{in:['website-design','brand-design','ecommerce']},kind:'page'}});
const results=[];
for(const doc of documents){
  const original=documentContent.parse(doc.draft);
  const template=await templateContent(doc.slug);
  const draft=await bindDocumentControls(doc.slug,template,bindTemplate(template,original),doc.locale);
  const expected=pageAdditionsSchema.parse(resolvePageAdditions(doc.slug,original.additions,doc.locale));
  await saveSiteDraft(actor,{id:doc.id,title:doc.title,version:doc.version,draft});
  const saved=await db.siteDocument.findUniqueOrThrow({where:{id:doc.id}});
  const actual=documentContent.parse(saved.draft);
  if(JSON.stringify(actual.additions)!==JSON.stringify(expected))throw Error('CMS copy did not round-trip: '+doc.slug+'/'+doc.locale);
  results.push({slug:doc.slug,locale:doc.locale,galleryCaptions:actual.additions?.galleryCaptions?.length,faqQuestions:actual.additions?.faq?.items.length||0,version:saved.version,fieldMapPreserved:JSON.stringify(original.fields)===JSON.stringify(actual.fields),templateValidated:actual.templateHash===draft.templateHash});
}
await fs.mkdir('docs/live-review-2026-10-22',{recursive:true});
await fs.writeFile('docs/live-review-2026-10-22/cms-sync.json',JSON.stringify({database:'codeyea_owner_review_oct19',productionDatabaseChanged:false,results},null,2));
console.log(JSON.stringify({documents:results.length,results}));
await db.$disconnect();
