(()=>{
  const hero=document.querySelector('main .about-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.hosting-scene'))return;
  hero.classList.add('hosting-live-hero');
  media.querySelector('img')?.remove();
  const scene=document.createElement('div');scene.className='hosting-scene';
  scene.innerHTML=`
    <div class="hosting-orbit" aria-hidden="true"></div>
    <div class="hosting-index">01 / WEBSITE HOSTING <span>BUILT FOR WHAT'S NEXT</span></div>
    <div class="server-stack" aria-label="Interactive hosting layers">
      <div class="server-top"><b>CODEYEA<span>✳</span></b><small>HOSTING / 001</small></div>
      <div class="server-caption">THE FOUNDATION</div>
      <button type="button" data-layer="0"><i></i><span><strong>NVMe SSD</strong><small>Storage</small></span><em>01</em></button>
      <button type="button" data-layer="1"><i></i><span><strong>cPanel</strong><small>Control</small></span><em>02</em></button>
      <button type="button" data-layer="2"><i></i><span><strong>SSL / TLS</strong><small>Protection</small></span><em>03</em></button>
      <div class="server-bottom"><span class="server-led"></span><span data-layer-caption>Storage ready</span><b>● ONLINE</b></div>
    </div>
    <div class="hosting-trace" aria-hidden="true"><i></i><i></i><i></i></div>
    <div class="hosting-browser" aria-label="Sample website running on CODEYEA hosting">
      <div class="hosting-chrome"><span class="chrome-lights"><i></i><i></i><i></i></span><span class="hosting-address">https://homestead.example</span><b>↗</b></div>
      <div class="hosting-site">
        <div class="site-nav"><strong>HOMESTEAD<span>✳</span></strong><span>HOMES　 OUR STORY　 JOURNAL</span><b>GET IN TOUCH ↗</b></div>
        <div class="site-copy"><small>SPACES MADE FOR LIVING / 001</small><h2>Find a place<br>to call yours<span>.</span></h2><p>Thoughtfully chosen homes for what comes next.</p><span class="site-cta">EXPLORE HOMES ↗</span></div>
        <div class="site-image"><img src="../../public/homepage/real-estate.webp" alt=""><span>WELCOME HOME / 2026</span></div>
        <div class="site-foot"><span>01 / 03</span><i></i><span>CURATED PLACES. REAL POSSIBILITIES.</span></div>
      </div>
    </div>
    <div class="hosting-status"><small>WEBSITE STATUS</small><strong><i></i> LIVE & READY</strong><span data-live-caption>A stronger home for your website.</span></div>
    <div class="hosting-note">A STRONGER HOME <span>FOR YOUR WEBSITE ↗</span></div>`;
  media.append(scene);

  const buttons=[...scene.querySelectorAll('[data-layer]')];
  const captions=['Storage ready','Control connected','Connection protected'];
  const liveCaptions=['NVMe SSD storage connected.','Manage your website with cPanel.','SSL / TLS connection protected.'];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let index=0,timer;
  function render(n){
    index=n;scene.dataset.layer=String(n);
    buttons.forEach((button,i)=>{button.classList.toggle('is-active',i===n);button.setAttribute('aria-pressed',String(i===n))});
    scene.querySelector('[data-layer-caption]').textContent=captions[n];
    scene.querySelector('[data-live-caption]').textContent=liveCaptions[n];
  }
  function cycle(){render((index+1)%3);timer=setTimeout(cycle,2100)}
  function select(n){clearTimeout(timer);render(n);if(!reduce.matches)timer=setTimeout(cycle,2600)}
  buttons.forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.layer))));
  render(0);
  if(!reduce.matches)timer=setTimeout(cycle,2100);
  reduce.addEventListener('change',()=>{clearTimeout(timer);render(0);if(!reduce.matches)timer=setTimeout(cycle,2100)});
})();
