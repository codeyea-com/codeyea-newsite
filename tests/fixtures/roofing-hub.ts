import {defaultRoofing} from '../../src/content/roofing-defaults';
import {industryDetailSchema,type DetailSection} from '../../src/schemas/industry-detail';
export function roofingHubFixture(locale='en',market='global'){
 const old=defaultRoofing(locale,market),media=old.hero.media;
 const find=(type:DetailSection['type'])=>structuredClone(old.sections.find(s=>s.type===type)!);
 const strip={...find('overview'),id:'roofing-strip',type:'strip' as const,heading:'Roofing gallery',body:'',items:[1,2,3,4].map(n=>({id:'roofing-strip-'+n,title:'Roofing image '+n,body:'',actionLabel:'',destination:'',media}))};
 const imageBreak={...find('overview'),id:'roofing-imageBreak',type:'imageBreak' as const,media};
 const services=find('services');services.listLabel='OUR SERVICES';
 const related={...find('related'),items:[]};
 return industryDetailSchema.parse({...old,schemaVersion:2,sections:[find('overview'),strip,find('needs'),imageBreak,services,find('growth'),find('faq'),related,{...find('cta'),media}]});
}
