"use client";

import {useEffect, useRef, useState} from "react";
import {gsap} from "gsap";
import type {AboutSection} from "@/schemas/about";
import {AboutImage} from "./about-image";

// Temporary WordPress reference assets, keyed by the existing stable category IDs.
// Existing CMS media overrides remain available; no snapshot or schema is changed.
const referenceImages: Record<string,string> = {
 "about-reference-category-1":"construction", "about-reference-category-2":"residential", "about-reference-category-3":"city-planning",
};
const referenceSizes: Record<string,[number,number]> = {construction:[1975,1067],residential:[3360,1560],'city-planning':[1986,1067]};

export function AboutProjectField({section}:{section:AboutSection}) {
 const items=section.items.filter(i=>i.enabled).sort((a,b)=>a.position-b.position);
 const [active,setActive]=useState(0);
 const [previous,setPrevious]=useState<number|null>(null);
 const frame=useRef<HTMLDivElement>(null),copy=useRef<HTMLDivElement>(null),ghost=useRef<HTMLDivElement>(null),circle=useRef<HTMLSpanElement>(null);
 const reduced=useRef(false),selected=useRef(0),animateCopy=useRef<()=>void>(()=>{});

 useEffect(()=>{
  const root=frame.current!,title=copy.current!,old=ghost.current!,cursor=circle.current!;
  const motion=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover: hover) and (pointer: fine)');
  let inside=false,visible=true,running=false;
  let x=0,y=0;
  const moveX=gsap.quickTo(cursor,'x',{duration:.1,ease:'power1.out'});
  const moveY=gsap.quickTo(cursor,'y',{duration:.1,ease:'power1.out'});
  const tick=()=>{moveX(x);moveY(y)};
  const stop=()=>{gsap.ticker.remove(tick);running=false;moveX.tween.pause();moveY.tween.pause()};
  const targets=[title,old,...title.children,...old.children];
  const resetCopy=()=>{gsap.killTweensOf(targets);gsap.set([title,...title.children],{opacity:1,xPercent:0});gsap.set(old,{opacity:0});};
  const hide=(immediate=false)=>{
   inside=false;
   gsap.to(cursor,{scale:.15,opacity:0,duration:immediate?0:.65,ease:'expo.out',overwrite:true,onComplete:stop});
   if(immediate)stop();
  };
  const preferences=()=>{reduced.current=motion.matches;resetCopy();if(motion.matches||!fine.matches)hide(true)};
  preferences();
  animateCopy.current=()=>{
   resetCopy();if(reduced.current)return;
   // Live Liquid theme: parent fade at .2s, children at .3s, .1s stagger.
   gsap.fromTo(old,{opacity:1},{opacity:0,delay:.2,duration:.5,ease:'power1.out'});
   gsap.fromTo(title,{opacity:0},{opacity:1,delay:.2,duration:.5,ease:'power1.out'});
   gsap.fromTo(old.children,{xPercent:0,opacity:1},{xPercent:3,opacity:0,delay:.3,stagger:.1,duration:.5,ease:'power1.out'});
   gsap.fromTo(title.children,{xPercent:-3,opacity:0},{xPercent:0,opacity:1,delay:.3,stagger:.1,duration:.5,ease:'power1.out'});
  };
  const move=(event:PointerEvent)=>{
   if(event.pointerType==='touch'||reduced.current||!fine.matches||!visible||document.hidden)return;
   x=event.clientX;y=event.clientY;
   if(!inside){inside=true;gsap.set(cursor,{x,y});}
   if(!running){gsap.ticker.add(tick);running=true;}
   gsap.to(cursor,{scale:1,opacity:1,duration:.65,ease:'expo.out',overwrite:'auto'});
  };
  const leave=()=>hide();
  const suspend=()=>{if(document.hidden){hide(true);resetCopy()}};
  const scroll=()=>hide(true);
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){hide(true);resetCopy()}});
  observer.observe(root);
  root.addEventListener('pointermove',move);root.addEventListener('pointerleave',leave);
  document.addEventListener('visibilitychange',suspend);window.addEventListener('scroll',scroll,{passive:true});
  motion.addEventListener('change',preferences);fine.addEventListener('change',preferences);
  return()=>{stop();observer.disconnect();gsap.killTweensOf([...targets,cursor]);animateCopy.current=()=>{};
   root.removeEventListener('pointermove',move);root.removeEventListener('pointerleave',leave);
   document.removeEventListener('visibilitychange',suspend);window.removeEventListener('scroll',scroll);
   motion.removeEventListener('change',preferences);fine.removeEventListener('change',preferences);
  };
 },[]);

 function select(index:number){
  if(index===selected.current)return;
  setPrevious(selected.current);selected.current=index;setActive(index);animateCopy.current();
 }

 return <div ref={frame} className="about-project-frame about-project-interactive" data-active-category={items[active]?.id}>
  {(items.length?items:[{id:'default',media:section.media}]).map((item,index)=>{
   const asset=referenceImages[item.id];
   return <div key={item.id} className={'about-project-slide'+(index===active?' is-active':'')+(previous!==null&&index===active?' is-entering':'')+(index===previous?' is-leaving':'')} aria-hidden={index!==active}>
    {item.media||!asset?<AboutImage media={item.media??section.media} sizes="(max-width: 1199px) 1400px, 84vw"/>:<img className="about-image" src={'/about-project-reference/'+asset+'.jpg'} alt="" width={referenceSizes[asset][0]} height={referenceSizes[asset][1]}/>}
   </div>;
  })}
  <div ref={copy} className="about-project-copy"><p className="about-label">{section.label}</p><h2>{section.heading}</h2></div>
  <div ref={ghost} className="about-project-copy about-project-ghost" aria-hidden="true"><p className="about-label">{section.label}</p><div className="about-project-ghost-title">{section.heading}</div></div>
  <div className="about-project-labels" role="group" aria-label="Reference project categories">
   {items.map((item,index)=><button key={item.id} type="button" aria-pressed={active===index} onPointerEnter={e=>{if(e.pointerType==='mouse'&&matchMedia('(hover: hover)').matches)select(index)}} onFocus={()=>select(index)} onClick={()=>select(index)}><span>{item.title}</span></button>)}
  </div>
  <span ref={circle} className="about-project-pointer" aria-hidden="true"/>
 </div>;
}
