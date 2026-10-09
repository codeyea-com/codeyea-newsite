'use client';
import {useEffect} from 'react';
import {gsap} from 'gsap';
import {editorialEntrance as pattern,motionQueries} from './approved-patterns';

/** Explicit targets only: never attaches to a specialist controller's descendants. */
export function EditorialMotion({scope,groups,when,includeFigures=false}:{scope:string;groups:string[];when?:string;includeFigures?:boolean}){
 const key=groups.join('|');
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>(scope);if(!root)return;
  const reduced=matchMedia(motionQueries.reduced),viewport=when?matchMedia(when):undefined;let dispose=()=>{};
  const setup=()=>{dispose();if(reduced.matches||(viewport&&!viewport.matches))return;
   const timelines=new Map<Element,gsap.core.Timeline>(),visible=new Set<Element>();
   const context=gsap.context(()=>{
    key.split('|').forEach(selector=>root.querySelectorAll<HTMLElement>(selector).forEach(group=>{
     if(timelines.has(group))return;
     const selector='h2,h3,p,li,a,button,summary,figcaption'+(includeFigures?',figure':'');
     const single=group.matches(selector);
     const targets=(single?[group]:[...group.querySelectorAll<HTMLElement>(selector)]).filter(el=>(single||!el.parentElement?.closest('li,a,button,summary'))&&(!el.closest('details:not([open])')||el.matches('summary'))&&!el.closest('[data-motion-owner]'));
     if(!targets.length)return;
     timelines.set(group,gsap.timeline({paused:true}).fromTo(targets,{y:pattern.distance,opacity:0},{y:0,opacity:1,duration:pattern.duration,stagger:pattern.stagger,ease:pattern.ease,clearProps:'transform,opacity'},pattern.delay));
    }));
   },root);
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const t=timelines.get(entry.target);if(entry.isIntersecting){visible.add(entry.target);if(!document.hidden)t?.play()}else{visible.delete(entry.target);if(t&&t.progress()<1)t.pause()}}),{threshold:0});
   timelines.forEach((_,el)=>observer.observe(el));
   const focus=(e:FocusEvent)=>timelines.forEach((t,el)=>{if(el.contains(e.target as Node))t.progress(1)});
   const visibility=()=>timelines.forEach((t,el)=>{if(document.hidden)t.pause();else if(visible.has(el))t.play()});
   root.addEventListener('focusin',focus);document.addEventListener('visibilitychange',visibility);
   dispose=()=>{observer.disconnect();context.revert();root.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',visibility)};
  };setup();reduced.addEventListener('change',setup);viewport?.addEventListener('change',setup);return()=>{dispose();reduced.removeEventListener('change',setup);viewport?.removeEventListener('change',setup)};
 },[scope,key,when,includeFigures]);return null;
}
