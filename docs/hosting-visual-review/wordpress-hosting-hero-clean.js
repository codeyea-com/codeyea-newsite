(()=>{
  const hero=document.querySelector('main .about-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.wp-clean-scene'))return;
  hero.classList.add('wp-clean-hero');
  media.querySelector('img')?.remove();
  document.querySelectorAll('.about-preview-banner,.hp-utility,.hp-header,.v,footer').forEach(el=>el.style.display='none');
  Array.from(hero.parentElement.children).forEach(el=>{if(el!==hero)el.style.display='none'});
  const scene=document.createElement('div');scene.className='wp-clean-scene';
  scene.innerHTML=`
    <div class="wp-clean-accent" aria-hidden="true"></div>
    <div class="wp-clean-index">01 / WORDPRESS HOSTING <span>CREATE → CONNECT → GO LIVE</span></div>
    <div class="wp-clean-tools" aria-label="WordPress tools">
      <div class="wp-clean-logo" aria-label="WordPress logo"><img src="wordpress-wmark-white.png" alt="Official WordPress logo"></div>
      <button type="button" data-mode="0" aria-label="Pages" title="Pages"><span>▤</span><small>PAGES</small></button>
      <button type="button" data-mode="1" aria-label="Media" title="Media"><span>▧</span><small>MEDIA</small></button>
      <button type="button" data-mode="2" aria-label="Site settings" title="Site settings"><span>⚙</span><small>SITE</small></button>
    </div>
    <div class="wp-clean-host" aria-label="Hosting unit feeding the website">
      <div class="wp-clean-host-top"><strong>CODEYEA / HOST</strong><span>01</span></div>
      <div class="wp-clean-host-slot"><i></i><i></i><i></i><span>NVMe SSD</span></div>
      <div class="wp-clean-host-slot"><i></i><i></i><i></i><span>WordPress Manager</span></div>
      <div class="wp-clean-host-foot"><b>● CONNECTED</b><span data-host-label>Pages ready</span></div>
    </div>
    <div class="wp-clean-feed" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="wp-clean-browser" aria-label="Live WordPress website preview">
      <div class="wp-clean-chrome"><span class="wp-clean-dots"><i></i><i></i><i></i></span><span>thepractice.example</span><b>↗</b></div>
      <div class="wp-clean-page">
        <header><strong>the practice<span>✳</span></strong><nav>ABOUT　 SERVICES　 CONTACT</nav><em>BOOK A VISIT ↗</em></header>
        <div class="wp-clean-copy"><small>CARE, MADE PERSONAL / 001</small><h2>Care that feels<br>closer to home<span>.</span></h2><p>Thoughtful care for every chapter of life.</p><b>EXPLORE OUR CARE ↗</b></div>
        <div class="wp-clean-photo"><img src="../../public/homepage/healthcare.webp" alt=""><span>HERE FOR YOU / 2026</span></div>
        <div class="wp-clean-page-foot"><span data-site-label>PAGES / LIVE</span><i></i><span>BUILT ON WORDPRESS</span></div>
      </div>
    </div>
    <div class="wp-clean-bottom">YOUR WORDPRESS SITE <span>READY TO GROW ↗</span></div>`;
  media.append(scene);
  const buttons=[...scene.querySelectorAll('[data-mode]')];
  const labels=[['Pages ready','PAGES / LIVE'],['Media ready','MEDIA / LIVE'],['Site connected','SITE / LIVE']];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let mode=0,timer;
  function render(n){mode=n;scene.dataset.mode=String(n);buttons.forEach((button,i)=>{button.classList.toggle('is-active',i===n);button.setAttribute('aria-pressed',String(i===n))});scene.querySelector('[data-host-label]').textContent=labels[n][0];scene.querySelector('[data-site-label]').textContent=labels[n][1]}
  function advance(){render((mode+1)%3);timer=setTimeout(advance,2500)}
  function choose(n){clearTimeout(timer);render(n);if(!reduce.matches)timer=setTimeout(advance,3200)}
  buttons.forEach(button=>button.addEventListener('click',()=>choose(Number(button.dataset.mode))));
  reduce.addEventListener('change',()=>{clearTimeout(timer);render(0);if(!reduce.matches)timer=setTimeout(advance,2500)});
  render(0);if(!reduce.matches)timer=setTimeout(advance,2500);
})();
