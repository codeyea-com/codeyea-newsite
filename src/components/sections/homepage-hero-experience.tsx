'use client';

import { useEffect, useRef, useState } from 'react';
import { adjacentHeroIndex, type HeroServiceSlide } from './homepage-hero-model';
import { buildMorphBand, type BandFace, type Point3D } from './homepage-hero-geometry';

type Props = { slides: HeroServiceSlide[]; ctaLabel: string; ctaHref: string };
type ProjectedPoint = { x: number; y: number; z: number };
type Vector3 = { x: number; y: number; z: number };
const clamp01 = (value: number) => Math.max(0, Math.min(1, value));
const smoothstep = (a: number, b: number, value: number) => { const t = clamp01((value-a)/(b-a)); return t*t*(3-2*t); };
function project(point: Point3D, width: number, height: number, rotation: number, tilt: number, service: number): ProjectedPoint {
  const turn=rotation+Math.sin(service*.67)*.08, cx=Math.cos(turn), sx=Math.sin(turn);
  let x=point.x*cx-point.z*sx, z=point.x*sx+point.z*cx;
  const cy=Math.cos(tilt), sy=Math.sin(tilt), y=point.y*cy-z*sy; z=point.y*sy+z*cy;
  const perspective=3.55/(3.55-z*.62), scale=Math.min(width,height)*.39;
  return {x:width*.5+x*scale*perspective,y:height*.5+y*scale*perspective,z};
}
function normalOf(points:[Point3D,Point3D,Point3D],rotation:number,tilt:number):Vector3 {
  const [a,b,c]=points,ux=b.x-a.x,uy=b.y-a.y,uz=b.z-a.z,vx=c.x-a.x,vy=c.y-a.y,vz=c.z-a.z;
  const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx,length=Math.hypot(nx,ny,nz)||1;
  const turn=rotation,ct=Math.cos(turn),st=Math.sin(turn),cx=Math.cos(tilt),sx=Math.sin(tilt);
  const x=(nx/length)*ct-(nz/length)*st,z1=(nx/length)*st+(nz/length)*ct;
  return {x,y:(ny/length)*cx-z1*sx,z:(ny/length)*sx+z1*cx};
}
function paintBand(ctx:CanvasRenderingContext2D,faces:BandFace[],width:number,height:number,service:number,time:number) {
  ctx.clearRect(0,0,width,height);
  const scale=Math.min(width,height)*.33,cx=width*.5,cy=height*.5;
  const glow=ctx.createRadialGradient(cx,cy,scale*.1,cx,cy,scale*1.35);
  glow.addColorStop(0,'rgba(27,111,191,.24)');glow.addColorStop(.58,'rgba(13,60,111,.10)');glow.addColorStop(1,'rgba(7,27,53,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,width,height);
  const rotation=-.22+Math.sin(time*.00022)*.07,tilt=-.24+Math.sin(time*.00018+service)*.045;
  const rendered=faces.map(face=>{const a=project(face.points[0],width,height,rotation,tilt,service),b=project(face.points[1],width,height,rotation,tilt,service),c=project(face.points[2],width,height,rotation,tilt,service);return {face,a,b,c,depth:(a.z+b.z+c.z)/3,n:normalOf(face.points,rotation,tilt)};}).sort((a,b)=>a.depth-b.depth);
  ctx.save();ctx.shadowColor='rgba(35,130,220,.4)';ctx.shadowBlur=scale*.16;
  for(const item of rendered){const {face,a,b,c,n}=item,light=clamp01(.28+n.x*-.28+n.y*-.42+n.z*.88);let color:string;
    const facet=face.tint*.2;
    if(face.surface==='front')color=`rgb(${Math.round(5+light*28+facet*12)},${Math.round(18+light*66+facet*26)},${Math.round(38+light*105+facet*35)})`;
    else if(face.surface==='back')color=`rgb(${Math.round(3+light*12)},${Math.round(10+light*31)},${Math.round(24+light*55)})`;
    else color=`rgb(${Math.round(4+light*23+facet*8)},${Math.round(13+light*52+facet*16)},${Math.round(30+light*82+facet*24)})`;
    ctx.globalAlpha=face.alpha;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fillStyle=color;ctx.fill();ctx.strokeStyle=`rgba(139,202,246,${.12+light*.16})`;ctx.lineWidth=Math.max(1,width/1100);ctx.stroke();}
  ctx.restore();
}
function paintEmbers(ctx:CanvasRenderingContext2D,width:number,height:number,progress:number,time:number,active:boolean){
  if(!active)return;const scale=Math.min(width,height)*.33,cx=width*.5,cy=height*.5,intensity=Math.sin(progress*Math.PI);if(intensity<=.005)return;
  ctx.save();ctx.translate(cx,cy);ctx.rotate(-.24);ctx.beginPath();ctx.ellipse(0,0,scale*1.18,scale*.97,0,2.34,3.94);ctx.lineWidth=scale*(.012+intensity*.026);ctx.strokeStyle=`rgba(255,${Math.round(70+intensity*15)},${Math.round(54+intensity*5)},${.28+intensity*.68})`;ctx.shadowColor='#ff3d30';ctx.shadowBlur=scale*(.1+intensity*.16);ctx.stroke();ctx.restore();
  const travel=progress<.5?progress*2:(1-progress)*2;
  for(let i=0;i<76;i++){const seed=i*2.399963,along=(i%38)/37,side=i<38?-1:1,theta=(side<0?-2.36:2.36)+(along-.5)*.86,radius=scale*(1.14+travel*(.15+(i%7)*.025)),drift=Math.sin(seed+time*.0011)*scale*.018,x=cx+Math.cos(theta)*radius+drift,y=cy+Math.sin(theta)*radius-travel*scale*(.18+(i%9)*.012),alpha=intensity*(.34+.62*Math.abs(Math.sin(seed+time*.0017)));ctx.beginPath();ctx.arc(x,y,Math.max(1,scale*(.003+(i%5)*.0012)),0,Math.PI*2);ctx.fillStyle=`rgba(255,${Math.round(76+(i%4)*25)},${Math.round(49+(i%3)*20)},${alpha})`;ctx.shadowColor='#ff4938';ctx.shadowBlur=scale*.035;ctx.fill();}
}
function drawScene(canvas:HTMLCanvasElement,from:number,to:number,progress:number,time:number,transition:boolean){const ctx=canvas.getContext('2d');if(!ctx)return;paintBand(ctx,buildMorphBand(from,to,progress),canvas.width,canvas.height,to,time);paintEmbers(ctx,canvas.width,canvas.height,progress,time,transition);}

export function HomepageHeroExperience({slides,ctaLabel,ctaHref}:Props){
  const canvasRef=useRef<HTMLCanvasElement>(null),previousIndex=useRef(0);const [index,setIndex]=useState(0),[playing,setPlaying]=useState(true);
  const active=slides[index]??slides[0]??{id:'digital',title:'Digital experiences',body:'Ideas shaped into thoughtful digital work.'};
  useEffect(()=>{const canvas=canvasRef.current;if(!canvas)return;const media=window.matchMedia('(prefers-reduced-motion: reduce)'),from=previousIndex.current,changed=from!==index,start=performance.now();previousIndex.current=index;let frame=0,disposed=false,visible=false;
    const resize=new ResizeObserver(([entry])=>{const dpr=Math.min(2,window.devicePixelRatio||1);canvas.width=Math.max(1,Math.round(entry.contentRect.width*dpr));canvas.height=Math.max(1,Math.round(entry.contentRect.height*dpr));if(media.matches)drawScene(canvas,index,index,1,0,false);});resize.observe(canvas);
    const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;run();},{threshold:.08});observer.observe(canvas);
    const draw=(time:number)=>{if(disposed)return;const progress=changed?smoothstep(0,1,clamp01((time-start)/1900)):1;drawScene(canvas,from,index,progress,media.matches?0:time,changed&&progress<1);if(!media.matches&&visible&&!document.hidden)frame=requestAnimationFrame(draw);};
    const run=()=>{cancelAnimationFrame(frame);if(!media.matches&&visible&&!document.hidden)frame=requestAnimationFrame(draw);else drawScene(canvas,from,index,changed?0:1,0,false);};
    const update=()=>run();media.addEventListener('change',update);document.addEventListener('visibilitychange',update);
    const interval=window.setInterval(()=>{if(playing&&!media.matches&&visible&&!document.hidden&&slides.length>1)setIndex(current=>adjacentHeroIndex(current,1,slides.length));},8000);run();
    return()=>{disposed=true;cancelAnimationFrame(frame);window.clearInterval(interval);resize.disconnect();observer.disconnect();media.removeEventListener('change',update);document.removeEventListener('visibilitychange',update);};
  },[index,playing,slides.length]);
  const move=(direction:-1|1)=>{if(slides.length>1)setIndex(current=>adjacentHeroIndex(current,direction,slides.length));};
  return <section id="top" className="hp-morph-hero" aria-labelledby="hero-title">
    <div className="hp-morph-grid" aria-hidden="true"/><div className="hp-container hp-morph-layout">
      <div className="hp-morph-copy"><p className="hp-morph-overline"><span/> DIGITAL EXPERIENCES <i>/</i> CODEYEA</p>
        <h1 id="hero-title">Digital experiences<br/><em>built for what’s next.</em></h1>
        <p className="hp-morph-intro">Websites, online stores and smarter workflows, shaped around your business.</p>
        <div className="hp-morph-service" key={active.id}><p className="hp-morph-service-label">{String(index+1).padStart(2,'0')} <span>/</span> {active.title}</p><p className="hp-morph-description">{active.body}</p></div>
        <div className="hp-morph-actions"><a className="hp-morph-primary" href={ctaHref}>{ctaLabel||'Get your free quote'}<span aria-hidden="true">↗</span></a><a className="hp-morph-secondary" href="#services">Explore services <span aria-hidden="true">↓</span></a></div>
        <div className="hp-morph-pager" aria-label="Choose a featured service"><button type="button" onClick={()=>move(-1)} aria-label="Previous service">←</button><span><b>{String(index+1).padStart(2,'0')}</b> <i>/</i> {String(slides.length).padStart(2,'0')}</span><button type="button" onClick={()=>move(1)} aria-label="Next service">→</button><button className="hp-morph-play" type="button" onClick={()=>setPlaying(value=>!value)} aria-label={playing?'Pause service animation':'Play service animation'}>{playing?'Ⅱ':'▶'}</button></div>
      </div><div className="hp-morph-art" aria-label={`${active.title} three-dimensional artwork`}><canvas ref={canvasRef} aria-hidden="true"/><div className="hp-morph-art-caption"><span>MADE FOR YOUR NEXT MOVE</span><b>{active.title}</b></div><span className="hp-morph-coordinate hp-morph-coordinate-top">A BRIGHTER<br/>DIGITAL TOMORROW</span><span className="hp-morph-coordinate hp-morph-coordinate-bottom">IDEAS <i>·</i> DESIGN <i>·</i> BUILD <i>·</i> GROW</span></div>
    </div><div className="hp-morph-bottom"><span>THOUGHTFUL BY DESIGN</span><span>01 — {String(slides.length).padStart(2,'0')} <i>SCROLL TO EXPLORE ↓</i></span></div>
  </section>;
}
