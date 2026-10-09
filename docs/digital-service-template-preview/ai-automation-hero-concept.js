(()=>{
  const hero=document.querySelector('.about-hero.ai-general-hero');
  const media=hero?.querySelector('.internal-hero-media');
  if(!hero||!media||media.querySelector('.automation-scene'))return;
  hero.classList.add('automation-live-hero');
  media.querySelector('img')?.remove();
  document.querySelectorAll('.about-preview-banner,.hp-utility,.hp-header,.ds,footer').forEach(el=>el.style.display='none');
  Array.from(hero.parentElement.children).forEach(el=>{if(el!==hero)el.style.display='none'});

  const scene=document.createElement('div');scene.className='automation-scene';
  scene.innerHTML=`
    <div class="automation-orbit" aria-hidden="true"></div>
    <div class="automation-inbound" aria-label="Incoming sample customer request">
      <div class="inbound-top"><span>01 / INCOMING</span><b>WEBSITE FORM ↗</b></div>
      <div class="inbound-avatar">SC</div>
      <small>NEW REQUEST · JUST NOW</small>
      <h2>Can we automate our appointment requests?</h2>
      <p>We answer the same questions and copy every new request into our customer list.</p>
      <div class="inbound-footer"><span>REQUEST RECEIVED</span><i></i><i></i><i></i></div>
    </div>
    <div class="automation-arrow automation-arrow--in" aria-hidden="true"><i></i></div>
    <div class="automation-console" aria-label="Sample automation workflow">
      <div class="console-top"><strong>CODEYEA <em>FLOW</em></strong><span>WORKFLOW / 001</span><b><i></i> AUTO RUNNING</b></div>
      <div class="console-title"><small>WHEN A NEW REQUEST ARRIVES</small><h2>One request. Four useful actions.</h2></div>
      <div class="flow-track" aria-hidden="true"><span class="flow-progress"></span><i class="flow-pulse"></i></div>
      <div class="flow-steps">
        <button type="button" data-step="1"><small>01 / READ</small><b>Understand<br>the request</b><span>AI summary</span><i>○</i></button>
        <button type="button" data-step="2"><small>02 / CONNECT</small><b>Add to<br>customer list</b><span>CRM updated</span><i>○</i></button>
        <button type="button" data-step="3"><small>03 / ASSIST</small><b>Draft a<br>helpful reply</b><span>Ready to review</span><i>○</i></button>
        <button type="button" data-step="4"><small>04 / FOLLOW UP</small><b>Make the<br>next task</b><span>Follow-up set</span><i>○</i></button>
      </div>
      <div class="console-footer"><span><i></i> CONNECTED SYSTEMS</span><b>INBOX　 →　 AI　 →　 CRM　 →　 TASKS</b></div>
    </div>
    <div class="automation-arrow automation-arrow--out" aria-hidden="true"><i></i></div>
    <div class="automation-results" aria-label="Workflow results">
      <div class="results-heading"><span>03 / RESULTS</span><b>LIVE OUTPUT</b></div>
      <div class="result-card" data-result="2"><small>CRM / CUSTOMER RECORD</small><strong>New lead added</strong><span>Appointment automation</span><i>✓</i></div>
      <div class="result-card" data-result="3"><small>EMAIL / DRAFT</small><strong>Reply prepared</strong><span>“Thanks for getting in touch…”</span><i>✓</i></div>
      <div class="result-card" data-result="4"><small>TASKS / NEXT STEP</small><strong>Follow-up created</strong><span>Review request with the team</span><i>✓</i></div>
      <div class="results-note"><b>HUMAN REVIEW</b><span>keeps important decisions in your hands.</span></div>
    </div>
    <div class="automation-caption">REAL WORKFLOWS　 /　 CLEAR HANDOFFS　 /　 HUMAN CONTROL</div>`;
  media.append(scene);

  const steps=[...scene.querySelectorAll('[data-step]')];
  const results=[...scene.querySelectorAll('[data-result]')];
  const progress=scene.querySelector('.flow-progress');
  const pulse=scene.querySelector('.flow-pulse');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let current=0,timer;
  function show(step){
    current=step;
    scene.dataset.stage=String(step);
    steps.forEach((button,index)=>{
      const number=index+1;
      button.classList.toggle('is-current',number===step);
      button.classList.toggle('is-done',number<step);
      button.querySelector('i').textContent=number<step?'✓':number===step?'●':'○';
      button.setAttribute('aria-pressed',String(number===step));
    });
    results.forEach(card=>card.classList.toggle('is-visible',Number(card.dataset.result)<=step));
    const percent=step===0?0:(step-1)/3*100;
    progress.style.width=percent+'%';pulse.style.left=percent+'%';
  }
  function advance(){
    show(current>=4?0:current+1);
    timer=setTimeout(advance,current===4?2300:current===0?850:1450);
  }
  steps.forEach(button=>button.addEventListener('click',()=>{
    clearTimeout(timer);show(Number(button.dataset.step));
    if(!reduce.matches)timer=setTimeout(advance,2200);
  }));
  show(reduce.matches?4:0);
  if(!reduce.matches)timer=setTimeout(advance,850);
  reduce.addEventListener('change',()=>{clearTimeout(timer);show(reduce.matches?4:0);if(!reduce.matches)timer=setTimeout(advance,850)});
})();
