import {db} from '../src/server/db';
import {bindDocumentControls, templateContent, type DocumentContent} from '../src/server/site-documents';
import {Prisma} from '../src/generated/prisma/client';

// Owner requested an unchecked, restorable Clients section in both locales.
const template = await templateContent('brand-design');
try {
  const documents = await db.siteDocument.findMany({where:{slug:'brand-design',locale:{in:['en','ar']}}});
  for (const document of documents) {
    const draft = await bindDocumentControls('brand-design', template, document.draft as DocumentContent);
    const clients = draft.controls.sections.find(section => section.label === 'Clients');
    if (!clients) throw new Error('Clients section missing from the approved manifest');
    clients.enabled = false;
    const published = document.published ? structuredClone(document.published) as {title:string;content:DocumentContent} : null;
    if (published) {
      published.content = await bindDocumentControls('brand-design', template, published.content);
      published.content.controls!.sections.find(section => section.key === clients.key)!.enabled = false;
    }
    await db.$transaction(async tx => {
      await tx.auditLog.create({data:{actorKind:'OPERATOR',actorLabel:'Owner-requested Brand Design correction',entityType:'SiteDocument',entityId:document.id,action:'owner.clients_hidden',before:{draft:document.draft,published:document.published},after:{section:clients.key,enabled:false}}});
      await tx.siteDocument.update({where:{id:document.id,version:document.version},data:{draft:draft as unknown as Prisma.InputJsonValue,...(published?{published:published as unknown as Prisma.InputJsonValue}:{}),version:{increment:1}}});
    });
    console.log(document.locale + ': Clients unchecked, content retained');
  }
} finally {await db.$disconnect();}
