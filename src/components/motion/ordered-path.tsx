'use client';
import {useEffect} from 'react';
import {gsap} from 'gsap';
import {motionQueries} from './approved-patterns';

/** Decorative path follows the existing responsive positions; it occupies no layout space. */
export function OrderedPath({selector}:{selector:string}){
 useEffect(()=>{
  const root=document.querySelector<HTMLElement>(selector);if(!root)return;
  const list=root.querySelector<HTMLElement>('ol')!,numbers=[...root.querySelectorAll<HTMLElement>('.rf-stage-number')];
  const reduced=matchMedia(motionQueries.reduced);let timeline:gsap.core.Timeline|undefined,complete=false,started=false,inView=false;
  const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('aria-hidden','true');svg.classList.add('motion-ordered-path');list.prepend(svg);
  const draw=()=>{
   const wasComplete=complete||reduced.matches;timeline?.kill();svg.replaceChildren();
   const box=list.getBoundingClientRect();svg.setAttribute('viewBox',`0 0 ${box.width} ${box.height}`);
   const rects=numbers.map(n=>{const r=n.getBoundingClientRect();return {x:r.left-box.left,y:r.top-box.top,w:Math.min(64,r.width),h:r.height}});
   const paths:SVGPathElement[]=[];
   rects.slice(0,-1).forEach((a,i)=>{const b=rects[i+1],path=document.createElementNS(svg.namespaceURI,'path') as SVGPathElement;
    const sameRow=Math.abs(a.y-b.y)<4;
    const rowReturn=a.x>b.x+4;
    path.setAttribute('d',sameRow?`M ${a.x+a.w+12} ${a.y+a.h/2} H ${b.x-12}`:rowReturn?`M ${a.x+a.w+12} ${a.y+a.h/2} H ${box.width+12} V ${b.y-17} H -12 V ${b.y+b.h/2} H ${b.x-8}`:`M ${a.x-8} ${a.y+a.h/2} H -12 V ${b.y+b.h/2} H ${b.x-8}`);
    path.setAttribute('fill','none');path.setAttribute('stroke','var(--brand-primary)');path.setAttribute('stroke-width','1');svg.append(path);paths.push(path);
   });
   numbers.forEach(n=>n.classList.toggle('motion-step-active',wasComplete));
   paths.forEach(p=>{const length=p.getTotalLength();p.style.strokeDasharray=String(length);p.style.strokeDashoffset=wasComplete?'0':String(length)});
   if(wasComplete){complete=true;root.dataset.sequenceComplete='true';return}
   timeline=gsap.timeline({paused:true,onComplete:()=>{complete=true;root.dataset.sequenceComplete='true'}});
   timeline.call(()=>numbers[0]?.classList.add('motion-step-active'));
   paths.forEach((path,i)=>{timeline!.to(path,{strokeDashoffset:0,duration:.65,ease:'power4.out'}).call(()=>numbers[i+1].classList.add('motion-step-active'))});
   if(started&&inView&&!document.hidden)timeline.play();
  };
  root.classList.add('motion-path-ready');draw();
  const observer=new IntersectionObserver(([entry])=>{inView=entry.isIntersecting;if(inView){started=true;if(!document.hidden)timeline?.play()}else timeline?.pause()},{threshold:.15});observer.observe(root);
  const resize=new ResizeObserver(draw);resize.observe(list);
  const visibility=()=>{if(document.hidden)timeline?.pause();else if(started&&inView)timeline?.play()};
  reduced.addEventListener('change',draw);document.addEventListener('visibilitychange',visibility);
  return()=>{timeline?.kill();observer.disconnect();resize.disconnect();reduced.removeEventListener('change',draw);document.removeEventListener('visibilitychange',visibility);svg.remove();root.classList.remove('motion-path-ready');delete root.dataset.sequenceComplete;numbers.forEach(n=>n.classList.remove('motion-step-active'))};
 },[selector]);return null;
}
