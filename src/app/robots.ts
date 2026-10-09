import type {MetadataRoute} from 'next';
import {siteOrigin} from '@/content/seo';

export const dynamic='force-dynamic';

export default function robots():MetadataRoute.Robots{
 return {
  rules:{userAgent:'*',allow:'/',disallow:['/admin','/login','/preview','/api']},
  ...(process.env.SITE_INDEXING_ENABLED==='true'?{sitemap:siteOrigin+'/sitemap.xml'}:{}),
 };
}
