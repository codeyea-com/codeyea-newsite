'use client';
import {useEffect} from 'react';
import {gsap} from 'gsap';
import {editorialEntrance as pattern,scrollImageOffset} from '../motion/approved-patterns';

/** Progressive enhancement: server HTML and no-JS rendering are always visible. */
export function IndustriesMotion(){
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('.industry-sections');if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const desktop=matchMedia('(min-width:1200px) and (min-height:700px) and (hover:hover) and (pointer:fine)');
  let dispose=()=>{};
  const setup=()=>{
   dispose();if(reduced.matches)return;
   const sections=[...root.querySelectorAll<HTMLElement>('.industry-section')];
   const active=new Set<HTMLElement>(),timelines=new Map<HTMLElement,gsap.core.Timeline>();
   const visible=new Set<HTMLElement>();let frame=0;
   const context=gsap.context(()=>{
    sections.forEach(section=>{
     const targets=[...section.querySelectorAll<HTMLElement>('.industry-heading > *, .industry-copy > *')];
     gsap.set(targets,{y:pattern.distance,opacity:0});
     const timeline=gsap.timeline({paused:true,onComplete:()=>{gsap.set(targets,{clearProps:'transform,opacity'});section.dataset.entered='true';}});
     timeline.to(targets,{y:0,opacity:1,duration:pattern.duration,stagger:pattern.stagger,ease:pattern.ease},pattern.delay);timelines.set(section,timeline);
    });
   },root);
   const paint=()=>{
    frame=0;if(document.hidden||!desktop.matches)return;
    active.forEach(section=>{
     const media=section.querySelector<HTMLElement>('.industry-images')!;
     const box=media.getBoundingClientRect();
     const progress=Math.max(0,Math.min(1,(innerHeight-box.top)/(innerHeight+box.height)));
     // Scroll down moves the photograph up within its stationary clipping frame.
     media.querySelector('img')?.style.setProperty('--industry-image-y',`${scrollImageOffset(box.top,box.height,innerHeight)}px`);
    });
   };
   const schedule=()=>{if(!frame&&!document.hidden&&active.size)frame=requestAnimationFrame(paint)};
   const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
    const section=entry.target as HTMLElement,timeline=timelines.get(section)!;
    if(entry.isIntersecting){visible.add(section);active.add(section);if(!document.hidden)timeline.play();schedule();}
    else{visible.delete(section);active.delete(section);if(timeline.progress()<1)timeline.pause();}
   }),{threshold:0});
   sections.forEach(s=>observer.observe(s));
   const focus=(event:FocusEvent)=>{
    const section=(event.target as HTMLElement).closest<HTMLElement>('.industry-section');
    if(section)timelines.get(section)?.progress(1);
   };
   const visibility=()=>{timelines.forEach((timeline,s)=>{if(timeline.progress()<1){if(document.hidden||!visible.has(s))timeline.pause();else timeline.play();}});if(document.hidden){cancelAnimationFrame(frame);frame=0}else schedule()};
   root.classList.toggle('industry-inner-parallax',desktop.matches);
   addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
   document.addEventListener('visibilitychange',visibility);root.addEventListener('focusin',focus);
   dispose=()=>{observer.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',visibility);root.removeEventListener('focusin',focus);context.revert();root.classList.remove('industry-inner-parallax');root.querySelectorAll<HTMLElement>('.industry-images img').forEach(e=>e.style.removeProperty('--industry-image-y'));};
  };
  setup();reduced.addEventListener('change',setup);desktop.addEventListener('change',setup);
  return()=>{dispose();reduced.removeEventListener('change',setup);desktop.removeEventListener('change',setup)};
 },[]);
 return null;
}
