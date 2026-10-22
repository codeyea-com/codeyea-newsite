/** Owner-directed copy corrections on approved document templates. */
export function applyLiveReviewContent(html:string,slug:string,locale:string){
 const ar=locale==='ar';
 html=html.replace(/(<(?:script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)>)|([^<]+)|(<[^>]+>)/gi,(all,protectedBlock,text,tag)=>{
  if(protectedBlock)return all;
  return (text||tag).replace(/SEO\s*(?:&amp;|&)\s*GEO(?!\s*(?:,|&)\s*AEO)/g,'SEO, GEO &amp; AEO').replace(/SEO\s*و\s*GEO(?!\s*و\s*AEO)/g,'SEO وGEO وAEO').replace(/خلّ?ينا نحچ?ي\.?/g,'لنتحدث عن مشروعك.');
 });
 if(slug==='seo-geo'){
  html=html.replace('What is the difference between SEO and GEO?','What is the difference between SEO, GEO and AEO?');
  html=html.replace(/ما الفرق بين SEO وGEO؟/g,'ما الفرق بين SEO وGEO وAEO؟');
  const question=ar?'ما هو AEO وكيف يرتبط بالمحتوى؟':'What is AEO and how does it relate to content?';
  const answer=ar?'تحسين محركات الإجابة (AEO) ينظم المحتوى حول أسئلة الجمهور وإجابات مباشرة وواضحة، مع معلومات موثوقة وبنية مناسبة تساعد أنظمة البحث والمساعدات على فهم الإجابة. يتكامل مع SEO وGEO، ولا يضمن الظهور أو الاقتباس في منصة محددة.':'Answer Engine Optimization (AEO) organizes content around audience questions and clear, direct answers, supported by reliable information and a structure that helps search systems and assistants understand the answer. It complements SEO and GEO without guaranteeing placement or citations on any platform.';
  html=html.replace(/(<section\b[^>]*(?:ai-faq|e-faq)[^>]*>[\s\S]*?<\/h2>[\s\S]*?<\/div>\s*<div>)/,'$1'+`<details><summary class="cy-faq-question">${question}</summary><p>${answer}</p></details>`);
 }
 if(slug==='contact'&&ar){
  html=html.replace(/وكالة\s*(?:<[^>]+>\s*)*للتصميم\s*(?:<[^>]+>\s*)*والابتكار\s*(?:<[^>]+>\s*)*الرقمي?/g,'وكالة الابتكار الرقمي');
 }
 if(['website-design','brand-design','ecommerce','seo-geo','digital-marketing','web-mobile-apps','ai-automation','technical-support'].includes(slug)){
  html=html.replace(/(<section\b[^>]*class=")([^"]*\bb-contact\b[^"]*)(")/g,`$1$2 cy-photo-cta$3 style="--cta-photo:url(/site/generated/${slug}/cta-live-review.webp)"`);
 }
 return html;
}
