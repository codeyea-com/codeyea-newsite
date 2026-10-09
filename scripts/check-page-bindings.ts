import 'dotenv/config';
import {db} from '../src/server/db';
import {bindTemplate,templateContent} from '../src/server/site-documents';
import {documentContent} from '../src/server/site-editing';
let failures=0;
try {
 const docs=await db.siteDocument.findMany({where:{template:{not:null}},select:{slug:true,template:true,draft:true}});
 for(const doc of docs){try{bindTemplate(await templateContent(doc.template!),documentContent.parse(doc.draft));console.log(`OK: ${doc.slug}`)}catch{failures++;console.error(`Content mapping requires review: ${doc.slug}`)}}
 console.log(`${docs.length} drafts checked; ${failures} mapping failures. No changes saved.`);
 process.exitCode=failures?1:0;
}finally{await db.$disconnect()}
