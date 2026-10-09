"use client";
import {useEffect,useState} from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import {enabledItems,type EditorObject} from '@/schemas/homepage-editor';
import {str} from '@/content/homepage-render';
export function MobileHosting({annual,content}:{annual:boolean;content:EditorObject}){
 const plans=enabledItems(content.plans),features=enabledItems(content.features);
 const [viewport,api]=useEmblaCarousel({align:'start',containScroll:false});const [selected,setSelected]=useState(0);
 useEffect(()=>{if(!api)return;const update=()=>setSelected(api.selectedScrollSnap());update();api.on('select',update).on('reInit',update);return()=>{api.off('select',update).off('reInit',update);};},[api]);
 const move=(index:number)=>api?.scrollTo(index,matchMedia('(prefers-reduced-motion:reduce)').matches);
 return <div className="hp-mobile-hosting" role="region" aria-label="Hosting plans carousel">
 <div ref={viewport} className="hp-mobile-hosting-viewport" tabIndex={0} aria-label="Hosting plans. Use left and right arrow keys to browse." onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(e.key==='ArrowRight'){e.preventDefault();move(Math.min(plans.length-1,selected+1));}if(e.key==='ArrowLeft'){e.preventDefault();move(Math.max(0,selected-1));}}}><div className="hp-mobile-hosting-track">{plans.map((plan,i)=><article className={'hp-mobile-plan '+(plan.featured?'is-featured':'')} key={str(plan.id)} aria-label={plan.title+' plan'}>
 <div className="hp-plan-label">{plan.featured?'Featured plan':'Web hosting'}</div><h3>{str(plan.title)}</h3><p className="hp-plan-positioning">{str(plan.description)}</p>
 <p key={String(annual)} className="hp-mobile-price hp-price-enter">{str(annual?plan.annualPrice:plan.monthlyPrice)}<span>{str(annual?plan.annualUnit:plan.monthlyUnit)}</span></p>
 <p className="hp-plan-disclaimer">{str(plan.renewal)}</p>
 <ul className="hp-plan-main">{features.slice(0,4).map(feature=><li key={str(feature.id)}><strong>{str(enabledItems(plan.values).find(v=>v.featureId===feature.id)?.value)}</strong> {str(feature.title)}</li>)}</ul>
 <a className="hp-button" href={str(plan.ctaHref)} aria-label={str(plan.ctaLabel)+' with '+str(plan.title)+' — contact CODEYEA'}>{str(plan.ctaLabel)} <span aria-hidden="true">→</span></a>
 <details><summary>View all features <span aria-hidden="true">+</span></summary><ul>{features.slice(4).map(feature=><li key={str(feature.id)}>{str(feature.title)}: {str(enabledItems(plan.values).find(v=>v.featureId===feature.id)?.value)}</li>)}</ul><p>All inclusions require approval.</p></details>
 </article>)}</div></div>
 <div className="hp-mobile-hosting-controls"><button aria-label="Previous hosting plan" disabled={selected===0} onClick={()=>move(selected-1)}>←</button><span aria-live="polite">{selected+1} / {plans.length}</span><div className="hp-hosting-pagination">{plans.map((plan,i)=><button key={str(plan.id)} aria-label={'Show '+plan.title+' plan'} aria-current={selected===i?'true':undefined} onClick={()=>move(i)}/>)}</div><button aria-label="Next hosting plan" disabled={selected===plans.length-1} onClick={()=>move(selected+1)}>→</button></div>
 </div>;
}
