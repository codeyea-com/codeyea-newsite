'use client';
import {useEffect,useState} from 'react';
import {gsap} from 'gsap';
import type {ServiceItem} from '@/schemas/services-page';
import {motionQueries} from '@/components/motion/approved-patterns';

export function ServicesAccordion({items}:{items:ServiceItem[]}){
 const [enhanced,setEnhanced]=useState(false),[open,setOpen]=useState<string|null>(items[0]?.id??null);
 useEffect(()=>setEnhanced(true),[]);
 return <div className="rp-accordion sv-accordion" data-enhanced={enhanced} data-motion-owner="services-accordion">{items.map(i=>{const expanded=!enhanced||open===i.id;return <article key={i.id}><h3><button id={i.id+'-button'} type="button" aria-expanded={expanded} aria-controls={i.id+'-panel'} onClick={()=>setOpen(open===i.id?null:i.id)}>{i.title}<span aria-hidden="true">{expanded?'−':'+'}</span></button></h3><div className="sv-answer" id={i.id+'-panel'} role="region" aria-labelledby={i.id+'-button'} aria-hidden={!expanded} inert={!expanded} data-open={expanded}><div><p>{i.body}</p></div></div></article>})}</div>;
}

/** One controller owns only Services body entrances and card pointer transforms. */
export function ServicesMotion(){
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('.services-page');if(!root)return;
  document.documentElement.classList.add('sv-js');
  const reduced=matchMedia(motionQueries.reduced),fine=matchMedia('(hover:hover) and (pointer:fine)');let dispose=()=>{};
  const setup=()=>{dispose();root.classList.toggle('motion-enabled',!reduced.matches);if(reduced.matches)return;
   const timelines=new Map<Element,gsap.core.Timeline>(),visible=new Set<Element>(),removers:(()=>void)[]=[];
   const homeObserver=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('is-inview');homeObserver.unobserve(e.target)}}),{threshold:.15});root.querySelectorAll('#services [data-motion-enter]').forEach(e=>homeObserver.observe(e));
   const context=gsap.context(()=>{
    root.querySelectorAll<HTMLElement>('[data-sv-reveal]').forEach(group=>{
     const kind=group.dataset.svReveal;
     const targets=kind==='accordion'?[...group.querySelectorAll('.sv-accordion>article')]:group.matches('h2,p,figure')?[group]:[...group.children];
     const initial=kind==='cards'?{x:60,scale:.85,rotationY:35,opacity:0}:kind==='row'?{x:30,opacity:0}:kind==='intro'?{y:60,opacity:0}:kind==='accordion'?{y:30,opacity:0}:{y:35,opacity:0};
     const delay=kind==='intro'?.8:kind==='accordion'?1.1:0;
     timelines.set(group,gsap.timeline({paused:true}).fromTo(targets,initial,{x:0,y:0,scale:1,scaleY:1,rotationY:0,opacity:1,duration:1.8,stagger:.18,ease:'power4.out',clearProps:'transform,opacity'},delay));
    });
   },root);
   const observer=new IntersectionObserver(entries=>entries.forEach(e=>{const t=timelines.get(e.target);if(e.isIntersecting){visible.add(e.target);if(!document.hidden)t?.play()}else{visible.delete(e.target);if(t&&t.progress()<1)t.pause()}}),{threshold:0});const strategyObserver=new IntersectionObserver(entries=>entries.forEach(e=>{const t=timelines.get(e.target);if(e.isIntersecting){visible.add(e.target);if(!document.hidden)t?.play()}else{visible.delete(e.target);if(t&&t.progress()<1)t.pause()}}),{rootMargin:'0px 0px -30% 0px',threshold:0});timelines.forEach((_,e)=>(e.getAttribute('data-sv-reveal')==='strategy'?strategyObserver:observer).observe(e));
   const focus=(e:FocusEvent)=>timelines.forEach((t,el)=>{if(el.contains(e.target as Node))t.progress(1)});
   const visibility=()=>timelines.forEach((t,el)=>{if(document.hidden)t.pause();else if(visible.has(el))t.play()});root.addEventListener('focusin',focus);document.addEventListener('visibilitychange',visibility);
   if(fine.matches)root.querySelectorAll<HTMLElement>('.rp-cards article').forEach(card=>{
    const surface=card.querySelector<HTMLElement>('.rp-card-surface')!;
    // Reference timing; wider owner-requested pointer range, one tween per surface.
    const animate=(x:number,y:number)=>gsap.to(surface,{x:x*8,y:y*8,rotationY:-x*16,rotationX:y*16,duration:1.2,ease:'power2.out',overwrite:true});
    const move=(e:PointerEvent)=>{if(e.pointerType==='touch')return;const r=card.getBoundingClientRect();animate(Math.max(-.5,Math.min(.5,(e.clientX-r.left)/r.width-.5)),Math.max(-.5,Math.min(.5,(e.clientY-r.top)/r.height-.5)))};
    const reset=()=>{animate(0,0)};card.addEventListener('pointermove',move);card.addEventListener('pointerleave',reset);removers.push(()=>{gsap.killTweensOf(surface);surface.style.removeProperty('transform');card.removeEventListener('pointermove',move);card.removeEventListener('pointerleave',reset)});
   });
   dispose=()=>{homeObserver.disconnect();observer.disconnect();strategyObserver.disconnect();root.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',visibility);removers.forEach(f=>f());context.revert()};
  };setup();reduced.addEventListener('change',setup);fine.addEventListener('change',setup);
  return()=>{dispose();root.classList.remove('motion-enabled');document.documentElement.classList.remove('sv-js');reduced.removeEventListener('change',setup);fine.removeEventListener('change',setup)};
 },[]);return null;
}

