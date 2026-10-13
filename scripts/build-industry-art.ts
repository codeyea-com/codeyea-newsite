import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import measurements from '../docs/SITEWIDE_IMAGE_MEASUREMENTS.json';
import {industryNames, type IndustrySlug} from '../src/content/industry-registry';

const root='public/site/generated/industries';
const archive='C:/Users/grdez/Documents/codex-projects/codeyea/Generated images';
const topics: Record<string,{ar:string;rows:[string[],string[]];action:[string,string];color:string;folder:string}>={
 roofing:{ar:'خدمات الأسقف',rows:[['Roof inspection','Repairs','Project examples'],['فحص السقف','الصيانة','نماذج المشاريع']],action:['Request an inspection','اطلب فحصًا'],color:'#ce6531',folder:'Roofing'},
 healthcare:{ar:'الخدمات الصحية',rows:[['Care services','Professional profiles','Appointments'],['خدمات الرعاية','الفريق المختص','المواعيد']],action:['Request an appointment','اطلب موعدًا'],color:'#178b8d',folder:'Healthcare'},
 construction:{ar:'خدمات الإنشاءات',rows:[['Capabilities','Project types','Project enquiry'],['الإمكانات','أنواع المشاريع','استفسار مشروع']],action:['Discuss your project','ناقش مشروعك'],color:'#d19d24',folder:'Construction'},
 'e-commerce':{ar:'التجارة الإلكترونية',rows:[['Collections','Product information','Order status'],['المجموعات','معلومات المنتجات','حالة الطلب']],action:['Explore collections','اكتشف المجموعات'],color:'#6274d9',folder:'Ecommerce-industry'},
 'small-business':{ar:'الأعمال الصغيرة',rows:[['Services','Opening hours','Contact options'],['الخدمات','ساعات العمل','طرق التواصل']],action:['Send an enquiry','أرسل استفسارًا'],color:'#178d67',folder:'Small-business'},
 'event-coordinators':{ar:'المعارض ومؤتمرات الأعمال',rows:[['Trade exhibitions','Business conferences','B2B meetings'],['المعارض التجارية','مؤتمرات الأعمال','لقاءات B2B']],action:['Plan a business event','خطط لفعالية أعمال'],color:'#a36cba',folder:'Events'},
 legal:{ar:'الخدمات القانونية',rows:[['Practice areas','Professional profiles','Consultation request'],['مجالات الممارسة','الفريق المختص','طلب استشارة']],action:['Request a consultation','اطلب استشارة'],color:'#386d97',folder:'Legal'},
 'online-magazine':{ar:'النشر والمجلات',rows:[['Topics','Articles','Reading list'],['الموضوعات','المقالات','قائمة القراءة']],action:['Explore articles','اكتشف المقالات'],color:'#d35665',folder:'Online-magazine'},
 'oil-and-gas':{ar:'النفط والغاز',rows:[['Capabilities','Technical information','Project enquiries'],['الإمكانات','المعلومات التقنية','استفسارات المشاريع']],action:['Discuss requirements','ناقش المتطلبات'],color:'#397687',folder:'Oil-and-gas'},
 'real-estate':{ar:'الخدمات العقارية',rows:[['Property details','Current availability','Viewing request'],['تفاصيل العقار','التوفر الحالي','طلب زيارة']],action:['Request a viewing','اطلب زيارة'],color:'#a8703d',folder:'Real-estate'},
 'fashion-and-lifestyle':{ar:'أعمال الأزياء',rows:[['Collections','Size information','Stock availability'],['المجموعات','معلومات القياس','توفر المخزون']],action:['Explore the collection','اكتشف المجموعة'],color:'#ad4d85',folder:'Fashion'},
 'beauty-skincare-med-spa':{ar:'العناية والتجميل',rows:[['Services','Provider information','Consultation options'],['الخدمات','معلومات المختص','خيارات الاستشارة']],action:['Request a consultation','اطلب استشارة'],color:'#9c648a',folder:'Beauty-skincare'},
 'restaurants-cafes-bakeries':{ar:'المطاعم والمقاهي',rows:[['Menu','Location and hours','Ordering options'],['القائمة','الموقع والساعات','خيارات الطلب']],action:['View the menu','شاهد القائمة'],color:'#d77635',folder:'Restaurants-cafes'},
 'solar-energy':{ar:'الطاقة الشمسية',rows:[['Services','Technical capabilities','Site enquiries'],['الخدمات','الإمكانات التقنية','استفسارات الموقع']],action:['Discuss your site','ناقش موقعك'],color:'#278b74',folder:'Solar-energy'}
};

const roles=['hero','overview','strip-1','strip-2','strip-3','strip-4','needs','pillars','image-break','cta'];
const registry:Record<string,{src:string;mobileSrc:string;width:number;height:number;alt:string;expectedSource:string}>={};
const exists=async(p:string)=>fs.access(p).then(()=>true,()=>false);
const selected:unknown[]=[];
for(const [slug,frames] of Object.entries(measurements)){
 const dir=path.join(root,slug),archiveDir=path.join(archive,topics[slug].folder,'selected-2026-10-13');
 await fs.mkdir(archiveDir,{recursive:true});
 for(const [index,role] of roles.entries()){
  // Preserve approved decorative linework, not a generic generated UI.
  if(role==='overview'||role==='pillars')continue;
  const frame=frames.desktop[index];
  const sources:Record<string,string>={};
  for(const variant of role.startsWith('strip')?['desktop']:['desktop','mobile']){
   const versions=role==='strip-1'||role==='strip-3'?['-v6','-v5']:role==='image-break'?(['healthcare','e-commerce','online-magazine','solar-energy'].includes(slug)?['-v5']:['-v3']):slug==='event-coordinators'?['-v3']:['-v3','-v2',''];
   let input='';
   for(const version of versions){const candidate=path.join(dir,role+version+'-'+variant+'.png');if(await exists(candidate)){input=candidate;break;}}
   if(!input&&variant==='mobile'&&role==='image-break'){sources.mobile=sources.desktop;continue;}
   if(!input)throw Error('Missing approved-treatment asset '+slug+'/'+role+'/'+variant);
   const output=input.replace(/\.png$/,'.webp');
   if(!await exists(output))await sharp(input).webp({quality:88,effort:5}).toFile(output);
   await fs.copyFile(output,path.join(archiveDir,path.basename(output)));
   sources[variant]='/'+output.replaceAll('\\','/').replace(/^public\//,'');
   selected.push({page:slug,role,variant,source:input,output});
  }
  for(const locale of ['en','ar'] as const){
   const technical=role==='strip-1'||role==='strip-3'||sources.desktop.includes('image-break-v5');
   registry['generated-'+slug+'-'+role+'-'+locale]={src:sources.desktop,mobileSrc:sources.mobile||sources.desktop,width:Math.round(frame.w),height:Math.round(frame.h),expectedSource:frame.src,alt:locale==='ar'?topics[slug].ar+(technical?'، نموذج واجهة داخل شاشة جهاز':'، مشهد يوضح نشاط القطاع'):industryNames[slug as IndustrySlug]+(technical?': illustrative interface displayed on a device':': industry activity')};
  }
 }
}
await fs.writeFile('src/content/generated-artwork.json',JSON.stringify(registry,null,2)+'\n');
await fs.writeFile('docs/SELECTED_INDUSTRY_ASSETS.json',JSON.stringify(selected,null,2)+'\n');
console.log('Registered '+Object.keys(registry).length+' localized placements; decorative artwork preserved.');
