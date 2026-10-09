(()=>{
  const hero=document.querySelector('main .about-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.wp-scene'))return;
  hero.classList.add('wp-live-hero');
  media.querySelector('img')?.remove();
  const scene=document.createElement('div');scene.className='wp-scene';
  scene.innerHTML=`
    <div class="wp-back-swoosh" aria-hidden="true"></div>
    <div class="wp-index">01 / WORDPRESS HOSTING <span>YOUR SITE, IN YOUR HANDS ↗</span></div>
    <div class="wp-editor" aria-label="Illustrative WordPress page editor">
      <div class="wp-editor-top"><strong>W</strong><span>Pages <i>›</i> Home</span><b>● SAVED</b><button type="button" class="wp-publish" aria-label="Publish website update">UPDATE ↗</button></div>
      <div class="wp-editor-inner"><aside><b>W</b><span>▣</span><span class="is-selected">▤</span><span>◫</span><span>⚙</span></aside><div class="wp-edit-content"><small>EDIT PAGE / HOME</small><h2>Care that feels<br>closer to home<span>.</span></h2><div class="wp-edit-toolbar"><b>T</b><i></i><i></i><i></i><i></i></div><p>Thoughtful care for every chapter of life.</p><div class="wp-edit-media"><img src="../../public/homepage/healthcare.webp" alt=""><span>FEATURED IMAGE</span></div></div></div>
      <div class="wp-editor-footer"><span>WORDPRESS MANAGER</span><b>CODEYEA HOSTING / 001</b></div>
      <div class="wp-pointer" aria-hidden="true"><svg viewBox="0 0 30 38" width="30" height="38"><path d="M3 2v29l8-7 6 12 5-3-6-11h11z" fill="#192338" stroke="white" stroke-width="2"/></svg><i></i></div>
    </div>
    <div class="wp-link" aria-hidden="true"><span>EDITOR</span><i></i><span>LIVE SITE</span></div>
    <div class="wp-site" aria-label="Website preview after publishing">
      <div class="wp-site-browser"><span class="wp-dots"><i></i><i></i><i></i></span><span>thepractice.example</span><b>↗</b></div>
      <div class="wp-site-content"><nav><strong>the practice<span>✳</span></strong><span>ABOUT　 SERVICES　 CONTACT</span></nav><div class="wp-site-headline"><small>CARE, MADE PERSONAL / 001</small><h2><span class="wp-old-title">Care for<br>every day.</span><span class="wp-new-title">Care that feels<br>closer to home.</span></h2><p>Thoughtful care for every chapter of life.</p><b>EXPLORE OUR CARE ↗</b></div><div class="wp-site-image"><img src="../../public/homepage/healthcare.webp" alt=""><span>HERE FOR YOU / 2026</span></div></div>
    </div>
    <div class="wp-feedback" role="status"><span class="wp-feedback-icon">✓</span><div><small>WORDPRESS / HOME</small><strong data-publish-status>Ready to publish</strong></div></div>
    <div class="wp-bottom-note">MANAGE. UPDATE. PUBLISH. <span>ALL IN ONE PLACE.</span></div>`;
  media.append(scene);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const update=scene.querySelector('.wp-publish');
  const status=scene.querySelector('[data-publish-status]');
  let timer;
  function stage(n){scene.dataset.stage=String(n);status.textContent=n===2?'Update published':'Ready to publish'}
  function schedule(){clearTimeout(timer);stage(0);if(reduce.matches){stage(2);return}timer=setTimeout(()=>{stage(1);timer=setTimeout(()=>{stage(2);timer=setTimeout(schedule,3000)},850)},1800)}
  update.addEventListener('click',()=>{clearTimeout(timer);stage(1);timer=setTimeout(()=>{stage(2);if(!reduce.matches)timer=setTimeout(schedule,3500)},450)});
  reduce.addEventListener('change',schedule);
  schedule();
})();
