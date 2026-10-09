"use client";
import {usePathname} from "next/navigation";
import {IndustryIcon,useApprovedNavigation} from "./approved-navigation";
import {useEffect,useId,useRef,useState,type CSSProperties} from "react";
import "@/styles/homepage-header-final.css";
import {enabledItems,type EditorObject} from "@/schemas/homepage-editor";
import {str} from "@/content/homepage-render";
function menuGroups(item:EditorObject,children:EditorObject[]){
 const services=str(item.href).endsWith('#services'),industries=str(item.href).endsWith('#industries');
 if(!services&&!industries)return [{label:str(item.title),items:children}];
 const primary=services?/development|commerce|automation|hosting|infrastructure/i:/construction|real estate|roofing|oil|gas/i;
 return [
  {label:services?'Build & connect':'Built environment',items:children.filter(child=>primary.test(str(child.title)))},
  {label:services?'Grow & support':'Business & specialist sectors',items:children.filter(child=>!primary.test(str(child.title)))}
 ].filter(group=>group.items.length);
}
function DesktopDropdown({item,children,open,setOpen}:{item:EditorObject;children:EditorObject[];open:boolean;setOpen:(value:boolean)=>void}){
 const industries=str(item.title)==='Industries'||str(item.href).endsWith('#industries');
 const root=useRef<HTMLSpanElement>(null);
 const summary=useRef<HTMLElement>(null);
 const timer=useRef<ReturnType<typeof setTimeout>|null>(null);
 const hovered=useRef(false);
 const restoringFocus=useRef(false);
 const panelId=useId();
 const clearClose=()=>{if(timer.current!==null){clearTimeout(timer.current);timer.current=null;}};
 const close=()=>{clearClose();setOpen(false);};
 useEffect(()=>{
  const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node)){clearClose();setOpen(false);}};
  document.addEventListener('pointerdown',outside);
  return()=>{clearClose();document.removeEventListener('pointerdown',outside);};
 },[]);
 return <span ref={root} className="hp-nav-item"
  onPointerEnter={event=>{if(event.pointerType==='mouse'&&matchMedia('(hover:hover) and (pointer:fine)').matches){hovered.current=true;clearClose();setOpen(true);}}}
  onPointerLeave={()=>{hovered.current=false;clearClose();timer.current=setTimeout(()=>{if(!(root.current?.contains(document.activeElement)&&document.activeElement?.matches(':focus-visible')))setOpen(false);},180);}}
  onFocus={event=>{clearClose();if(!restoringFocus.current&&event.target.matches(':focus-visible'))setOpen(true);}}
  onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node)&&!hovered.current)close();}}
  onKeyDown={event=>{if(event.key==='ArrowDown'&&!(event.target as HTMLElement).closest('.hp-dropdown')){event.preventDefault();setOpen(true);requestAnimationFrame(()=>root.current?.querySelector<HTMLAnchorElement>('.hp-dropdown a')?.focus());}if(event.key==='Escape'){event.preventDefault();event.stopPropagation();close();restoringFocus.current=true;summary.current?.focus();restoringFocus.current=false;}}}
 >
  <a href={str(item.href)} onClick={close}>{str(item.title)}</a>
  <details open={open}>
   <summary ref={summary} aria-label={'Open '+str(item.title)+' menu'} aria-expanded={open} aria-controls={panelId}
    onClick={event=>{event.preventDefault();clearClose();setOpen(!open);}}>
    <svg className="hp-chevron" viewBox="0 0 12 8" width="12" height="8" fill="none" aria-hidden="true"><path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.2"/></svg>
   </summary>
   <div id={panelId} className="hp-dropdown hp-mega-panel">
    <div className="hp-mega-intro"><span className="hp-mega-eyebrow">Explore</span><strong>{str(item.title)}</strong><a href={str(item.href)} onClick={close}>Explore {str(item.title)} <span aria-hidden="true">↗</span></a></div>
    {menuGroups(item,children).map((group,index)=><div className="hp-mega-group" key={group.label} style={{'--mega-order':index} as CSSProperties}><span className="hp-mega-eyebrow">{group.label}</span><div>{group.items.map((child,childIndex)=><a className={industries?'hp-mega-industry-link':undefined} key={str(child.id)} href={str(child.href)} onClick={close} style={{'--mega-link-order':childIndex} as CSSProperties}>{industries&&<IndustryIcon title={str(child.title)}/>}<span>{str(child.title)}{str(child.body)&&<small>{str(child.body)}</small>}</span></a>)}</div></div>)}
   </div>
  </details>
 </span>;
}
function Navigation({content,activeHref}:{content:EditorObject;activeHref?:string}){
 const [openId,setOpenId]=useState<string|null>(null);
 const items=enabledItems(content.items);
 return <>{items.filter(item=>!item.parentId).map(item=>{
  const children=items.filter(child=>child.parentId===item.id);
  return children.length?<DesktopDropdown key={str(item.id)} item={item} children={children} open={openId===str(item.id)} setOpen={value=>setOpenId(current=>value?str(item.id):current===str(item.id)?null:current)}/>:<span key={str(item.id)} className="hp-nav-item"><a href={str(item.href)} aria-current={activeHref===item.href?'page':undefined}>{str(item.title)}</a></span>;
 })}</>;
}
export function HomepageHeader({content,activeHref,homeHref='#top',light=false}:{content:EditorObject;activeHref?:string;homeHref?:string;light?:boolean}){const preview=(usePathname()??"").startsWith("/preview");const approved=useApprovedNavigation(content);return (<header className={"hp-header"+(light?" is-scrolled":"")}>
        <div className="hp-container hp-header-row">
          <a href={homeHref} aria-label="CODEYEA home" className="hp-logo">
            <img
              className="hp-logo-dark" src="/brand/logo-dark.png"
              width="205"
              height="47"
              alt="CODEYEA"
            />
            <img className="hp-logo-light" src="/brand/logo-light.png" width="205" height="47" alt="" />
          </a>
          <nav className="hp-desktop-nav" aria-label="Main navigation">
            {preview?approved.navigation:<Navigation content={content} activeHref={activeHref}/>}
          </nav>
          <a className="hp-button hp-header-quote" href="#contact">
            Get Your Free Quote
          </a>
          <MobileMenu content={preview?approved.content:content} activeHref={activeHref}/>
        </div>
        {preview&&approved.panels}
      </header>);}

