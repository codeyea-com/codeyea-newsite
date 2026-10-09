(() => {
  const hero = document.querySelector('.ai-general-hero');
  const media = hero?.querySelector('.internal-hero-media');
  if (!hero || !media || media.querySelector('.campaign-scene')) return;

  hero.classList.add('digital-live-hero');
  const scene = document.createElement('div');
  scene.className = 'campaign-scene';
  scene.setAttribute('aria-label', 'Interactive digital marketing campaign preview');
  scene.innerHTML = `
    <div class="campaign-channels" aria-label="Campaign reach across social channels">
      <span class="campaign-kicker">ONE CAMPAIGN · 4 CHANNELS</span>
      <div class="channel-row" aria-hidden="true"><span class="channel-mark ig">◎</span><span class="channel-mark fb">f</span><span class="channel-mark tt">♪</span><span class="channel-mark li">in</span></div>
      <strong><span data-count="12840">12,840</span></strong><small>people reached this week</small>
    </div>
    <article class="campaign-post" aria-label="Example social media post">
      <header class="campaign-post-head"><span class="campaign-avatar" aria-hidden="true">D</span><strong>daybreak.coffee</strong><small>Sponsored</small><span aria-hidden="true">···</span></header>
      <div class="campaign-photo"><img src="assets/campaign-post-photo.png" alt="A hand holding iced hibiscus tea with citrus in a sunlit café"></div>
      <div class="campaign-copy"><b>A little pause, made fresh.</b><p>Meet the citrus hibiscus cooler. Your afternoon just got brighter.</p></div>
      <div class="campaign-actions"><button type="button" data-like aria-label="Like campaign post">♡</button><span data-likes>286 likes</span><span>View offer ↗</span></div>
    </article>
    <div class="campaign-motion" aria-hidden="true"></div>
    <section class="campaign-conversion" aria-label="Illustrative campaign result">
      <span class="campaign-kicker">CAMPAIGN EXAMPLE <b>↗ 38%</b></span>
      <strong>Sales are rising</strong><small>More visits are becoming orders</small>
      <div class="campaign-chart" aria-hidden="true"><svg viewBox="0 0 190 52" preserveAspectRatio="none"><path d="M2 44 L36 37 L65 40 L91 25 L119 29 L145 13 L169 19 L188 3"></path></svg></div>
    </section>
    <div class="campaign-order" role="status"><i aria-hidden="true"></i><span>NEW ORDER<b>Campaign conversion</b></span></div>
    <div class="campaign-stamp">CONTENT → CONVERSATION<b>→ SALE</b></div>`;
  media.append(scene);

  const like = scene.querySelector('[data-like]');
  const count = scene.querySelector('[data-likes]');
  like.addEventListener('click', () => {
    const active = like.classList.toggle('is-liked');
    like.setAttribute('aria-pressed', String(active));
    like.textContent = active ? '♥' : '♡';
    count.textContent = active ? '287 likes' : '286 likes';
  });
})();
