(()=>{
  const hero=document.querySelector('main .about-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.mail-scene'))return;
  hero.classList.add('mail-live-hero');
  media.querySelector('img')?.remove();
  document.querySelectorAll('.about-preview-banner,.hp-utility,.hp-header,.v,footer').forEach(el=>el.style.display='none');
  Array.from(hero.parentElement.children).forEach(el=>{if(el!==hero)el.style.display='none'});
  const scene=document.createElement('div');scene.className='mail-scene';
  scene.innerHTML=`
    <div class="mail-back-shape" aria-hidden="true"></div>
    <div class="mail-index">01 / EMAIL HOSTING <span>YOUR BUSINESS NAME. EVERY CONVERSATION.</span></div>
    <div class="mail-browser" aria-label="Illustrative business webmail inbox">
      <div class="mail-chrome"><span class="mail-chrome-dots"><i></i><i></i><i></i></span><span>mail.yourbrand.example</span><b>↗</b></div>
      <div class="mail-app">
        <div class="mail-app-head"><strong>yourbrand<span>✳</span> mail</strong><span>Search mail</span><b>hello@yourbrand.example　 ▾</b></div>
        <aside class="mail-sidebar"><button type="button" class="mail-compose">＋ COMPOSE</button><div class="mail-sidebar-active">▣ <span>Inbox</span><b data-unread>1</b></div><div>↗ <span>Sent</span></div><div>☆ <span>Starred</span></div><div>▤ <span>Drafts</span></div><small>BUSINESS EMAIL / 001</small></aside>
        <div class="mail-list"><div class="mail-list-head"><strong>Inbox</strong><span>All mail　⌄</span></div>
          <button type="button" class="mail-new-row" aria-label="Open new partnership enquiry"><i></i><span><b>Sofia · Fieldnote</b><small>Partnership enquiry</small><em>Hi team, I’d love to talk about a new project...</em></span><time>NOW</time></button>
          <div class="mail-old-row"><span><b>Daniel · Northline</b><small>Project follow-up</small><em>Thanks again for the thoughtful conversation.</em></span><time>09:12</time></div>
          <div class="mail-old-row"><span><b>Amelia · Studio</b><small>Meeting notes</small><em>Sharing the outline from yesterday’s call.</em></span><time>YEST.</time></div>
        </div>
        <div class="mail-reading"><div class="mail-read-top"><span>Inbox / Conversation</span><b>☆　⋯</b></div>
          <div class="mail-existing"><small>SELECTED CONVERSATION</small><h2>Project follow-up</h2><div class="mail-person"><i>D</i><span><strong>Daniel from Northline</strong><small>daniel@northline.example → hello@yourbrand.example</small></span></div><p>Hi team, thanks again for the thoughtful conversation. I’ll send the final details over shortly.</p></div>
          <div class="mail-new-message"><small>NEW OPPORTUNITY / INBOX</small><h2>Partnership enquiry</h2><div class="mail-person"><i>S</i><span><strong>Sofia from Fieldnote</strong><small>sofia@fieldnote.example → hello@yourbrand.example</small></span></div><p>Hi team, I’d love to talk about a new project. Are you available for a call this week?</p><p>Looking forward to hearing from you.<br><b>Sofia</b></p><button type="button" class="mail-reply">↶ REPLY</button></div>
          <div class="mail-draft"><small>REPLY FROM hello@yourbrand.example</small><p>Hi Sofia,<br><br>Thanks for reaching out. We’d be happy to talk this week. What day works best for you?</p><button type="button" class="mail-send">SEND ↗</button></div>
          <div class="mail-sent-toast">✓ &nbsp; Reply sent from hello@yourbrand.example</div>
        </div>
      </div>
    </div>
    <div class="mail-domain"><small>YOUR DOMAIN</small><strong>hello@yourbrand.example</strong><span>ONE NAME / EVERY MESSAGE ↗</span></div>
    <button type="button" class="mail-replay" aria-label="Replay the email conversation">↻ REPLAY</button>`;
  media.append(scene);
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let stage=0,timer;
  function render(n){stage=n;scene.dataset.stage=String(n);scene.querySelector('[data-unread]').textContent=n>=2?'0':'1'}
  function next(){const n=stage>=4?0:stage+1;render(n);timer=setTimeout(next,[1350,1550,2200,1700,2400][n])}
  function choose(n,delay=2700){clearTimeout(timer);render(n);if(!reduce.matches)timer=setTimeout(next,delay)}
  scene.querySelector('.mail-new-row').addEventListener('click',()=>choose(2));
  scene.querySelector('.mail-compose').addEventListener('click',()=>choose(3));
  scene.querySelector('.mail-reply').addEventListener('click',()=>choose(3));
  scene.querySelector('.mail-send').addEventListener('click',()=>choose(4));
  scene.querySelector('.mail-replay').addEventListener('click',()=>choose(0,900));
  reduce.addEventListener('change',()=>{clearTimeout(timer);render(reduce.matches?4:0);if(!reduce.matches)timer=setTimeout(next,1000)});
  render(reduce.matches?4:0);if(!reduce.matches)timer=setTimeout(next,1100);
})();
