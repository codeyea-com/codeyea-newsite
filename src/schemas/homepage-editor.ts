import {z} from 'zod';
import {stableId,identity,mediaRef,safeHref,uniqueIds} from './contract-primitives';
import {homepageAssets} from '../content/homepage-assets';
import {seoTextSchema} from './seo-text';
export type EditorObject = {[key:string]:string|number|boolean|EditorObject|EditorObject[]};
export type HomepageContent = {schemaVersion:1;localeId:string;marketId:string;[key:string]:unknown};
export type Field = {key:string;label:string;type:'text'|'copy'|'number'|'boolean'|'link'|'media'|'select'|'collection';required?:boolean;max?:number;min?:number;options?:string[];fields?:Field[]};
const text=(key:string,label:string,max=180,required=true):Field=>({key,label,type:'text',max,required});
const copy=(key='body',label='Supporting copy'):Field=>({key,label,type:'copy',max:2000});
const link=(key='href',label='Destination',required=true):Field=>({key,label,type:'link',required});
const collection=(key:string,label:string,fields:Field[],max:number,min=0):Field=>({key,label,type:'collection',fields,max,min});
const media:Field={key:'media',label:'Image',type:'media'};
const cta=[text('ctaLabel','CTA label',80),link('ctaHref','CTA destination')];
const title=text('title','Title',100);
export const homepageEditorSections:{key:string;label:string;fields:Field[]}[]=[
 {key:'seo',label:'Search & sharing',fields:[text('title','Search title',120),{key:'description',label:'Search description',type:'copy',max:320}]},
 {key:'header',label:'Header & navigation',fields:[collection('items','Navigation',[title,link(),text('parentId','Parent navigation item',100,false)],24,1),collection('actions','Mobile secondary actions',[title,link()],3,0)]},
 {key:'hero',label:'Hero',fields:[text('prefix','Heading prefix',180),text('suffix','Heading suffix',80,false),collection('words','Rotating words',[title],8,1),copy(),...cta,media]},
 {key:'logos',label:'Client logos',fields:[collection('items','Logos',[text('title','Client name'),media,link('href','Approved destination (optional)',false)],6)]},
 {key:'positioning',label:'Positioning',fields:[]},
 {key:'services',label:'Services',fields:[collection('items','Services',[{key:'icon',label:'Icon',type:'select',options:['development','commerce','automation','hosting','growth','creative','support','strategy']},title,copy(),...cta],8,1)]},
 {key:'about',label:'About',fields:[text('eyebrow','Eyebrow'),text('heading','Heading'),copy(),media,collection('items','Accordions',[title,copy()],5,1),...cta]},
 {key:'experience',label:'Experience',fields:[text('heading','Heading'),copy(),{key:'value',label:'Experience value',type:'number',min:0,max:999},text('unit','Unit / label',80),{key:'approved',label:'Claim verified and approved',type:'boolean'},...cta,media]},
 {key:'flow',label:'Service flow',fields:[collection('items','Service flow panels',[title,copy(),media,text('ctaLabel','CTA label',80,false),link('ctaHref','CTA destination',false)],3,1)]},
 {key:'hosting',label:'Hosting',fields:[text('heading','Heading'),copy(),text('monthlyLabel','Monthly option label',40),text('annualLabel','Annual option label',40),collection('features','Feature rows',[title],12,1),collection('plans','Hosting plans',[title,text('monthlyPrice','Monthly price (or TBC)',20),text('annualPrice','Annual price (or TBC)',20),text('monthlyUnit','Monthly billing unit',30),text('annualUnit','Annual billing unit (or TBC)',30),copy('description','Short positioning line'),text('renewal','Renewal note',200),{key:'featured',label:'Featured plan',type:'boolean'},collection('values','Feature values',[text('featureId','Feature row',100),text('value','Value / inclusion',200)],12,1),...cta],3,1)]},
 {key:'projects',label:'Case Studies',fields:[text('heading','Section heading'),text('eyebrow','Eyebrow'),...cta,collection('items','Projects',[title,text('categories','Categories (comma separated)',100),copy(),media,link('href','Approved destination (optional)',false),{key:'featured',label:'Featured (shown first, then collection order)',type:'boolean'},{key:'approved',label:'Owner approved real project for selected work',type:'boolean',required:false}],12,1)]},
 {key:'industries',label:'Industries',fields:[text('heading','Section heading'),copy(),...cta,collection('items','Industries',[title,text('eyebrow','Eyebrow'),copy(),media,link('href','Approved destination (optional)',false)],8,1)]},
 {key:'footer',label:'Footer',fields:[text('heading','Heading prefix'),text('suffix','Heading suffix'),collection('words','Rotating words',[title],8,1),text('supportHeading','Supporting heading'),copy(),...cta,collection('groups','Link groups',[title,collection('links','Links',[title,link()],8)],3,1),copy('contact','Contact details'),text('copyright','Copyright text',200)]}
];
for(const section of homepageEditorSections){
 if(['hero','logos','services','about','experience','flow','hosting','projects','industries'].includes(section.key))
  section.fields.unshift({key:'enabled',label:'Show this section',type:'boolean'});
}
export const editorMediaSchema=mediaRef.safeExtend({width:z.number().int().min(16).max(8192).optional(),height:z.number().int().min(16).max(8192).optional(),focalX:z.number().min(0).max(100),focalY:z.number().min(0).max(100)}).refine(v=>homepageAssets.some(a=>a.id===v.mediaId)||/^media_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v.mediaId),'Choose a registered image');
function fieldSchema(field:Field):z.ZodType{
 switch(field.type){
 case 'collection':return z.array(objectSchema(field.fields!,true)).min(field.min??0).max(field.max??12).refine(v=>new Set(v.map(i=>i.id)).size===v.length,'Duplicate item IDs').refine(v=>v.filter(i=>i.enabled).length>=(field.min??0),'Enable the minimum number of items').refine(v=>new Set(v.map(i=>i.position)).size===v.length,'Duplicate order positions');
 case 'media':return editorMediaSchema;
 case 'number':return z.number().int().min(field.min??0).max(field.max??999);
 case 'boolean':return field.key==='enabled'?z.boolean().default(true):z.boolean();
 case 'select':return z.enum(field.options as [string,...string[]]);
 case 'link':return field.required?safeHref:z.union([z.literal(''),safeHref]);
 default:return z.string().trim().min(field.required?1:0).max(field.max??2000);
 }
}
function objectSchema(fields:Field[],item=false){return z.object({...item?{...identity,position:z.number().int().nonnegative(),enabled:z.boolean()}:{},...Object.fromEntries(fields.map(f=>[f.key,f.required===false&&f.type==='boolean'?fieldSchema(f).optional():fieldSchema(f)]))}).strict();}
export const homepageEditorSchema=z.object({schemaVersion:z.literal(1),localeId:stableId,marketId:stableId,...Object.fromEntries(homepageEditorSections.filter(s=>s.key!=='positioning'&&s.key!=='seo').map(s=>[s.key,objectSchema(s.fields)])),seo:seoTextSchema.default({title:'Website Design, SEO & Digital Services | CODEYEA',description:'CODEYEA builds websites, apps, e-commerce experiences and digital growth systems for businesses worldwide.'})}).strict().superRefine((raw,ctx)=>{
 const value=raw as unknown as Record<string,EditorObject>;const items=value.header.items as EditorObject[];
 items.forEach((item,i)=>{if(item.parentId&&!items.some(p=>p.id===item.parentId&&!p.parentId&&p.id!==item.id&&(!item.enabled||p.enabled)))ctx.addIssue({code:'custom',path:['header','items',i,'parentId'],message:'Choose an enabled root parent; one submenu level only'});});
 (value.flow.items as EditorObject[]).forEach((item,i)=>{if(Boolean(item.ctaLabel)!==Boolean(item.ctaHref))ctx.addIssue({code:'custom',path:['flow','items',i,item.ctaHref?'ctaLabel':'ctaHref'],message:'Provide both CTA label and destination, or leave both empty'});});
 const plans=value.hosting.plans as EditorObject[],features=value.hosting.features as EditorObject[];
 if(plans.filter(p=>p.enabled&&p.featured).length>1)ctx.addIssue({code:'custom',path:['hosting','plans'],message:'Only one visible featured plan is allowed'});
 plans.forEach((plan,i)=>{for(const key of ['monthlyPrice','annualPrice'])if(!/^(TBC|\$?\d{1,7}(\.\d{1,2})?)$/.test(String(plan[key])))ctx.addIssue({code:'custom',path:['hosting','plans',i,key],message:'Use a non-negative price or TBC'});
 for(const key of ['monthlyUnit','annualUnit'])if(!/^(TBC|\/(mo|month|yr|year))$/.test(String(plan[key])))ctx.addIssue({code:'custom',path:['hosting','plans',i,key],message:'Use /mo, /month, /yr, /year or TBC'});
 const values=plan.values as EditorObject[];if(new Set(values.map(v=>v.featureId)).size!==values.length||values.some(v=>!features.some(f=>f.id===v.featureId))||features.some(f=>f.enabled&&!values.some(v=>v.featureId===f.id&&v.enabled)))ctx.addIssue({code:'custom',path:['hosting','plans',i,'values'],message:'Provide exactly one enabled value for each enabled feature row'});
 });
 const visit=(node:unknown,path:(string|number)[])=>{if(Array.isArray(node))node.forEach((item,i)=>visit(item,[...path,i]));else if(node&&typeof node==='object'){const item=node as Record<string,unknown>;if('position' in item&&(item.localeId!==raw.localeId||item.marketId!==raw.marketId))ctx.addIssue({code:'custom',path,message:'Collection locale and market must match the homepage'});Object.entries(item).forEach(([key,item])=>visit(item,[...path,key]));}};visit(raw,[]);
});
export function enabledItems(value:unknown):EditorObject[]{return (Array.isArray(value)?value as EditorObject[]:[]).filter(i=>i.enabled).sort((a,b)=>Number(a.position)-Number(b.position));}
