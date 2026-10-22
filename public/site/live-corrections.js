/* Enhancements shared by every public surface. No page-specific clone previews. */
(()=>{
 const once=new WeakSet();
 const ar=()=>document.documentElement.lang==='ar';
 let dialog;
 function zoom(image,frame){
  if(!dialog){dialog=document.createElement('dialog');dialog.className='cy-photo-dialog';dialog.setAttribute('aria-labelledby','cy-photo-title');dialog.innerHTML='<button class="cy-photo-close" type="button">×</button><div class="cy-photo-layout"><div class="cy-photo-copy"><p class="cy-photo-label"></p><h2 id="cy-photo-title"></h2><p class="cy-photo-description"></p></div><img alt=""></div>';document.body.append(dialog);dialog.querySelector('button').addEventListener('click',()=>dialog.close());dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});}
  const figure=frame.closest('figure,article'),copy=frame.closest('[data-photo-description]');
  const title=copy?.dataset.photoTitle||(figure?.querySelector('figcaption h3,h3')||figure?.querySelector('figcaption'))?.textContent?.trim()||image.alt;
  const description=copy?.dataset.photoDescription||figure?.querySelector('p')?.textContent?.trim()||image.alt;
  const full=dialog.querySelector('img');full.src=image.currentSrc||image.src;full.alt=image.alt;
  dialog.querySelector('h2').textContent=title;dialog.querySelector('.cy-photo-description').textContent=description;
  dialog.querySelector('.cy-photo-copy').dir=ar()?'rtl':'ltr';dialog.querySelector('.cy-photo-label').textContent=ar()?'تصوّر توضيحي':'Illustrative concept';
  dialog.querySelector('button').ariaLabel=ar()?'إغلاق الصورة':'Close image';if(!dialog.open)dialog.showModal();
 }
 function refine(){
  document.querySelectorAll('.hero-concept .w-service-name br').forEach(br=>br.replaceWith(document.createTextNode(' ')));
  document.querySelectorAll('main details>summary,main .rp-accordion button[aria-expanded],main .services-accordion button[aria-expanded]').forEach(q=>q.classList.add('cy-accordion-title'));
  document.querySelectorAll('section[class*="faq"],#services-faq,#about-faq').forEach(group=>{
   if(once.has(group))return;once.add(group);
   const title=group.querySelector('h2');if(!title)return;
   const parent=title.parentElement;
   const copy=parent===group?title:parent;
   let heading=copy;
   if(copy===title){heading=document.createElement('header');title.before(heading);heading.append(title);}
   heading.classList.add('cy-faq-heading');
   for(let ancestor=group.parentElement;ancestor&&ancestor!==document.body;ancestor=ancestor.parentElement){const style=getComputedStyle(ancestor);if(/hidden|auto|scroll/.test(style.overflowX+' '+style.overflowY))ancestor.classList.add('cy-faq-scroll-ancestor');}
   const label=heading.querySelector('.b-eyebrow,.ds-label,.v-label,.d-faq-label,.services-label,.rf-kicker,.detail-kicker,.cy-faq-label');
   if(label)label.textContent='FAQs';else{const small=document.createElement('span');small.className='cy-faq-label';small.textContent='FAQs';heading.prepend(small);}
   heading.querySelectorAll('a[data-quote-open],a[href*="contact"]').forEach(a=>a.remove());
  });
  document.querySelectorAll('.cy-accordion-title .ai-service-title').forEach(title=>{if(once.has(title))return;once.add(title);title.textContent=[...title.childNodes].map(node=>node.textContent.trim()).filter(Boolean).join(' ');});
  document.querySelectorAll('main a').forEach(a=>{
   if(/Discuss Your Search Visibility|ناقش.*(?:البحث|الظهور)/i.test(a.textContent))a.classList.add('cy-text-hover');
  });
  document.querySelectorAll('.b-work-image,.b-work figure,.b-work-grid figure,.e-work-image,.rf-strip-item figure').forEach(frame=>{
   if(frame.matches('figure')&&frame.querySelector('.b-work-image,.e-work-image'))return;
   if(once.has(frame))return;const image=frame.querySelector('img');if(!image)return;once.add(frame);frame.classList.add('cy-photo-target');frame.tabIndex=0;frame.setAttribute('role','button');frame.setAttribute('aria-label',ar()?'تكبير الصورة':'Enlarge image');
   frame.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();zoom(image,frame)});frame.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();zoom(image,frame)}});
  });
  document.querySelectorAll('.ts-plan th').forEach((th,i)=>{if(once.has(th))return;once.add(th);const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('class','cy-plan-icon');icon.setAttribute('aria-hidden','true');const paths=['M12 3 3 7v6c0 5 9 9 9 9s9-4 9-9V7zM8 12l3 3 5-6','M4 6h16v12H4zM7 10h10M7 14h6','M12 3v4m0 10v4M3 12h4m10 0h4M6 6l3 3m6 6 3 3M6 18l3-3m6-6 3-3'];const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('d',paths[i%paths.length]);icon.append(p);th.prepend(icon);});
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',refine);else refine();
 let pending=false;new MutationObserver(records=>{
  if(!records.some(record=>{
   const element=record.target.nodeType===Node.ELEMENT_NODE?record.target:record.target.parentElement;
   return !element?.closest('.hp-services-hero')&&[...record.addedNodes].some(node=>node.nodeType===Node.ELEMENT_NODE);
  }))return;
  if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;refine()})
 }).observe(document.body,{childList:true,subtree:true});
})();
