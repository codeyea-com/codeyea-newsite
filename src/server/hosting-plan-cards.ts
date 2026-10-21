type HostingSpec = {names:string[];prices:number[];rows:string[][];title:string;annualDiscount?:number};
const escape = (s:string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
const plain = (s:string) => s.replace(/<[^>]*>/g,'').trim();
export function integrateHostingPlans(html:string, locale:string) {
  const ar=locale==='ar';
  let spec:HostingSpec|undefined;
  html=html.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/g,(all,source:string)=>{
    if(!source.includes('const spec=data.slider'))return all;
    const at=source.lastIndexOf('})(');
    if(at<0)return all;
    try{spec=JSON.parse(source.slice(at+3,source.lastIndexOf(')'))).slider;}catch{return all;}
    // Replace the old table controller, preserving the section and card animations.
    const start=source.indexOf(' let start=0,annual=false;');
    const end=source.indexOf(" document.querySelectorAll('.v-card')",start);
    if(start<0||end<0){spec=undefined;return all;}
    return all.replace(source,source.slice(0,start)+source.slice(end));
  });
  if(!spec)return html;
  const data=spec;
  html=html.replace(/<section\b[^>]*\bid="hosting-plans"[^>]*>[\s\S]*?<\/section>/,(section:string)=>{
    const labels=[...section.matchAll(/<span class="v-feature">([\s\S]*?)<\/span>/g)].map(m=>plain(m[1]));
    const links=[...section.matchAll(/<a\b[^>]*href="([^"]*)"[^>]*>[^<]*(?:<[^>]*>[^<]*<\/[^>]*>[^<]*)*<\/a>/g)].map(m=>m[1]);
    const heading=section.match(/<h2[^>]*>([\s\S]*?)<\/h2>/)?.[1] || escape(data.title);
    const note=section.match(/<p class="v-price-note">([\s\S]*?)<\/p>/)?.[1] || '';
    const discount=data.annualDiscount||0;
    const local=(value:string)=>ar?({'Unlimited':'غير محدود','Unmetered':'غير مقاس','Twice daily':'مرتان يومياً','Included':'متضمن','Standard':'قياسي','Daily':'يومياً','None':'لا يوجد','No individual limit*':'بلا حد فردي*'}[value]||value):value;
    const paths=['M3 4h18v16H3zM3 9h18M8 13h8m-8 3h5','M4 5c0-4 16-4 16 0s-16 4-16 0v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0','M4 19a9 9 0 1 1 16 0M12 14l5-6','M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2c-6 5-6 15 0 20 6-5 6-15 0-20','M3 5h18v14H3zM3 6l9 7 9-7'];
    const icon=(i:number)=>`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[i%paths.length]}"></path></svg>`;
    const rows=(ids:number[],i:number)=>ids.map(j=>`<li>${icon(j)}<span><b dir="auto">${escape(local(data.rows[j][i+1]||''))}</b> ${escape(labels[j]||data.rows[j][0])}</span></li>`).join('');
    const basic=data.rows.map((_,j)=>j).filter(j=>j<3||/email accounts|backups/i.test(data.rows[j][0]));
    const more=data.rows.map((_,j)=>j).filter(j=>!basic.includes(j));
    const cards=data.names.map((name,i)=>`<article class="card ${i===1?'featured':''} reveal" style="--delay:${i*100}ms" data-monthly="${data.prices[i]}" data-discount="${discount}">${i===1?`<div class="ribbon">${ar?'مساحة أكبر لخطوتك القادمة':'More room for your next step'}</div>`:''}<header class="card-head"><div class="plan-mark"><h2>${escape(name)}</h2><span class="icon">${icon(i)}</span></div><p class="tagline">${escape(local(data.rows[0][i+1]))} ${escape(labels[0]||data.rows[0][0])}</p></header><div class="price-block"><div class="price-top"><del class="old" hidden></del><span class="discount" hidden>${ar?'خصم':'Save'} ${discount*100}%</span><span class="monthly-label">${ar?'اشتراك مرن كل شهر':'Flexible monthly billing'}</span></div><div class="price"><strong class="amount">$${data.prices[i]}</strong><small>${ar?'/ شهر':'/ month'}</small></div><p class="billing-note"></p><a class="choose" href="${escape(links[i]||links[0]||(ar?'/ar/contact/':'/contact/'))}"><span>${ar?'اختر':'Choose'} ${escape(name)}</span><span aria-hidden="true">${ar?'←':'→'}</span></a></div><div class="features"><h3>${ar?'الموارد الأساسية':'Core resources'}</h3><ul>${rows(basic,i)}</ul>${more.length?`<details class="more"><summary>${ar?'أدوات البناء والإدارة':'Build and manage'} </summary><div class="more-panel"><ul>${rows(more,i)}</ul></div></details>`:''}</div></article>`).join('');
    const endNote=[...section.matchAll(/<p class="v-price-note">([\s\S]*?)<\/p>/g)].slice(1).map(m=>`<p class="disclaimer">${m[1]}</p>`).join('');
    return `<section id="hosting-plans" class="cy-host-plans" data-locale="${ar?'ar':'en'}"><div class="intro"><p class="eyebrow">${ar?'خطط الاستضافة':'HOSTING PLANS'}</p><h2>${heading}</h2></div><div class="controls"><div class="billing" role="group" aria-label="${ar?'فترة الاشتراك':'Billing period'}"><button type="button" data-billing="month" aria-pressed="true">${ar?'اشتراك شهري':'Monthly'}</button><button type="button" data-billing="year" aria-pressed="false">${ar?'اشتراك سنوي':'Annually'}${discount?` <span class="save">${ar?'وفّر':'Save'} <strong>${discount*100}%</strong></span>`:''}</button></div></div><div class="viewport"><div class="plans" tabindex="0" aria-label="${ar?'خطط الاستضافة':'Hosting plans'}">${cards}</div></div><div class="slider-controls"><button type="button" data-move="-1" aria-label="${ar?'الخطة السابقة':'Previous plan'}">${ar?'→':'←'}</button><span class="counter" dir="ltr" aria-live="polite">1 / ${data.names.length}</span><button type="button" data-move="1" aria-label="${ar?'الخطة التالية':'Next plan'}">${ar?'←':'→'}</button></div><p class="disclaimer">${note}</p>${endNote}</section>`;
  });
  return html.replace('</head>','<link rel="stylesheet" href="/site/hosting-plan-cards.css?v=5"></head>').replace('</body>','<script src="/site/hosting-plan-cards.js?v=3"></script></body>');
}
