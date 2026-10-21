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
    const sections=new Map<Element,Set<HTMLElement>>();
    key.split('|').forEach(selector=>root.querySelectorAll<HTMLElement>(selector).forEach(group=>{
     const targetSelector='h1,h2,h3,p,li,a,button,summary,figcaption'+(includeFigures?',figure':'');
     const single=group.matches(targetSelector);
     const targets=(single?[group]:[...group.querySelectorAll<HTMLElement>(targetSelector)]).filter(el=>(single||!el.parentElement?.closest('li,a,button,summary'))&&(!el.closest('details:not([open])')||el.matches('summary'))&&!el.closest('[data-motion-owner]'));
     const section=group.closest('section')??group;
     const bucket=sections.get(section)??new Set<HTMLElement>();
     targets.forEach(el=>bucket.add(el));sections.set(section,bucket);
    }));
    sections.forEach((bucket,section)=>{
     const targets=[...bucket].filter(el=>![...bucket].some(parent=>parent!==el&&parent.contains(el)))
      .sort((a,b)=>a.compareDocumentPosition(b)&Node.DOCUMENT_POSITION_FOLLOWING?-1:1);
     if(!targets.length)return;
     timelines.set(section,gsap.timeline({paused:true}).fromTo(targets,{y:pattern.distance,opacity:0},{y:0,opacity:1,duration:pattern.duration,stagger:pattern.stagger,ease:pattern.ease,clearProps:'transform,opacity'},pattern.delay));
    });
   },root);
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{const t=timelines.get(entry.target);if(entry.isIntersecting){visible.add(entry.target);if(!document.hidden)t?.play()}else{visible.delete(entry.target);if(t&&t.progress()<1)t.pause()}}),{threshold:0,rootMargin:'0px 0px -12% 0px'});
   timelines.forEach((_,el)=>observer.observe(el));
   const focus=(e:FocusEvent)=>timelines.forEach((t,el)=>{if(el.contains(e.target as Node))t.progress(1)});
   const visibility=()=>timelines.forEach((t,el)=>{if(document.hidden)t.pause();else if(visible.has(el))t.play()});
   root.addEventListener('focusin',focus);document.addEventListener('visibilitychange',visibility);
   dispose=()=>{observer.disconnect();context.revert();root.removeEventListener('focusin',focus);document.removeEventListener('visibilitychange',visibility)};
  };setup();reduced.addEventListener('change',setup);viewport?.addEventListener('change',setup);return()=>{dispose();reduced.removeEventListener('change',setup);viewport?.removeEventListener('change',setup)};
 },[scope,key,when,includeFigures]);return null;
}
