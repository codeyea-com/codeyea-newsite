'use client';
import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import type Flickity from 'flickity';
import type {DetailSection} from '@/schemas/industry-detail';
import {AboutImage} from './about-image';
import 'flickity/css/flickity.css';

export function RoofingStrip({items,label='Roofing'}:{items:DetailSection['items'];label?:string}) {
 const root=useRef<HTMLDivElement>(null),instance=useRef<Flickity|null>(null),[selected,setSelected]=useState(0);
 useEffect(()=>{
  const media=matchMedia('(prefers-reduced-motion: reduce)');let disposed=false;
  const setup=async()=>{instance.current?.destroy();instance.current=null;root.current?.classList.remove('is-enhanced');if(media.matches||!root.current)return;const {default:Carousel}=await import('flickity');if(disposed||media.matches||!root.current)return;
   root.current.classList.add('is-enhanced');const f=new Carousel(root.current,{cellSelector:'.rf-strip-item',cellAlign:'left',contain:false,wrapAround:true,prevNextButtons:false,pageDots:false,autoPlay:false,adaptiveHeight:false,selectedAttraction:.025,friction:.28,dragThreshold:3,accessibility:true});instance.current=f;f.on('select',()=>setSelected(f.selectedIndex));
  };void setup();media.addEventListener('change',setup);return()=>{disposed=true;media.removeEventListener('change',setup);instance.current?.destroy();instance.current=null;};
 },[]);
 const move=(direction:number)=>{if(instance.current){direction>0?instance.current.next():instance.current.previous();return}const n=(selected+direction+items.length)%items.length;setSelected(n);const el=root.current;const item=el?.children[n] as HTMLElement|undefined;if(el&&item)el.scrollTo({left:item.offsetLeft-el.offsetLeft,behavior:'instant'})};
 return <><div ref={root} className="rf-strip" aria-label={label+" image gallery"} tabIndex={0}>{items.map(i=><div className="rf-strip-item" key={i.id}><figure><AboutImage media={i.media} sizes="(max-width:767px) 78vw, 28vw"/></figure></div>)}</div><div className="rf-strip-pagination"><button type="button" aria-label={"Previous "+label.toLowerCase()+" image"} onClick={()=>move(-1)}>{String(selected+1).padStart(2,'0')}</button><span className="rf-strip-progress" aria-hidden="true"><i style={{width:`${(selected+1)/items.length*100}%`}}/></span><button type="button" aria-label={"Next "+label.toLowerCase()+" image"} onClick={()=>move(1)}>{String(items.length).padStart(2,'0')}</button><span className="sr-only" aria-live="polite">Image {selected+1} of {items.length}</span></div></>;
}

export function RoofingAccordion({items}:{items:DetailSection['items']}) {
 const root=useRef<HTMLDivElement>(null),running=useRef(new Map<HTMLDetailsElement,Animation>());
 useEffect(()=>()=>running.current.forEach(a=>a.cancel()),[]);
 const change=(details:HTMLDetailsElement,open:boolean)=>{
  const answer=details.querySelector<HTMLElement>('.rf-answer')!;
  const start=answer.getBoundingClientRect().height;running.current.get(details)?.cancel();
  if(matchMedia('(prefers-reduced-motion: reduce)').matches){details.open=open;return}
  details.open=true;const end=open?answer.scrollHeight:0;
  const animation=answer.animate([{height:`${start}px`},{height:`${end}px`}],{duration:350,easing:'ease'});running.current.set(details,animation);
  animation.onfinish=()=>{details.open=open;running.current.delete(details);animation.cancel()};
 };
 return <div className="rf-accordion" ref={root}>{items.map((i,n)=><details key={i.id} open={n===0}><summary className="cy-faq-question" onClick={e=>{e.preventDefault();const d=e.currentTarget.parentElement as HTMLDetailsElement;const opening=!d.open;if(opening)root.current?.querySelectorAll<HTMLDetailsElement>('details[open]').forEach(other=>{if(other!==d)change(other,false)});change(d,opening)}}><h3>{i.title}</h3></summary><div className="rf-answer"><div className="rf-answer-inner"><p>{i.body}</p></div></div></details>)}</div>;
}

/** Only motions observed on the adopted reference sections are enhanced. */
export function RoofingReferenceMotion(){
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>('.rf-body');if(!root)return;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'),desktop=matchMedia('(min-width:1024px) and (hover:hover) and (pointer:fine)');let dispose=()=>{};
  const setup=()=>{dispose();if(reduced.matches||!desktop.matches)return;
   const service=root.querySelector<HTMLElement>('.rf-services');const visible=new Set<Element>();const timelines=new Map<Element,gsap.core.Timeline>();
   const context=gsap.context(()=>{
    if(service){
     const timeline=gsap.timeline({paused:true});
     timeline.fromTo(service.querySelectorAll('.rf-service-heading .rf-badge,.rf-service-heading h2'),
      {y:30,opacity:0},{y:0,opacity:1,duration:.7,stagger:.16,ease:'power4.out',clearProps:'transform,opacity'});
     timeline.fromTo(service.querySelectorAll('[data-rf-paragraph]'),
      {y:30,opacity:0},{y:0,opacity:1,duration:.7,stagger:.16,ease:'power4.out',clearProps:'transform,opacity'},'-=.2');
     timeline.fromTo(service.querySelectorAll('.rf-service-lists>h3,[data-rf-list] li'),
      {y:30,opacity:0},{y:0,opacity:1,duration:.6,stagger:.1,ease:'power4.out',clearProps:'transform,opacity'},'-=.2');
     timelines.set(service,timeline);
    }
   },root);
   const observer=new IntersectionObserver(entries=>entries.forEach(e=>{const t=timelines.get(e.target);if(e.isIntersecting){visible.add(e.target);if(!document.hidden)t?.play()}else{visible.delete(e.target);if(t&&t.progress()<1)t.pause()}}),{threshold:0,rootMargin:'0px 0px -12% 0px'});
   timelines.forEach((_,el)=>observer.observe(el));
   const visibility=()=>{timelines.forEach((t,e)=>{if(document.hidden)t.pause();else if(visible.has(e))t.play()})};
   const focus=()=>timelines.forEach(t=>t.progress(1));
   document.addEventListener('visibilitychange',visibility);service?.addEventListener('focusin',focus);
   dispose=()=>{observer.disconnect();document.removeEventListener('visibilitychange',visibility);service?.removeEventListener('focusin',focus);context.revert();};
  };setup();reduced.addEventListener('change',setup);desktop.addEventListener('change',setup);return()=>{dispose();reduced.removeEventListener('change',setup);desktop.removeEventListener('change',setup)};
 },[]);return null;
}
