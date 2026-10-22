(()=>{
 document.querySelectorAll('.cy-host-plans').forEach(root=>{
 const ar=root.dataset.locale==='ar',track=root.querySelector('.plans'),cards=[...track.children],reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
 let annual=false,index=0;
 const drawPrices=()=>cards.forEach(card=>{const monthly=Number(card.dataset.monthly),discount=Number(card.dataset.discount),price=monthly*(annual?1-discount:1);card.querySelector('.amount').textContent='$'+price.toFixed(annual?2:0);card.querySelector('.old').textContent='$'+monthly;card.querySelector('.old').hidden=!annual||!discount;card.querySelector('.discount').hidden=!annual||!discount;card.querySelector('.monthly-label').hidden=annual;card.querySelector('.billing-note').textContent=annual?(ar?'تُدفع سنوياً: $':'Billed annually: $')+(price*12).toFixed(2):(ar?'تُدفع شهرياً: $':'Billed monthly: $')+monthly;});
 root.querySelectorAll('[data-billing]').forEach(button=>button.addEventListener('click',()=>{annual=button.dataset.billing==='year';root.querySelector('.billing').classList.toggle('annual',annual);root.querySelectorAll('[data-billing]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));drawPrices();if(!reduce)root.querySelectorAll('.price-block').forEach(b=>b.animate([{opacity:.3,transform:'translateY(13px)'},{opacity:1,transform:'none'}],{duration:400,easing:'ease-out'}));}));
 const visibleCount=()=>Math.min(cards.length,Number(getComputedStyle(track).getPropertyValue('--visible-plans'))||1);
 const maxIndex=()=>Math.max(0,cards.length-visibleCount());
 const nearest=()=>{const r=track.getBoundingClientRect(),padding=parseFloat(getComputedStyle(track).paddingInlineStart)||0;return Math.min(maxIndex(),cards.reduce((best,c,i)=>{const distance=el=>Math.abs(ar?el.getBoundingClientRect().right-r.right+padding:el.getBoundingClientRect().left-r.left-padding);return distance(c)<distance(cards[best])?i:best},0));};
 const fitHeight=()=>{const r=track.getBoundingClientRect(),shown=cards.filter(c=>{const b=c.getBoundingClientRect();return Math.min(b.right,r.right)-Math.max(b.left,r.left)>1});const style=getComputedStyle(track),height=Math.ceil(Math.max(...shown.map(c=>c.offsetHeight),0)+(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0));if(height&&Math.abs(track.clientHeight-height)>1)track.style.height=height+'px';};
 const update=()=>{index=nearest();fitHeight();root.querySelector('.counter').textContent=(index+1)+' / '+cards.length;root.querySelector('[data-move="-1"]').disabled=index===0;root.querySelector('[data-move="1"]').disabled=index===maxIndex();};
 const goTo=(next,animate=true)=>{index=Math.max(0,Math.min(maxIndex(),next));track.scrollTo({left:cards[index].offsetLeft-cards[0].offsetLeft,behavior:animate&&!reduce?'smooth':'instant'});};
 const move=n=>goTo(index+n);
 root.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move(Number(b.dataset.move)));track.addEventListener('scroll',update,{passive:true});
 let resizeFrame=0,lastWidth=track.clientWidth;const resizeObserver=new ResizeObserver(()=>{if(track.clientWidth===lastWidth)return;lastWidth=track.clientWidth;cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(()=>{goTo(Math.min(index,maxIndex()),false);update()})});resizeObserver.observe(track);
 const cardResize=new ResizeObserver(()=>fitHeight());cards.forEach(card=>cardResize.observe(card));
 track.addEventListener('keydown',e=>{if(e.target!==track||!['ArrowLeft','ArrowRight'].includes(e.key))return;e.preventDefault();move((e.key==='ArrowRight'?1:-1)*(ar?-1:1))});
 let drag=null,suppressClick=false;
 // Match the homepage industry indicator without covering clickable controls.
 const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
 const cursor=document.createElement('span'),cursorLabel=document.createElement('span');
 cursor.className='cy-plan-drag-cursor';cursor.setAttribute('aria-hidden','true');cursorLabel.textContent=ar?'اسحب':'Drag';cursor.append(cursorLabel);document.body.append(cursor);
 let cursorFrame=0,cursorPoint=null;
 const hideCursor=()=>{cursorPoint=null;cancelAnimationFrame(cursorFrame);cursorFrame=0;cursor.style.opacity='0';track.classList.remove('has-drag-cursor')};
 const showCursor=e=>{if(e.pointerType!=='mouse'||!finePointer.matches||reduce||track.scrollWidth<=track.clientWidth+1||(!drag&&e.target.closest('a,button,summary,input,select'))){hideCursor();return;}cursorPoint={x:e.clientX,y:e.clientY};if(cursorFrame)return;cursorFrame=requestAnimationFrame(()=>{cursorFrame=0;if(!cursorPoint)return;cursor.style.transform='translate3d('+cursorPoint.x+'px,'+cursorPoint.y+'px,0)';cursor.style.opacity='1';track.classList.add('has-drag-cursor')})};
 track.addEventListener('pointerenter',showCursor);track.addEventListener('pointermove',showCursor);track.addEventListener('pointerleave',hideCursor);track.addEventListener('pointercancel',hideCursor);track.addEventListener('focusin',hideCursor);window.addEventListener('blur',hideCursor);window.addEventListener('scroll',hideCursor,{passive:true});finePointer.addEventListener('change',hideCursor);
 track.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0||e.target.closest('a,button,summary,input,select'))return;drag={id:e.pointerId,x:e.clientX,start:track.scrollLeft,moved:false};});
 track.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const distance=e.clientX-drag.x;if(!drag.moved&&Math.abs(distance)<6)return;if(!drag.moved){drag.moved=true;track.setPointerCapture(e.pointerId);track.classList.add('is-dragging')}e.preventDefault();track.scrollLeft=drag.start-distance;});
 const endDrag=e=>{if(!drag||e.pointerId!==drag.id)return;const moved=drag.moved,targetIndex=nearest();drag=null;track.classList.remove('is-dragging');if(track.hasPointerCapture(e.pointerId))track.releasePointerCapture(e.pointerId);if(moved){suppressClick=true;goTo(targetIndex,false);setTimeout(()=>{suppressClick=false},0)}};
 track.addEventListener('pointerup',endDrag);track.addEventListener('pointercancel',endDrag);track.addEventListener('click',e=>{if(suppressClick){e.preventDefault();e.stopPropagation()}},true);track.addEventListener('dragstart',e=>e.preventDefault());
 root.querySelectorAll('details.more').forEach(d=>{
   const summary=d.querySelector('summary'),panel=d.querySelector('.more-panel');let animation=null,expanded=d.open;
   const change=open=>{if(open===expanded)return;expanded=open;const start=d.getBoundingClientRect().height;animation?.cancel();animation=null;d.open=true;d.style.height='auto';const end=d.scrollHeight;
     // Measure the collapsed box directly, retaining an open panel until its closing animation completes.
     let target=end;if(!open){d.open=false;target=d.getBoundingClientRect().height;d.open=true;}
     summary.setAttribute('aria-expanded',String(open));
     if(reduce){d.open=open;d.style.height='';return;}
     d.style.height=start+'px';
     animation=d.animate([{height:start+'px'},{height:target+'px'}],{duration:480,easing:'cubic-bezier(.22,1,.36,1)',fill:'forwards'});
     panel?.animate(open?[{opacity:0,transform:'translateY(-9px)'},{opacity:1,transform:'translateY(0)'}]:[{opacity:1},{opacity:0}],{duration:open?380:230,easing:'ease-out'});
     const current=animation;current.onfinish=()=>{if(animation!==current)return;d.open=open;d.style.height='';current.cancel();animation=null;};
   };
   summary.setAttribute('aria-expanded',String(expanded));summary.addEventListener('click',e=>{e.preventDefault();change(!expanded)});
   d.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover:hover)').matches)change(true)});
   d.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')change(false)});
 });
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:0});root.querySelectorAll('.reveal').forEach(el=>observer.observe(el));drawPrices();update();
 });
})();
