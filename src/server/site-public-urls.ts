import 'server-only';
import { db } from '@/server/db';
import { documentPath } from '@/content/site-routes';
import { siteOrigin } from '@/content/seo';
import { documentContent } from '@/server/site-editing';
import { documentRobots, approvedTemplates } from '@/server/site-documents';
import { z } from 'zod';

const publication = z.object({ title: z.string().min(1), content: documentContent });

export async function documentAlternates(slug: string): Promise<Partial<Record<'en'|'ar', string>>> {
  if (process.env.SITE_INDEXING_ENABLED !== 'true') return {};
  const documents = await db.siteDocument.findMany({ where: { slug, kind: 'page' }, select: { locale: true, template: true, published: true } });
  const links: Partial<Record<'en'|'ar', string>> = {};
  for (const document of documents) {
    if ((document.locale !== 'en' && document.locale !== 'ar') || !document.template || !approvedTemplates[document.template] || document.published === null) continue;
    const path = documentPath(slug, document.locale);
    const parsed = publication.safeParse(document.published);
    if (!path || !parsed.success || documentRobots(parsed.data.content, true).startsWith('noindex')) continue;
    links[document.locale] = new URL(parsed.data.content.seo?.canonicalPath || path, siteOrigin).href;
  }
  return links;
}
