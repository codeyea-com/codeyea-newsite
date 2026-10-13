import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import plan from '../docs/APPROVED_SERVICE_IMAGE_PLAN.json';
import slots from '../docs/TEMPLATE_IMAGE_SLOTS.json';
import type {ServiceArtwork} from '../src/content/generated-service-artwork';

const partial = process.argv.includes('--partial');
const archive = 'C:/Users/grdez/Documents/codex-projects/codeyea/Generated images';
const exists = (file: string) => fs.access(file).then(() => true, () => false);
const registry: Record<string, Record<string, ServiceArtwork>> = {};
const selected: unknown[] = [];
const ar: Record<string, string> = {
 'collage-logo':'رسم فكرة شعار بالقلم على لوح رقمي', 'collage-colors':'اختيار ألوان الهوية والخطوط بين أعضاء فريق التصميم',
 'collage-materials':'هوية بصرية مطبقة على التغليف والمواد الترويجية', 'film-logo-process':'مراحل تطوير الشعار على ورق الرسم',
 'film-print':'مراجعة عينات الطباعة والألوان', 'film-packaging':'تطبيق الهوية البصرية على عبوات المنتجات',
 'film-typography':'مقارنة الخطوط وتنسيقات الهوية', 'work-identity':'تطوير شعار وهوية على شاشة لوح رقمي',
 'work-applications':'هوية متناسقة على مواد ترويجية', 'work-campaign':'تصميم مطبوعات الحملة',
 'work-social':'تصميم محتوى العلامة على هاتف موضوع على حامل', 'work-direction':'إخراج فني لتصوير منتجات العلامة',
 'capabilities':'دليل استخدام الهوية على شاشة حاسوب محمول',
 'overview':'تصور يوضح فائدة الخدمة ونتيجتها', 'challenges':'مشهد يوضح التحديات التي تعالجها الخدمة',
 'collage-workflow':'تسلسل أتمتة على شاشة حاسوب محمول', 'collage-invoice':'إعداد الفواتير ومراجعتها داخل نظام على لوح رقمي',
 'collage-assistant':'مساعد معرفي على شاشة مكتب', 'collage-technical':'مراجعة تقنية للموقع على شاشة حاسوب',
 'collage-content':'تخطيط محتوى واضح قابل للاكتشاف', 'collage-local':'نتائج البحث المحلي على هاتف داخل موقع النشاط',
 'include-1':'تطبيق عملي مرتبط بخدمة الصفحة', 'include-2':'مراجعة خطوات العمل ومعلوماته', 'include-3':'تحليل وتحسين العمل',
 'collage-saas':'مساعد يسترجع المعرفة المعتمدة على شاشة مكتب',
 'collage-audit':'تدقيق الموقع وتحليل بنيته على شاشة حاسوب محمول',
 'include-assistant':'مساعد معرفي على شاشة مكتب يجيب من أدلة الشركة المعتمدة',
 'include-task':'فرز الطلبات وتوجيهها عبر مسار عمل مترابط',
 'include-control':'إدارة الصلاحيات والمراجعة داخل نظام العمل',
 'include-audit':'مراجعة تقنية لأداء الموقع وصفحاته',
 'include-pages':'تطوير صفحات واضحة ومفيدة للزائر',
 'include-evidence':'مقال منظم على لوح رقمي يوضح الخبرة والمصادر',
 'path-1':'نموذج خدمة رقمية داخل جهاز في سياق استخدام واقعي', 'path-2':'مراجعة الخطوات المهمة والتحكم فيها', 'path-3':'مراجعة النتائج وتحديد التحسينات التالية'
};
async function convert(input: string, folder: string) {
 const output = input.replace(/\.png$/, '.webp');
 if (!await exists(output)) await sharp(input).webp({quality:88, effort:5}).toFile(output);
 const dest = path.join(archive, folder, 'selected-2026-10-13');
 await fs.mkdir(dest, {recursive:true});
 await fs.copyFile(output, path.join(dest, path.basename(output)));
 const metadata = await sharp(output).metadata();
 selected.push({input, output, width:metadata.width, height:metadata.height, alpha:metadata.hasAlpha});
 return '/' + path.relative('public', output).replaceAll('\\','/');
}
for (const job of plan.filter(j => j.variant === 'desktop')) {
 const input = path.join('public/site/generated',job.page,job.name+'.png');
 if (!await exists(input)) { if(partial) continue; throw Error('Missing '+input); }
 const mobile = plan.find(j => j.page === job.page && j.index === job.index && j.variant === 'mobile');
 const mobileInput = mobile && path.join('public/site/generated',job.page,mobile.name+'.png');
 if(mobileInput && !await exists(mobileInput) && !partial)throw Error('Missing '+mobileInput);
 const source = (slots as Record<string,Array<{n:number;source:string}>>)[job.page]?.find(x=>x.n===job.index)?.source;
 const scene = job.prompt.match(/Scene: ([\s\S]*?) Photography must/)?.[1] || job.role;
 const art: ServiceArtwork = {
  src: await convert(input, job.folder),
  ...(mobileInput && await exists(mobileInput) ? {mobileSrc:await convert(mobileInput,job.folder)} : {}),
  ...(source ? {originalSource:source} : {}),
  transparent:job.transparent,
  alt:{en:scene.split('. ')[0], ar:ar[job.role] || 'تصور توضيحي للخدمة داخل سياق العمل'}
 };
 (registry[job.page] ||= {})[String(job.index)] = art;
}
// The vision heading contains two tiny images: reuse suitable clean scenes, not new artwork.
for(const slug of ['seo-geo','ai-automation']) {
 for(const [target,origin] of [[6,3],[7,4]]) if(registry[slug]?.[origin]) {
  const source=(slots as Record<string,Array<{n:number;source:string}>>)[slug].find(x=>x.n===target)?.source;
  registry[slug][target]={...registry[slug][origin],originalSource:source,alt:{en:'',ar:''}};
 }
 for(let i=1;i<=6;i++) for(const variant of ['desktop','mobile']) {
  const stem=i%2===1?`work-${i}-context`:`photo-${i}`;
  const input=`public/site/generated/${slug}/${stem}-${variant}.png`;
  if(await exists(input))await convert(input,slug);
  else if(!partial)throw Error('Missing '+input);
 }
}
await fs.writeFile('src/content/generated-service-artwork.json',JSON.stringify(registry,null,2)+'\n');
await fs.writeFile('docs/SELECTED_SERVICE_ASSETS.json',JSON.stringify(selected,null,2)+'\n');
console.log(JSON.stringify({slots:Object.fromEntries(Object.entries(registry).map(([s,v])=>[s,Object.keys(v).length])),files:selected.length,partial}));
