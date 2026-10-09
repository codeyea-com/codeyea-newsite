(()=>{
  const hero=document.querySelector('.about-hero.ai-general-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.support-scene'))return;
  hero.classList.add('support-live-hero');
  media.querySelector('img')?.remove();

  const scene=document.createElement('div');scene.className='support-scene';
  scene.innerHTML=`
    <div class="support-photo" aria-hidden="true"><img src="../../public/homepage/team.webp" alt=""></div>
    <div class="support-stripe" aria-hidden="true"></div>
    <div class="support-browser" aria-label="Illustrative website recovery">
      <div class="browser-chrome"><span class="chrome-dots"><i></i><i></i><i></i></span><span>yourwebsite.com</span><b data-browser-status>UNAVAILABLE</b></div>
      <div class="browser-content">
        <div class="browser-error">
          <div class="broken-site" aria-hidden="true"><div class="broken-nav"><b>YOUR WEBSITE</b><span>HOME　 ABOUT　 CONTACT</span></div><div class="broken-image"><span>▧</span><b>IMAGE FAILED TO LOAD</b></div><div class="broken-lines"><i></i><i></i><i></i></div><div class="broken-alert">⚠ SERVER ERROR</div></div>
          <small>WEBSITE STATUS / INCIDENT 001</small>
          <div class="error-code">503<span>.</span></div>
          <h2>Website is not responding.</h2>
          <p data-diagnosis>Support is checking the issue.</p>
          <div class="error-line"><span></span></div>
          <span class="error-foot">ERROR 503 / SERVICE UNAVAILABLE</span>
        </div>
        <div class="browser-recovered">
          <div class="recovered-nav"><strong>daily<span>✳</span></strong><span>MENU　 OUR STORY　 CONTACT</span><em>ORDER ONLINE ↗</em></div>
          <div class="recovered-main"><small>FRESH IDEAS, EVERY DAY</small><h2>Good mornings<br>start here<span>.</span></h2><p>Handcrafted food and coffee, made with care.</p><b>EXPLORE THE MENU ↗</b><div class="recovered-caption">OPEN AGAIN <span>● LIVE</span></div></div>
          <div class="recovered-photo" aria-hidden="true"><img src="../../public/homepage/small-business.webp" alt=""><span>MADE WITH CARE / 001</span></div>
        </div>
      </div>
    </div>
    <div class="support-ticket" aria-label="Sample support ticket status">
      <div class="ticket-head"><span>SUPPORT REQUEST / #1042</span><i>↗</i></div>
      <strong>Website not loading<br>after an update.</strong>
      <div class="ticket-bottom"><span data-ticket-status>DIAGNOSING</span><b data-ticket-mark>●</b></div>
    </div>
    <div class="support-diagnostics" aria-label="Interactive diagnosis checklist">
      <div class="diagnostics-head"><span>02 / DIAGNOSIS</span><b data-progress-count>0 / 4</b></div>
      <button type="button" data-check="1"><span>01</span><b>DNS records</b><i>○</i></button>
      <button type="button" data-check="2"><span>02</span><b>Hosting response</b><i>○</i></button>
      <button type="button" data-check="3"><span>03</span><b>Database connection</b><i>○</i></button>
      <button type="button" data-check="4"><span>04</span><b>WordPress update</b><i>○</i></button>
      <div class="diagnostics-footer"><i></i><span data-diagnostic-caption>CHECKING THE ISSUE</span></div>
    </div>
    <div class="support-live-tag"><span>LIVE SUPPORT FLOW</span><b>ISSUE　→　 CHECK　→　 RECOVERY</b></div>
    <button type="button" class="support-replay" aria-label="Replay the support diagnosis">↻ <span>REPLAY</span></button>`;
  media.append(scene);

  const checks=[...scene.querySelectorAll('[data-check]')];
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  const messages=['Support is checking the issue.','DNS records are responding.','Hosting is reachable.','Database connection is stable.','Reviewing the recent WordPress update.','Website response has been restored.'];
  const captions=['CHECKING THE ISSUE','DNS VERIFIED','HOSTING VERIFIED','DATABASE VERIFIED','UPDATE REVIEWED','SITE BACK ONLINE'];
  let step=0,timer;
  function render(value){
    step=value;scene.dataset.stage=String(value);
    checks.forEach((button,index)=>{
      const number=index+1,complete=number<=Math.min(value,4);
      button.classList.toggle('is-complete',complete);
      button.classList.toggle('is-active',number===value);
      button.querySelector('i').textContent=complete?'✓':'○';
      button.setAttribute('aria-pressed',String(number===value));
    });
    scene.querySelector('[data-diagnosis]').textContent=messages[value];
    scene.querySelector('[data-diagnostic-caption]').textContent=captions[value];
    scene.querySelector('[data-progress-count]').textContent=Math.min(value,4)+' / 4';
    scene.querySelector('[data-browser-status]').textContent=value===5?'ONLINE':'UNAVAILABLE';
    scene.querySelector('[data-ticket-status]').textContent=value===5?'RESOLVED':'DIAGNOSING';
    scene.querySelector('[data-ticket-mark]').textContent=value===5?'✓':'●';
  }
  function advance(){render(step>=5?0:step+1);timer=setTimeout(advance,step===5?2500:step===0?950:1350)}
  function select(value){clearTimeout(timer);render(value);if(!reduce.matches)timer=setTimeout(advance,2300)}
  checks.forEach(button=>button.addEventListener('click',()=>select(Number(button.dataset.check))));
  scene.querySelector('.support-replay').addEventListener('click',()=>select(0));
  render(reduce.matches?5:0);
  if(!reduce.matches)timer=setTimeout(advance,950);
  reduce.addEventListener('change',()=>{clearTimeout(timer);render(reduce.matches?5:0);if(!reduce.matches)timer=setTimeout(advance,950)});
})();
