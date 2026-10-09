(()=>{
  const hero=document.querySelector('main .about-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.cloud-scene'))return;
  hero.classList.add('cloud-live-hero');
  media.querySelector('img')?.remove();
  document.querySelectorAll('.about-preview-banner,.hp-utility,.hp-header,.v,footer').forEach(el=>el.style.display='none');
  Array.from(hero.parentElement.children).forEach(el=>{if(el!==hero)el.style.display='none'});

  const scene=document.createElement('div');scene.className='cloud-scene';
  scene.innerHTML=`
    <div class="cloud-field" aria-hidden="true"></div>
    <div class="cloud-index">01 / CLOUD HOSTING <span>THREE SITES / ONE FOUNDATION</span></div>
    <div class="cloud-console" aria-label="Cloud plan resources">
      <div class="console-top"><strong>CLOUD<span>✳</span> EDGE</strong><small>RESOURCE CONSOLE</small></div>
      <div class="console-plan"><span>CURRENT PLAN</span><strong data-plan-name>TurboSky</strong></div>
      <div class="console-resource"><div><span>CPU CORES</span><b data-cpu>4</b></div><i><em data-cpu-bar></em></i></div>
      <div class="console-resource"><div><span>DEDICATED RAM</span><b data-ram>6 GB</b></div><i><em data-ram-bar></em></i></div>
      <div class="console-resource"><div><span>EDGE STORAGE</span><b data-storage>150 GB</b></div><i><em data-storage-bar></em></i></div>
      <div class="console-choices" aria-label="Select a cloud plan"><button type="button" data-plan="0">LITE</button><button type="button" data-plan="1">TURBO</button><button type="button" data-plan="2">TRADE</button></div>
    </div>
    <div class="cloud-connectors" aria-hidden="true"><svg viewBox="0 0 1110 363" preserveAspectRatio="none"><path d="M240 92 H375"/><path d="M300 92 L275 120"/><path d="M910 92 L870 118"/></svg><i></i><i></i><i></i></div>
    <div class="cloud-site cloud-site-left" aria-label="Roofing website preview"><div class="mini-chrome"><span>RIDGE / SITE 01</span><b>↗</b></div><div class="mini-image"><img src="../../public/homepage/roofing.webp" alt=""><strong>Built to last.</strong></div></div>
    <div class="cloud-site cloud-site-right" aria-label="Healthcare website preview"><div class="mini-chrome"><span>CARE / SITE 03</span><b>↗</b></div><div class="mini-image"><img src="../../public/homepage/healthcare.webp" alt=""><strong>Here for you.</strong></div></div>
    <div class="cloud-site cloud-site-main" aria-label="Cafe website preview"><div class="main-chrome"><span class="main-dots"><i></i><i></i><i></i></span><span>daybreak.example</span><b>↗</b></div><div class="main-site"><nav><strong>daybreak<span>✳</span></strong><span>MENU　 STORY　 VISIT</span><em>ORDER ↗</em></nav><div class="main-copy"><small>GOOD THINGS, FRESH DAILY / 001</small><h2>A little brighter.<br>A lot more flavour<span>.</span></h2><p>Made fresh for the moments that matter.</p><b>EXPLORE THE MENU ↗</b></div><div class="main-photo"><img src="../../public/homepage/small-business.webp" alt=""><span>OPEN TODAY / 08:00—18:00</span></div><div class="main-foot">SITE 02 <i></i> READY TO GROW</div></div></div>
    <div class="cloud-bottom">GIVE YOUR NEXT STAGE <span>ROOM TO GROW ↗</span></div>`;
  media.append(scene);

  const plans=[{name:'LiteSky',cpu:2,ram:3,storage:50},{name:'TurboSky',cpu:4,ram:6,storage:150},{name:'TurboTrade',cpu:6,ram:12,storage:300}];
  const buttons=[...scene.querySelectorAll('[data-plan]')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let current=1,timer;
  function render(index){
    current=index;const p=plans[index];scene.dataset.plan=String(index);
    scene.querySelector('[data-plan-name]').textContent=p.name;
    scene.querySelector('[data-cpu]').textContent=p.cpu;
    scene.querySelector('[data-ram]').textContent=p.ram+' GB';
    scene.querySelector('[data-storage]').textContent=p.storage+' GB';
    scene.querySelector('[data-cpu-bar]').style.width=(p.cpu/6*100)+'%';
    scene.querySelector('[data-ram-bar]').style.width=(p.ram/12*100)+'%';
    scene.querySelector('[data-storage-bar]').style.width=(p.storage/300*100)+'%';
    buttons.forEach((button,i)=>{button.classList.toggle('is-active',i===index);button.setAttribute('aria-pressed',String(i===index))});
  }
  function advance(){render((current+1)%3);timer=setTimeout(advance,2600)}
  function choose(index){clearTimeout(timer);render(index);if(!reduce.matches)timer=setTimeout(advance,3600)}
  buttons.forEach(button=>button.addEventListener('click',()=>choose(Number(button.dataset.plan))));
  reduce.addEventListener('change',()=>{clearTimeout(timer);render(1);if(!reduce.matches)timer=setTimeout(advance,2600)});
  render(1);if(!reduce.matches)timer=setTimeout(advance,2600);
})();
