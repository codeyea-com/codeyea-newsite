import {z} from 'zod';
import {aboutMediaSchema} from './about';
import {stableId,heading,copy,safeHref,uniqueIds} from './contract-primitives';
import {seoTextSchema} from './seo-text';

const line=z.object({id:stableId,text:heading}).strict();
const item=z.object({id:stableId,enabled:z.boolean().optional(),label:copy,title:heading,body:copy,list:z.array(line).max(12).refine(uniqueIds),destination:safeHref.nullable(),actionLabel:copy,media:aboutMediaSchema.optional()}).strict();
export const serviceSectionIds=['services-intro','services-priority','services-strategy','services-complete','services-process','services-growth','services-faq','services-cta'] as const;
const section=z.object({id:z.enum(serviceSectionIds),label:copy,heading,body:copy,closing:copy,items:z.array(item).max(12).refine(uniqueIds),outcomes:z.array(item).max(4).refine(uniqueIds),media:aboutMediaSchema.optional(),actionLabel:copy,destination:safeHref.nullable()}).strict();
export const servicesPageSchema=z.object({schemaVersion:z.literal(1),localeId:stableId,marketId:stableId,seo:seoTextSchema.optional(),hero:z.object({id:z.literal('services-hero'),title:heading,media:aboutMediaSchema}).strict(),imageStatus:z.literal('temporary — image selection pending'),sections:z.array(section).length(8)}).strict().superRefine((v,ctx)=>{
 const sizes=[4,4,v.sections[2]?.items.length===3?3:2,8,3,4,8,0];
 const partner=v.sections[2]?.items[2];
 if(partner&&(partner.id!=='services-strategy-partner'||partner.list.length!==0))ctx.addIssue({code:'custom',path:['sections',2,'items',2],message:'Preserve the approved partner item identity.'});
 v.sections.forEach((s,n)=>{if(s.id!==serviceSectionIds[n])ctx.addIssue({code:'custom',path:['sections',n,'id'],message:'Preserve the approved section order.'});if(s.items.length!==sizes[n])ctx.addIssue({code:'custom',path:['sections',n,'items'],message:`This section requires ${sizes[n]} items.`});if(s.outcomes.length!==(n===0?4:0))ctx.addIssue({code:'custom',path:['sections',n,'outcomes'],message:'Preserve the four introduction outcomes.'});});
 const ids=[v.hero.id,...v.sections.flatMap(s=>[s.id,...[...s.items,...s.outcomes].flatMap(i=>[i.id,...i.list.map(l=>l.id)])])];if(new Set(ids).size!==ids.length)ctx.addIssue({code:'custom',message:'Every section and collection item needs a unique stable ID.'});
});
export type ServicesContent=z.infer<typeof servicesPageSchema>;
export type ServiceSection=ServicesContent['sections'][number];
export type ServiceItem=ServiceSection['items'][number];
