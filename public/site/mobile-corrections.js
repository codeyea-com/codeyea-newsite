/* Shared by CMS previews and public pages. Owner corrections, 2026-10-23. */
(() => {
  if (window.CODEYEA_MOBILE_CORRECTIONS) return;
  window.CODEYEA_MOBILE_CORRECTIONS = true;
  const mobile = matchMedia('(max-width:767px)');
  const reduce = matchMedia('(prefers-reduced-motion:reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const heroes = new Map(), cursors = new WeakSet(), films = new WeakSet(), stacks = new Map();
  const heroSelector = '.automation-live-hero,.support-live-hero,.hosting-live-hero,.wp-live-hero,.cloud-live-hero,.mail-live-hero,.seo-live-hero,.digital-live-hero,.web-mobile-journey';

  function fitHero(hero) {
    const title = hero.querySelector('.internal-hero-title'), copy = hero.querySelector('.internal-hero-copy'), media = hero.querySelector('.internal-hero-media');
    if (!title || !copy || !media) return;
    hero.classList.add('cy-compact-hero');
    if (!mobile.matches) {
      ['--cy-hero-overlap','--cy-hero-height','--cy-scene-left','--cy-scene-top','--cy-scene-scale','--cy-journey-width','--cy-journey-scale'].forEach(key => hero.style.removeProperty(key));
      return;
    }
    const lines = [], walker = document.createTreeWalker(title, NodeFilter.SHOW_TEXT);
    while (walker.nextNode()) {
      if (!walker.currentNode.textContent.trim()) continue;
      const range = document.createRange(); range.selectNodeContents(walker.currentNode);
      for (const rect of range.getClientRects()) if (rect.width > 0 && !lines.some(line => Math.abs(line.top - rect.top) < 3)) lines.push({ top: rect.top, bottom: rect.bottom });
    }
    lines.sort((a,b) => a.top-b.top);
    const last = lines.at(-1) || title.getBoundingClientRect();
    const backgroundTop = lines.length > 1 ? (last.top+last.bottom)/2 : last.top;
    hero.style.setProperty('--cy-hero-overlap', (backgroundTop-copy.getBoundingClientRect().bottom)+'px');
    const artTop = Math.max(18, title.getBoundingClientRect().bottom-backgroundTop+18);
    const scene = media.querySelector('.automation-scene,.support-scene,.hosting-scene,.wp-scene,.cloud-scene,.mail-scene,.seo-scene,.campaign-scene');
    if (!scene) {
      const journey = media.querySelector('.app-journey');
      if (journey) {
        const frameWidth=(media.querySelector('.hero-art-box')||media).getBoundingClientRect().width;
        const canvasWidth=Math.max(350,frameWidth),scale=frameWidth/canvasWidth;
        hero.style.setProperty('--cy-journey-width',canvasWidth+'px');
        hero.style.setProperty('--cy-journey-scale',String(scale));
        hero.style.setProperty('--cy-scene-top',artTop+'px');
        hero.style.setProperty('--cy-hero-height',Math.ceil(artTop+363*scale)+'px');
      }
      return;
    }
    // Measure the existing scene's meaningful layers, then contain their complete footprint.
    hero.style.setProperty('--cy-scene-scale','1');hero.style.setProperty('--cy-scene-left','0px');hero.style.setProperty('--cy-scene-top','0px');
    const origin = scene.getBoundingClientRect();
    const boxes = [...scene.children].filter(el => getComputedStyle(el).display !== 'none' && !/(?:disc|halo|backdrop|glow|orbit|grid)/.test(el.className || '')).map(el => el.getBoundingClientRect()).filter(r => r.width && r.height);
    const minX = Math.min(0,...boxes.map(r => r.left-origin.left));
    const maxX = Math.max(...boxes.map(r => r.right-origin.left),1);
    const minY = Math.min(0,...boxes.map(r => r.top-origin.top));
    const maxY = Math.max(...boxes.map(r => r.bottom-origin.top),1);
    const frameWidth = (media.querySelector('.hero-art-box') || media).getBoundingClientRect().width;
    const scale = Math.min(frameWidth/(maxX-minX),(hero.matches('.digital-live-hero')?360:280)/(maxY-minY));
    hero.style.setProperty('--cy-scene-scale',String(scale));
    hero.style.setProperty('--cy-scene-left',(-minX*scale)+'px');
    hero.style.setProperty('--cy-scene-top',(artTop-minY*scale)+'px');
    hero.style.setProperty('--cy-hero-height',Math.ceil(artTop+(maxY-minY)*scale+18)+'px');
  }

  function dragCursor(surface) {
    if (cursors.has(surface)) return; cursors.add(surface);
    surface.classList.add('cy-swipe-surface');
    let pressed, suppressUntil=0;
    surface.addEventListener('pointerdown',event=>{pressed={x:event.clientX,y:event.clientY,moved:false};});
    surface.addEventListener('pointermove',event=>{if(pressed&&(Math.abs(event.clientX-pressed.x)>7||Math.abs(event.clientY-pressed.y)>7))pressed.moved=true;});
    surface.addEventListener('pointerup',()=>{if(pressed?.moved)suppressUntil=performance.now()+450;pressed=null;});
    surface.addEventListener('pointercancel',()=>{pressed=null;});
    surface.addEventListener('click',event=>{if(performance.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
    const cursor = document.createElement('span');cursor.className='cy-owner-drag-cursor';cursor.setAttribute('aria-hidden','true');cursor.textContent=document.documentElement.lang==='ar'?'اسحب':'Drag';document.body.append(cursor);
    const hide = () => { cursor.style.opacity='0'; };
    const move = event => {
      if (!fine.matches || reduce.matches || event.pointerType !== 'mouse' || event.target.closest('a,input,summary,select') || (!surface.matches('.rf-strip') && event.target.closest('button')) || (surface.matches('.d-hosting-grid') && surface.scrollWidth <= surface.clientWidth+1)) { hide(); return; }
      cursor.style.transform=`translate3d(${event.clientX}px,${event.clientY}px,0)`;cursor.style.opacity='1';
    };
    surface.addEventListener('pointerenter',move);surface.addEventListener('pointermove',move);surface.addEventListener('pointerleave',hide);surface.addEventListener('focusin',hide);addEventListener('scroll',hide,{passive:true});
    // Native horizontal rails need mouse dragging; Flickity keeps its own controller.
    if (surface.matches('.d-hosting-grid')) {
      let drag, suppress=false;
      surface.addEventListener('pointerdown',event => {if(event.pointerType!=='mouse'||event.button!==0||event.target.closest('a,button,input,summary'))return;drag={id:event.pointerId,x:event.clientX,left:surface.scrollLeft,moved:false};});
      surface.addEventListener('pointermove',event => {if(!drag||event.pointerId!==drag.id)return;const dx=event.clientX-drag.x;if(Math.abs(dx)<6&&!drag.moved)return;drag.moved=true;surface.setPointerCapture(event.pointerId);event.preventDefault();surface.scrollLeft=drag.left-dx;});
      const end=event=>{if(!drag||event.pointerId!==drag.id)return;suppress=drag.moved;drag=null;if(surface.hasPointerCapture(event.pointerId))surface.releasePointerCapture(event.pointerId);setTimeout(()=>suppress=false,0);};
      surface.addEventListener('pointerup',end);surface.addEventListener('pointercancel',end);surface.addEventListener('click',event=>{if(suppress){event.preventDefault();event.stopPropagation();}},true);surface.addEventListener('dragstart',event=>event.preventDefault());
    }
  }

  function filmTouch(surface) {
    if (films.has(surface)) return; films.add(surface);
    let gesture;
    surface.addEventListener('touchstart', event => {
      if (event.touches.length !== 1) { gesture=null; return; }
      const touch=event.touches[0];
      gesture={x:touch.clientX,y:touch.clientY,left:surface.scrollLeft,lastX:touch.clientX,lastTime:performance.now(),velocity:0,horizontal:false};
    }, {passive:true});
    surface.addEventListener('touchmove', event => {
      if (!gesture || event.touches.length !== 1) return;
      const touch=event.touches[0],dx=touch.clientX-gesture.x,dy=touch.clientY-gesture.y;
      if (!gesture.horizontal && (Math.abs(dx)<8 || Math.abs(dx)<=Math.abs(dy))) return;
      gesture.horizontal=true;event.preventDefault();
      const now=performance.now();gesture.velocity=(gesture.lastX-touch.clientX)/Math.max(1,now-gesture.lastTime);gesture.lastX=touch.clientX;gesture.lastTime=now;
      surface.scrollLeft=gesture.left-dx;
    }, {passive:false});
    surface.addEventListener('touchend', event => {
      if (!gesture) return;
      if (gesture.horizontal) { event.preventDefault();if (!reduce.matches) surface.scrollBy({left:Math.max(-240,Math.min(240,gesture.velocity*160)),behavior:'smooth'}); }
      gesture=null;
    }, {passive:false});
    surface.addEventListener('touchcancel',()=>gesture=null,{passive:true});
  }

  const stackState = root => {
    const state=stacks.get(root), top=parseFloat(getComputedStyle(state.cards[0]).top)||76;
    const positions=state.anchors.map(anchor=>anchor.getBoundingClientRect().top+scrollY-top);
    const index=positions.reduce((best,position,i)=>Math.abs(position-scrollY)<Math.abs(positions[best]-scrollY)?i:best,0);
    return {...state,positions,index};
  };
  const nextStack=(state,direction)=>direction>0?state.positions.findIndex(position=>position>scrollY+24):state.positions.findLastIndex(position=>position<scrollY-24);
  const goStack=(state,direction)=>{
    const next=nextStack(state,direction);
    if(next<0)return false;
    scrollTo({top:state.positions[next],behavior:reduce.matches?'instant':'smooth'});return true;
  };
  const scrollableCopy=(target,direction)=>{
    const copy=target.closest('.v-copy');if(!copy||copy.scrollHeight<=copy.clientHeight+2)return false;
    return direction>0?copy.scrollTop+copy.clientHeight<copy.scrollHeight-2:copy.scrollTop>1;
  };
  function stack(root) {
    if(stacks.has(root))return;
    const cards=[...root.querySelectorAll(':scope > .v-show')];if(cards.length<2)return;
    const anchors=cards.map(card=>{const marker=document.createElement('i');marker.setAttribute('aria-hidden','true');marker.dataset.cySnapAnchor='';marker.style.cssText='display:block;height:0;pointer-events:none';card.before(marker);return marker;});
    stacks.set(root,{root,cards,anchors});
    let touch;
    root.addEventListener('touchstart',event=>{if(event.touches.length!==1||event.target.closest('input,select,textarea'))return;touch={x:event.touches[0].clientX,y:event.touches[0].clientY,state:stackState(root),claimed:false,target:event.target};},{passive:true});
    root.addEventListener('touchmove',event=>{
      if(!touch||event.touches.length!==1)return;const dx=event.touches[0].clientX-touch.x,dy=event.touches[0].clientY-touch.y;
      if(Math.abs(dy)<12||Math.abs(dy)<=Math.abs(dx))return;const direction=dy<0?1:-1;
      if(scrollableCopy(touch.target,direction))return;
      if(nextStack(touch.state,direction)<0)return;
      touch.claimed=true;event.preventDefault();
    },{passive:false});
    root.addEventListener('touchend',event=>{if(!touch)return;const state=touch;touch=null;const dy=event.changedTouches[0].clientY-state.y;if(state.claimed){event.preventDefault();if(Math.abs(dy)>40)goStack(state.state,dy<0?1:-1);}},{passive:false});
    root.addEventListener('touchcancel',()=>touch=null,{passive:true});
  }
  let wheelLock, quietTimer, lockUntil=0, wheelAmount=0;
  addEventListener('wheel',event=>{
    if(event.ctrlKey||Math.abs(event.deltaX)>Math.abs(event.deltaY)||!event.deltaY)return;
    let root=wheelLock?.root;
    if(!root?.isConnected)root=[...stacks.keys()].find(el=>{const r=el.getBoundingClientRect();return el.isConnected&&r.top<innerHeight*.35&&r.bottom>innerHeight*.5;});
    if(!root)return;
    const direction=event.deltaY>0?1:-1;
    if(!wheelLock&&scrollableCopy(event.target,direction))return;
    const state=stackState(root);
    if(!wheelLock&&nextStack(state,direction)<0)return;
    event.preventDefault();
    clearTimeout(quietTimer);
    const release=()=>{const remaining=lockUntil-performance.now();if(remaining>0)quietTimer=setTimeout(release,remaining);else {wheelLock=null;wheelAmount=0;}};
    quietTimer=setTimeout(release,220);
    if(wheelLock)return;
    wheelAmount+=event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?innerHeight:1);
    if(Math.abs(wheelAmount)<24)return;
    wheelLock=state;lockUntil=performance.now()+750;goStack(state,direction);wheelAmount=0;
  },{passive:false});

  function setup() {
    document.querySelectorAll(heroSelector).forEach(hero=>{if(!heroes.has(hero)){heroes.set(hero,true);fitHero(hero);}});
    document.querySelectorAll('.rf-strip,.d-hosting-grid').forEach(dragCursor);
    document.querySelectorAll('.b-filmstrip').forEach(filmTouch);
    document.querySelectorAll('.v-showcases').forEach(stack);
    document.querySelectorAll('#mobile-navigation .hp-mobile-submenu').forEach(menu=>{
      const first=menu.firstElementChild;if(first&&/^(Explore|استكشف)\b/.test(first.textContent.trim()))first.hidden=true;
    });
    const viewport=document.querySelector('#work .hp-carousel-viewport');
    if(viewport&&mobile.matches){const height=viewport.getBoundingClientRect().height;const root=viewport.closest('.hp-carousel');if(root&&height>0)root.style.setProperty('--cy-work-height',Math.max(parseFloat(root.style.getPropertyValue('--cy-work-height'))||0,height)+'px');}
  }
  let resizeFrame;
  const resize=()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{for(const hero of heroes.keys()){if(hero.isConnected)fitHero(hero);else heroes.delete(hero);}setup();});};
  setup();document.fonts?.ready.then(resize);addEventListener('resize',resize,{passive:true});mobile.addEventListener('change',resize);
  const observer=new MutationObserver(records=>{
    if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(node.matches?.(heroSelector+',.rf-strip,.b-filmstrip,.hp-mobile-submenu,.v-showcases,.hp-carousel')||node.querySelector?.(heroSelector+',.rf-strip,.b-filmstrip,.hp-mobile-submenu,.v-showcases,.hp-carousel')))))setup();
  });
  observer.observe(document.body,{childList:true,subtree:true});
})();
