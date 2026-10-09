"use client";
import {useEffect,useRef,useState} from 'react';
import {gsap} from 'gsap';
import type {AboutSection} from '@/schemas/about';
import {AboutImage} from './about-image';

function ShowcaseSlide({section}:{section:AboutSection}){
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const node=root.current!,media=node.querySelector<HTMLElement>('.about-showcase-media')!,image=media.querySelector('img'),cover=node.querySelector<HTMLElement>('.about-showcase-cover')!;
  const targets=Array.from(node.querySelectorAll<HTMLElement>('[data-showcase-copy]'));
  const desktop=matchMedia('(min-width:1200px) and (hover:hover) and (pointer:fine)'),reduce=matchMedia('(prefers-reduced-motion:reduce)');
  let observer:IntersectionObserver|undefined, reveal:gsap.core.Timeline|undefined,copy:gsap.core.Tween|undefined;
  let imageStarted=false,copyStarted=false,disposed=false,disabled=false;
  const show=()=>{disabled=true;observer?.disconnect();reveal?.kill();copy?.kill();gsap.set(targets,{clearProps:'opacity'});if(image)gsap.set(image,{clearProps:'opacity'});gsap.set(cover,{opacity:0});};
  if(desktop.matches&&!reduce.matches&&image){
   gsap.set(image,{opacity:0});gsap.set(targets,{opacity:0});gsap.set(cover,{opacity:1,scaleY:0,transformOrigin:'50% 0%'});
   observer=new IntersectionObserver(entries=>{
    for(const entry of entries){if(!entry.isIntersecting)continue;
     if(entry.target===media&&!imageStarted){imageStarted=true;
      const start=()=>{if(disposed||disabled||reduce.matches||!desktop.matches)return;reveal=gsap.timeline().to(cover,{scaleY:1,duration:.5,ease:'power4.inOut'}).set(image,{opacity:1}).set(cover,{transformOrigin:'50% 100%'}).to(cover,{scaleY:0,duration:.5,ease:'power4.inOut'});};
      if(image.complete)start();else image.decode().catch(()=>{}).then(start);
     }
     if(entry.target===targets[0]&&!copyStarted){copyStarted=true;copy=gsap.to(targets,{opacity:1,duration:1.6,stagger:.16,ease:'power4.out',clearProps:'opacity'});}
    }
   },{threshold:0});observer.observe(media);if(targets[0])observer.observe(targets[0]);
  }
  const preferences=()=>{if(reduce.matches||!desktop.matches)show()};
  const visibility=()=>{if(document.hidden){reveal?.pause();copy?.pause()}else{reveal?.resume();copy?.resume()}};
  const focus=()=>show();
  desktop.addEventListener('change',preferences);reduce.addEventListener('change',preferences);document.addEventListener('visibilitychange',visibility);node.addEventListener('focusin',focus);
  return()=>{disposed=true;show();desktop.removeEventListener('change',preferences);reduce.removeEventListener('change',preferences);document.removeEventListener('visibilitychange',visibility);node.removeEventListener('focusin',focus)};
 },[]);
 return <div ref={root} className="about-reference-container about-showcase-layout">
  <div className="about-showcase-media"><AboutImage media={section.media}/><span className="about-showcase-cover" aria-hidden="true"/></div>
  <div><p className="about-label" data-showcase-copy>{section.label}</p><h2 data-showcase-copy>{section.heading}</h2>{section.body.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i} data-showcase-copy>{p}</p>)}<button type="button" className="about-reference-button" data-showcase-copy>{section.ctaLabel} <span aria-hidden="true">›</span></button></div>
 </div>;
}

export function AboutShowcase({section}:{section:AboutSection}) {
 const [active,setActive]=useState(0);
 const slider=useRef<HTMLDivElement>(null);
 const controls=useRef<(HTMLButtonElement|null)[]>([]);
 const slides=section.items.length ? section.items.map(item=>({...section,heading:item.title,body:item.body,label:item.label!,ctaLabel:item.ctaLabel,media:item.media})) : [section];
 useEffect(()=>{
  const node=slider.current,stage=node?.closest<HTMLElement>('.about-showcase');
  if(!node||!stage||slides.length<2)return;
  const desktop=matchMedia('(min-width:1200px)');
  const originalHeight=stage.style.height;
  const syncLayout=()=>{stage.style.height=desktop.matches?`${slides.length*100}vh`:originalHeight;};
  syncLayout();
  let frame=0;
  const update=()=>{
   frame=0;
   if(!desktop.matches)return;
   const distance=stage.offsetHeight-window.innerHeight;
   if(distance<=0)return;
   const top=stage.getBoundingClientRect().top+window.scrollY;
   const progress=Math.max(0,Math.min(1,(window.scrollY-top)/distance));
   const next=Math.min(slides.length-1,Math.round(progress*(slides.length-1)));
   setActive(current=>current===next?current:next);
  };
  const onScroll=()=>{if(!frame)frame=requestAnimationFrame(update)};
  const onModeChange=()=>{syncLayout();onScroll()};
  update();window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);desktop.addEventListener('change',onModeChange);
  return()=>{window.removeEventListener('scroll',onScroll);window.removeEventListener('resize',onScroll);desktop.removeEventListener('change',onModeChange);if(frame)cancelAnimationFrame(frame);stage.style.height=originalHeight};
 },[slides.length]);
 const selectSlide=(index:number)=>{
  setActive(index);
  const stage=slider.current?.closest<HTMLElement>('.about-showcase');
  if(stage&&matchMedia('(min-width:1200px)').matches&&slides.length>1){
   const distance=stage.offsetHeight-window.innerHeight,top=stage.getBoundingClientRect().top+window.scrollY;
   window.scrollTo({top:top+distance*(index/(slides.length-1)),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  }
 };
 return <div ref={slider} className="about-showcase-slider">
  <div className="about-showcase-stage">
   {slides.map((slide,index)=><div key={section.items[index]?.id??section.id} className="about-showcase-slide" id={'showcase-slide-'+(index+1)} role="group" aria-roledescription="slide" aria-label={(index+1)+' of '+slides.length+': '+slide.heading} aria-hidden={index!==active} inert={index!==active} style={{transform:'translateY('+((index-active)*100)+'%)'}}>
    <ShowcaseSlide section={slide}/>
   </div>)}
  </div>
  {slides.length>1&&<nav className="about-reference-pagination" aria-label="Showcase slides">
   {slides.map((slide,index)=><button key={section.items[index].id} type="button" ref={node=>{controls.current[index]=node}} aria-label={'Show slide '+(index+1)+': '+slide.heading} aria-controls={'showcase-slide-'+(index+1)} aria-pressed={active===index} onClick={()=>selectSlide(index)} onKeyDown={event=>{
    const next=event.key==='ArrowDown'||event.key==='ArrowRight'?Math.min(index+1,slides.length-1):event.key==='ArrowUp'||event.key==='ArrowLeft'?Math.max(index-1,0):event.key==='Home'?0:event.key==='End'?slides.length-1:undefined;
    if(next!==undefined){event.preventDefault();selectSlide(next);controls.current[next]?.focus()}
   }}>{String(index+1).padStart(2,'0')}</button>)}
  </nav>}
 </div>;
}
