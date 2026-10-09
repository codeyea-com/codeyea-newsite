import { actor, failure, jsonInput, noStore, sameOrigin } from '@/server/http';
import { initializeTemplatePages } from '@/server/site-editing';
import { z } from 'zod';

export async function POST(request:Request){
 try{
  sameOrigin(request);
  const user=await actor(request);
  z.object({}).strict().parse(await jsonInput(request));
  const result=await initializeTemplatePages(user?.id??null);
  return Response.json({ok:true,...result},{headers:noStore});
 }catch(error){return failure(error)}
}
