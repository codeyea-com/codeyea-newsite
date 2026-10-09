import initial from './industries-initial.json';
import refined from './industries-refined-copy.json';
import {industriesPageSchema} from '../schemas/industries-page';
export function defaultIndustries(localeId:string,marketId:string){
 const content=industriesPageSchema.parse({...structuredClone(initial),localeId,marketId,seo:{title:'Industries We Serve | CODEYEA',description:'Digital solutions shaped around your industry, customers and workflows.'}});
 return industriesPageSchema.parse({...content,introduction:refined.introduction,items:content.items.map(item=>{const copy=refined.items.find(i=>i.title===item.title)!;return {...item,heading:item.title,body:copy.body,highlights:copy.highlights.map((h,n)=>({...h,id:item.highlights[n].id}))}})});
}
