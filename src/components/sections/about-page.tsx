import {FixedImageMotion} from '../motion/fixed-image-motion';
import '@/styles/approved-motion.css';
import {EditorialMotion} from "../motion/editorial-motion";
import type { AboutContent } from "@/schemas/about";
import type { HomepageContent, EditorObject } from "@/schemas/homepage-editor";
import { resolveHomepage } from "@/content/homepage-defaults";
import { HomepageHeader } from "./homepage-header";
import { HomepageFooter } from "./homepage-footer";
import { SiteUtility } from "./site-utility";
import { InternalPageHero } from "./internal-page-hero";
import { AboutImage } from "./about-image";
import { AboutProjectField } from "./about-project-field";
import { AboutShowcase } from "./about-showcase";
import "@/styles/homepage-final.css";
import "@/styles/homepage-editorial.css";
import "@/styles/about.css";
import "@fontsource/josefin-sans/latin-200.css";
import "@fontsource/josefin-sans/latin-300.css";
import "@fontsource/josefin-sans/latin-700.css";

function mapSharedLinks(value: unknown, preview: boolean): unknown {
 if(Array.isArray(value)) return value.map(v=>mapSharedLinks(v,preview));
 if(value&&typeof value==="object") return Object.fromEntries(Object.entries(value).map(([key,v])=>[key,
 (key==="href"||key==="ctaHref")&&typeof v==="string"&&v.startsWith("#")
 ? v==="#about"?(preview?"/preview/about":"/about/"):v==="#contact"?v:(preview?"/preview":"/")+v
 :mapSharedLinks(v,preview)]));
 return value;
}
function Copy({text}:{text:string}){return <>{text.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</>}
export function AboutPage({content,shared,preview=false}:{content:AboutContent;shared?:HomepageContent;preview?:boolean}){
 const home=resolveHomepage(shared),hero=content.sections.find(s=>s.type==="hero")!;
 return <div className="public-surface hp about-page">
 <a className="hp-skip" href="#main">Skip to content</a><SiteUtility/>
 <HomepageHeader light content={mapSharedLinks(home.header,preview) as EditorObject} activeHref={preview?"/preview/about":"/about/"} homeHref={preview?"/preview":"/"}/>
 <main id="main" className="about-static"><EditorialMotion scope=".about-static" groups={[".about-intro-columns",".about-experience-top > div",".about-experience-bottom > div",".about-awards-layout",".about-principles > .about-reference-container"] }/><FixedImageMotion selector=".about-experience-top .motion-contained-image"/>
 {(!hero.enabled||hero.visibility!=="all")&&<h1 className="about-fallback-title">{hero.heading}</h1>}
 {content.sections.filter(s=>s.enabled).sort((a,b)=>a.position-b.position).map(s=>{
 const items=s.items.filter(i=>i.enabled).sort((a,b)=>a.position-b.position);
 return <section key={s.id} id={s.id} className={"about-section about-"+s.type+" about-visible-"+s.visibility}>
 {s.type==="hero"?<InternalPageHero title={s.heading} media={s.media} semanticTitle={hero.visibility==="all"} titleBreakBefore={s.heading==="Digital Innovation Agency"?"Agency":undefined}/>:
 s.type==="who"?<div className="about-reference-container about-intro-columns"><div>{content.schemaVersion===1&&<><Copy text={s.positioning??""}/><AboutImage media={s.media}/></>}<p className="about-label">{s.label}</p><h2>{s.heading}</h2></div><div className="about-intro-body"><Copy text={s.body}/></div></div>:
 s.type==="experience"?<div className="about-reference-container"><div className="about-experience-top"><figure><div className="motion-contained-image"><AboutImage media={s.media}/></div><figcaption>{s.ctaLabel}</figcaption></figure><div><p className="about-label">{s.label}</p><h2>{s.heading}</h2><Copy text={s.body}/></div></div><div className="about-experience-bottom">{items.map(i=><div key={i.id}><Copy text={i.body}/></div>)}</div></div>:
 s.type==="projectReference"?<AboutProjectField section={s}/>:
 s.type==="principles"?<div className="about-reference-container"><h2>{s.heading}</h2><div className="about-principles-grid">{items.map(i=><article key={i.id} tabIndex={0} aria-labelledby={i.id+"-title"}><h3 id={i.id+"-title"}>{i.title}</h3><Copy text={i.body}/></article>)}</div></div>:
 s.type==="showcase"?<AboutShowcase section={s}/>:
 s.type==="awards"?<div className="about-reference-container about-awards-layout"><header><p className="about-label">{s.label}</p><h2>{s.heading}</h2></header>{items.map(i=><ul key={i.id}><li><h3>{i.title}</h3></li>{i.body.split('\n').filter(Boolean).map((body,n)=><li key={n}>{body}</li>)}</ul>)}</div>:
 <div className="about-reference-container"><h2>{s.heading}</h2><Copy text={s.body}/></div>}
 </section>})}
 </main><HomepageFooter content={mapSharedLinks(home.footer,preview) as EditorObject}/>
 </div>;
}
