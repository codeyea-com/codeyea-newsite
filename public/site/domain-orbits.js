(() => {
  const cosmos=document.querySelector('.domain-cosmos'),hero=document.querySelector('.d-hero');
  if(!cosmos||!hero||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
  const ns='http://www.w3.org/2000/svg',svg=document.createElementNS(ns,'svg');
  svg.setAttribute('viewBox','0 0 1440 760');svg.setAttribute('preserveAspectRatio','xMidYMid slice');svg.setAttribute('focusable','false');svg.setAttribute('aria-hidden','true');svg.classList.add('domain-orbit-words');
  const make=(name,attrs)=>{const e=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))e.setAttribute(k,String(v));return e;};
  ['.com','.net','.org','.design','.studio','.io','.agency'].forEach((extension,index)=>{
    const duration=24+Math.random()*12,delay=index*2.4+(index?Math.random():0),depth=390+index*34;
    const group=make('g',{}),text=make('text',{fill:'white','font-size':15+Math.random()*3,'font-family':'Josefin Sans, sans-serif','text-anchor':'middle',opacity:0});text.textContent=extension;
    const motion=make('animateMotion',{path:`M 1480 820 C 1220 ${depth} 220 ${depth} -40 820`,dur:duration+'s',begin:delay+'s',repeatCount:'indefinite',calcMode:'paced'});
    const fade=make('animate',{attributeName:'opacity',values:'0;0;0.16;0.16;0;0',keyTimes:'0;0.10;0.35;0.65;0.90;1',calcMode:'spline',keySplines:'0 0 1 1;0.4 0 0.2 1;0 0 1 1;0.4 0 0.2 1;0 0 1 1',dur:duration+'s',begin:delay+'s',repeatCount:'indefinite'});
    const angle=8+Math.random()*10,turn=make('animateTransform',{attributeName:'transform',type:'rotate',values:`${angle};${-angle};${angle}`,dur:(duration*.8)+'s',begin:delay+'s',repeatCount:'indefinite'});
    text.append(fade,turn);group.append(text,motion);svg.append(group);
  });
  cosmos.append(svg);
  let visible=true;const sync=()=>{if(visible&&!document.hidden)svg.unpauseAnimations();else svg.pauseAnimations();};
  new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();},{threshold:0}).observe(hero);
  document.addEventListener('visibilitychange',sync);
  matchMedia('(prefers-reduced-motion:reduce)').addEventListener('change',e=>{if(e.matches){svg.pauseAnimations();svg.style.display='none';}else{svg.style.display='';sync();}});
})();
