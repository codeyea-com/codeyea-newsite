import { GET as documentGET } from '../../[slug]/route';
import { nestedServiceSlugs } from '@/content/url-hierarchy';
export const dynamic = 'force-dynamic';
export async function GET(request: Request, context: {params: Promise<{slug: string}>}) {
  let {slug} = await context.params;
  if(slug==='seo-geo-aeo')slug='seo-geo';
  if (!(nestedServiceSlugs as readonly string[]).includes(slug)) return new Response('Not found', {status: 404});
  return documentGET(request, {params:Promise.resolve({slug})});
}
