import 'dotenv/config';
import {db} from '../src/server/db';
import {approvedTemplates,templateContent,extractFields,templateHash} from '../src/server/site-documents';
for(const slug of Object.keys(approvedTemplates)){const html=await templateContent(slug);const title=slug.split('-').map(s=>s[0].toUpperCase()+s.slice(1)).join(' ');await db.siteDocument.upsert({where:{slug_locale:{slug,locale:'en'}},update:{},create:{slug,locale:'en',kind:'page',title,template:slug,draft:{templateHash:templateHash(html),fields:extractFields(html),description:''}}});console.log('Imported private draft: '+slug)}await db.$disconnect();