function MobileMenu({content,activeHref}:{content:EditorObject;activeHref?:string}){
 const items=enabledItems(content.items);
 const dialog=useRef<HTMLDialogElement>(null);const trigger=useRef<HTMLButtonElement>(null);const previousOverflow=useRef('');
 const close=()=>{dialog.current?.close();document.body.style.overflow=previousOverflow.current;trigger.current?.focus();};
 useEffect(()=>{const query=matchMedia('(min-width:1200px)');const resize=()=>{if(query.matches&&dialog.current?.open)close();};query.addEventListener('change',resize);return()=>{query.removeEventListener('change',resize);if(dialog.current?.open)document.body.style.overflow=previousOverflow.current;};},[]);
 return <><button ref={trigger} className="hp-mobile-trigger" aria-haspopup="dialog" aria-controls="mobile-navigation" onClick={()=>{previousOverflow.current=document.body.style.overflow;document.body.style.overflow='hidden';dialog.current?.showModal();}}>Menu <span aria-hidden="true">☰</span></button>
 <dialog ref={dialog} id="mobile-navigation" className="hp-mobile-panel" aria-label="CODEYEA navigation" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left)close();}}} onKeyDown={e=>{if(e.key!=='Tab')return;const nodes=[...e.currentTarget.querySelectorAll<HTMLElement>('a[href],button,summary')].filter(n=>n.getClientRects().length);const first=nodes[0],last=nodes[nodes.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}}}>
 <div className="hp-mobile-panel-top"><img src="/brand/logo-light.png" width="220" height="50" alt="CODEYEA — Creative Design Agency"/><button type="button" aria-label="Close navigation" onClick={close}>×</button></div>
 <nav aria-label="Mobile navigation" onClick={e=>{if((e.target as HTMLElement).closest('a'))close();}}>{items.filter(i=>!i.parentId).map(item=>items.some(child=>child.parentId===item.id)?<details key={str(item.id)}><summary>{str(item.title)}<svg className="hp-chevron" viewBox="0 0 12 8" width="12" height="8" fill="none" aria-hidden="true"><path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.2"/></svg></summary><div className="hp-mobile-submenu"><a href={str(item.href)}>Explore {str(item.title)}</a>{items.filter(child=>child.parentId===item.id).map(child=><a key={str(child.id)} href={str(child.href)}>{str(child.title)}</a>)}</div></details>:<a key={str(item.id)} href={str(item.href)} aria-current={activeHref===item.href?'page':undefined}>{str(item.title)}</a>)}<a href="#contact">Contact</a></nav>
 <div className="hp-mobile-actions">{enabledItems(content.actions).map(item=><a key={str(item.id)} href={str(item.href)}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={item.id==='mobile-action-0'?'M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4z':item.id==='mobile-action-1'?'M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-3a8 8 0 0 1 16 0v3z':'M13 4H4v16h16v-9M12 12 22 2M15 2h7v7'} stroke="currentColor" strokeWidth="1.5"/></svg>{str(item.title)}</a>)}</div>
 </dialog></>;
}
