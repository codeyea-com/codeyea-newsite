(()=>{
 const removed=document.querySelector('.d-show');if(removed)removed.remove();document.querySelector('#more-extensions')?.remove();
 const iraq=document.querySelector('#iraq-tab'),panel=document.querySelector('#iraq-panel'),standard=document.querySelector('#extension-panel');
 if(iraq&&panel&&standard){
 const tabs=[...document.querySelectorAll('.d-tabs [role=tab]')];
 tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>{const local=tab===iraq;panel.hidden=!local;standard.hidden=local;const request=document.querySelector('#iraq-request');if(request)request.hidden=!local;tabs.forEach(t=>{t.setAttribute('aria-selected',String(t===tab));t.tabIndex=t===tab?0:-1});if(local&&!matchMedia('(prefers-reduced-motion:reduce)').matches)panel.querySelectorAll('a').forEach((el,i)=>el.animate([{opacity:.2,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:650,delay:i*45,easing:'ease-out'}));});
 tab.addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();e.stopImmediatePropagation();const rtl=document.documentElement.dir==='rtl';const step=(e.key==='ArrowRight'?1:-1)*(rtl?-1:1);const next=e.key==='Home'?0:e.key==='End'?tabs.length-1:(index+step+tabs.length)%tabs.length;tabs[next].focus();tabs[next].click()},true);
 });
 }
 document.querySelector('.d-domain-cta a')?.addEventListener('click',()=>document.querySelector('#domain')?.focus());
})();
