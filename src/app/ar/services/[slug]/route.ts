import { GET as documentGET } from '../../[slug]/route';
import { nestedServiceSlugs } from '@/content/url-hierarchy';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: {params: Promise<{slug: string}>}) {
  const {slug} = await context.params;
  if (!(nestedServiceSlugs as readonly string[]).includes(slug)) return new Response('Not found', {status: 404});
  return documentGET(request, context);
}
