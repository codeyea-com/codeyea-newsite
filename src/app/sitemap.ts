import type {MetadataRoute} from 'next';
import {db} from '@/server/db';
import {publishedSitemap} from '@/server/site-index';
export const dynamic='force-dynamic';
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 if(process.env.SITE_INDEXING_ENABLED!=='true')return [];
 const pages=await db.page.findMany({where:{deletedAt:null,publishedAt:{not:null}},select:{id:true,publishedSnapshot:true,publishedAt:true}});
 return publishedSitemap(pages);
}
