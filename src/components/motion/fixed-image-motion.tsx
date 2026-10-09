'use client';
import {useEffect} from 'react';
import {motionQueries,scrollImageOffset} from './approved-patterns';
/** The frame and decorative content never receive transforms. */
export function FixedImageMotion({selector}:{selector:string}){
 useEffect(()=>{
  const reduced=matchMedia(motionQueries.reduced),desktop=matchMedia(motionQueries.image);let dispose=()=>{};
  const setup=()=>{dispose();if(reduced.matches||!desktop.matches)return;
   const frames=[...document.querySelectorAll<HTMLElement>(selector)],active=new Set<HTMLElement>();let raf=0;
   const paint=()=>{raf=0;if(document.hidden)return;active.forEach(frame=>{const r=frame.getBoundingClientRect();frame.querySelector<HTMLElement>('img')?.style.setProperty('--inner-y',`${scrollImageOffset(r.top,r.height,innerHeight)}px`);})};
   const schedule=()=>{if(!raf&&active.size&&!document.hidden)raf=requestAnimationFrame(paint)};
   const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{const el=e.target as HTMLElement;e.isIntersecting?active.add(el):active.delete(el)});schedule()});
   frames.forEach(el=>{el.classList.add('motion-inner-scroll');observer.observe(el)});
   addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);document.addEventListener('visibilitychange',schedule);
   dispose=()=>{observer.disconnect();cancelAnimationFrame(raf);removeEventListener('scroll',schedule);removeEventListener('resize',schedule);document.removeEventListener('visibilitychange',schedule);frames.forEach(el=>{el.classList.remove('motion-inner-scroll');el.querySelector<HTMLElement>('img')?.style.removeProperty('--inner-y')})};
  };setup();reduced.addEventListener('change',setup);desktop.addEventListener('change',setup);return()=>{dispose();reduced.removeEventListener('change',setup);desktop.removeEventListener('change',setup)};
 },[selector]);return null;
}
