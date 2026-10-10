import { snapshotSchema } from '@/schemas/content';
import { db } from '@/server/db';
import { documentPath } from '@/content/site-routes';
import { documentContent } from '@/server/site-editing';
import { documentRobots, renderDocument } from '@/server/site-documents';
import { noStore } from '@/server/http';
import { documentAlternates } from '@/server/site-public-urls';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
const publication = z.object({ title: z.string().min(1), content: documentContent });

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const path = documentPath(slug, 'ar');
  if (!path) return new Response('Not found', { status: 404, headers: noStore });
  const homepage = await db.page.findFirst({ where: { id: "homepage", deletedAt: null }, select: { publishedSnapshot: true } });
  const sharedSnapshot = snapshotSchema.safeParse(homepage?.publishedSnapshot);
  const shared = sharedSnapshot.success ? sharedSnapshot.data.homepage : undefined;
  const doc = await db.siteDocument.findUnique({ where: { slug_locale: { slug, locale: 'ar' } } });
  if (!doc || doc.kind !== 'page' || !doc.template || !doc.published) return new Response('Not found', { status: 404, headers: noStore });
  const published = publication.safeParse(doc.published);
  if (!published.success) return new Response('Page is temporarily unavailable', { status: 503, headers: { ...noStore, 'Retry-After': '60', 'X-Robots-Tag': 'noindex, nofollow' } });
  const { title, content } = published.data;
  const alternates = await documentAlternates(slug);
  return new Response(await renderDocument(doc.template, content, 'ar', title, { public: true, alternates, shared }), {
    headers: { ...noStore, 'Content-Type': 'text/html; charset=utf-8', 'X-Robots-Tag': documentRobots(content, true), 'X-Content-Type-Options': 'nosniff' },
  });
}
