import {db} from '@/server/db';
import {actor,failure,noStore} from '@/server/http';
import {requirePermission} from '@/server/permissions';
import {buildPageCatalog} from '@/content/page-catalog';
import {permissionsFor} from '@/server/permissions';

export async function GET(req:Request){
 try{
  const user=await actor(req);
  await requirePermission(user?.id??null,'view_admin');
  const [pages,documents]=await Promise.all([
   db.page.findMany({where:{deletedAt:null},select:{id:true,title:true,publishedAt:true,publishedSnapshot:true,updatedAt:true}}),
   db.siteDocument.findMany({where:{kind:'page'},select:{id:true,title:true,slug:true,locale:true,published:true,updatedAt:true,kind:true}}),
  ]);
  const permissions=await permissionsFor(user?.id??null);
  return Response.json({indexingEnabled:process.env.SITE_INDEXING_ENABLED==='true',canEditPages:permissions.includes('edit_pages'),routes:buildPageCatalog({pages,documents})},{headers:noStore});
 }catch(e){return failure(e)}
}
