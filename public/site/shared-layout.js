(() => {
  const privatePreview = location.pathname.startsWith('/preview/');

  document.querySelectorAll('.internal-hero-media > :is(.app-journey,.seo-scene,.campaign-scene,.automation-scene,.support-scene,.hosting-scene,.wp-scene,.cloud-scene,.mail-scene)').forEach(art=>{const box=document.createElement('div');box.className='hero-art-box';art.before(box);box.append(art)});
  // Standalone document previews render the same shell views as React pages.
  const header=document.querySelector('.hp-header');
  let active=null,timer;
  const entries=[...header.querySelectorAll('.cy-host-toggle')].map(button=>({button,panel:document.getElementById(button.getAttribute('aria-controls')),item:button.closest('.hp-nav-item')}));
  const close=entry=>{entry.panel.hidden=true;entry.button.setAttribute('aria-expanded','false')};
  const open=entry=>{clearTimeout(timer);entries.forEach(other=>{if(other!==entry)close(other)});entry.panel.hidden=false;entry.button.setAttribute('aria-expanded','true');active=entry};
  entries.forEach(entry=>{
    entry.button.addEventListener('click',()=>entry.panel.hidden?open(entry):close(entry));
    entry.button.addEventListener('keydown',event=>{if(event.key==='ArrowDown'){event.preventDefault();open(entry);entry.panel.querySelector('a')?.focus()}});
    [entry.item,entry.panel].forEach(node=>{
      node.addEventListener('pointerenter',event=>{clearTimeout(timer);if(event.pointerType==='mouse')open(entry)});
      node.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse')timer=setTimeout(()=>{if(!entry.panel.contains(document.activeElement))close(entry)},180)});
      node.addEventListener('focusout',event=>{if(!entry.item.contains(event.relatedTarget)&&!entry.panel.contains(event.relatedTarget))close(entry)});
    });
    entry.panel.querySelectorAll('a').forEach(link=>{
      const reset=()=>{entry.panel.classList.remove('cy-link-active');link.classList.remove('cy-current');link.style.removeProperty('--cy-x');link.style.removeProperty('--cy-y')};
      const select=()=>{entry.panel.classList.add('cy-link-active');link.classList.add('cy-current')};
      link.addEventListener('pointerenter',select);link.addEventListener('focus',select);link.addEventListener('pointerleave',reset);link.addEventListener('blur',reset);
      link.addEventListener('pointermove',event=>{if(event.pointerType!=='mouse'||matchMedia('(prefers-reduced-motion:reduce)').matches)return;const r=link.getBoundingClientRect();link.style.setProperty('--cy-x',Math.max(-4,Math.min(4,(event.clientX-r.left-r.width/2)*.025))+'px');link.style.setProperty('--cy-y',Math.max(-3,Math.min(3,(event.clientY-r.top-r.height/2)*.055))+'px')});
    });
  });
  document.addEventListener('pointerdown',event=>entries.forEach(entry=>{if(!entry.item.contains(event.target)&&!entry.panel.contains(event.target))close(entry)}));
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&active&&!active.panel.hidden){close(active);active.button.focus()}});
  const mobile=document.querySelector('#mobile-navigation'),trigger=document.querySelector('.hp-mobile-trigger');let overflow='';
  const closeMobile=()=>{mobile.close();document.body.style.overflow=overflow;trigger.focus()};
  trigger?.addEventListener('click',()=>{overflow=document.body.style.overflow;document.body.style.overflow='hidden';mobile.showModal()});
  mobile?.querySelector('[aria-label="Close navigation"]')?.addEventListener('click',closeMobile);
  mobile?.addEventListener('cancel',event=>{event.preventDefault();closeMobile()});
  mobile?.querySelector('nav')?.addEventListener('click',event=>{if(event.target.closest('a'))closeMobile()});
  document.querySelector('.hp-footer-v2-form')?.addEventListener('submit',event=>{event.preventDefault();document.querySelector('#footer-email-status').textContent='Email delivery is not connected yet. Your address has not been sent or saved.'});
  const words=[...document.querySelectorAll('.hp-footer .hp-word')];let word=0,wordVisible=false;
  const wordRoot=document.querySelector('.hp-footer .hp-word-rotator');
  if(wordRoot)new IntersectionObserver(([entry])=>{wordVisible=entry.isIntersecting}).observe(wordRoot);
  setInterval(()=>{if(!wordVisible||document.hidden||matchMedia('(prefers-reduced-motion:reduce)').matches||words.length<2)return;words[word].classList.remove('is-active');word=(word+1)%words.length;words[word].classList.add('is-active')},5000);
  document.querySelectorAll('.hp-desktop-nav .hp-nav-item, #mobile-navigation nav>a, .hp-footer nav a').forEach(item => {
    if (item.textContent.trim() === 'Work') item.remove();
  });
  const arabic=document.documentElement.lang==='ar';
  const contactHref = privatePreview ? '/preview/pages/contact'+(arabic?'?locale=ar':'') : (arabic ? '/ar/contact/' : '/contact/');
  const nav = document.querySelector('.hp-desktop-nav');
  if (nav && ![...nav.querySelectorAll('a')].some(a => /\/contact(?:[/?#]|$)/.test(a.getAttribute('href')||''))) {
    const item = document.createElement('span');
    item.className = 'hp-nav-item';
    const link = document.createElement('a');
    link.href = contactHref;
    link.textContent = arabic?'تواصل معنا':'Contact';
    item.append(link);
    nav.append(item);
  }
  document.querySelectorAll('.hp-utility a, #mobile-navigation nav>a').forEach(link => {
    if (link.textContent.trim() === 'Contact') link.href = contactHref;
  });
  const faqItems = [...document.querySelectorAll('.d-faq details')];
  const faqStates = new WeakMap();
  const faqReduced = matchMedia('(prefers-reduced-motion:reduce)');
  const setFaq = (item, open) => {
    const state = faqStates.get(item), start = item.getBoundingClientRect().height;
    state.animation?.cancel();
    state.open = open;
    item.style.height = '';
    item.open = true;
    const expanded = item.getBoundingClientRect().height;
    item.open = false;
    const collapsed = item.getBoundingClientRect().height;
    item.querySelector('summary').setAttribute('aria-expanded', String(open));
    if (faqReduced.matches) { item.open = open; item.style.overflow = ''; return; }
    item.open = true;
    item.style.overflow = 'hidden';
    const animation = item.animate([{height:start+'px'},{height:(open?expanded:collapsed)+'px'}], {duration:650,easing:'cubic-bezier(.4,0,.2,1)',fill:'forwards'});
    state.animation = animation;
    animation.onfinish = () => {
      if (state.animation !== animation) return;
      item.open = state.open;
      item.style.height = '';
      item.style.overflow = '';
      animation.cancel();
      state.animation = null;
    };
  };
  faqItems.forEach(item => {
    const summary = item.querySelector('summary');
    faqStates.set(item,{open:item.open,animation:null});
    summary.setAttribute('aria-expanded',String(item.open));
    summary.addEventListener('click', event => {
      event.preventDefault();
      const open = !faqStates.get(item).open;
      if (open) faqItems.filter(other=>other!==item&&faqStates.get(other).open).forEach(other=>setFaq(other,false));
      setFaq(item,open);
    });
  });
  const footer = document.querySelector('.hp-footer');
  if (!footer) return;
  const update = () => {
    footer.style.setProperty('position', 'sticky', 'important');
    footer.style.setProperty('bottom', `${Math.min(0, innerHeight - footer.getBoundingClientRect().height)}px`);
    footer.style.setProperty('z-index', '0');
  };
  const observer = new ResizeObserver(update);
  observer.observe(footer);
  addEventListener('resize', update);
  update();
})();
