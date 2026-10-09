import {z} from 'zod';
import {aboutMediaSchema} from './about';
import {stableId,uniqueIds,safeHref} from './contract-primitives';
import {industrySlugs} from '../content/industry-registry';
export const detailTypes=['overview','strip','needs','imageBreak','services','growth','process','outcomes','faq','related','cta'] as const;
export const roofingHubOrder=['overview','strip','needs','imageBreak','services','growth','faq','related','cta'] as const;
const legacyOrder=['overview','needs','services','growth','process','outcomes','faq','related','cta'];
const text=z.string().trim().min(1);
export const detailDestination=z.string().max(240).refine(v=>v===''||v==='#contact'||/^\/(?!\/)[a-z0-9\-/]*$/.test(v),'Use an internal path, #contact, or leave unconfigured.');
export const detailItemSchema=z.object({id:stableId,title:text.max(160),body:z.string().trim().max(1400),actionLabel:z.string().trim().max(100),destination:detailDestination,media:aboutMediaSchema.optional()}).strict();
export const detailSectionSchema=z.object({id:stableId,type:z.enum(detailTypes),enabled:z.boolean(),label:text.max(100),heading:text.max(180),body:z.string().trim().max(5000),items:z.array(detailItemSchema).max(12).refine(uniqueIds,'Item IDs must be unique'),media:aboutMediaSchema.optional(),pillarMedia:aboutMediaSchema.optional(),temporaryMedia:z.boolean(),actionLabel:z.string().trim().max(100),destination:z.union([z.literal(''),safeHref]),listLabel:z.string().trim().max(80).optional()}).strict().superRefine((s,ctx)=>{
 const bounds:Partial<Record<typeof s.type,[number,number]>>={strip:[4,5],needs:[3,4],services:[4,8],growth:[4,4],process:[4,4],outcomes:[3,4],faq:[5,7],related:[0,12]};const b=bounds[s.type];if(b&&(s.items.length<b[0]||s.items.length>b[1]))ctx.addIssue({code:'custom',path:['items'],message:`Use ${b[0]}–${b[1]} items for ${s.type}.`});
});
export const industryDetailSchema=z.object({schemaVersion:z.union([z.literal(1),z.literal(2)]),slug:z.enum(industrySlugs),seo:z.object({title:text.max(120),description:text.max(300)}).strict().optional(),localeId:stableId,marketId:stableId,hero:z.object({title:text.max(120),enabled:z.boolean().optional(),media:aboutMediaSchema,temporaryMedia:z.boolean()}).strict(),sections:z.array(detailSectionSchema).length(9).refine(uniqueIds,'Section IDs must be unique')}).strict().superRefine((c,ctx)=>{
 const order=c.schemaVersion===2?roofingHubOrder:legacyOrder;
 if(!c.sections.every((s,n)=>s.type===order[n]&&s.id===c.slug+'-'+s.type))ctx.addIssue({code:'custom',path:['sections'],message:'Preserve the approved section identity and order'});
 if(c.schemaVersion===2){
  const strip=c.sections.find(s=>s.type==='strip')!;
  if(strip.items.some(i=>!i.media))ctx.addIssue({code:'custom',path:['sections',1,'items'],message:'Each strip item requires its own media selection'});
  if(c.sections.find(s=>s.type==='related')!.items.length)ctx.addIssue({code:'custom',path:['sections',7,'items'],message:'Industry links come from the shared Industries collection'});
 }
});
export type IndustryDetailContent=z.infer<typeof industryDetailSchema>;
export type DetailSection=z.infer<typeof detailSectionSchema>;
