import {EditorialMotion} from '../motion/editorial-motion';
import type {IndustriesContent} from '@/schemas/industries-page';
import type {HomepageContent,EditorObject} from '@/schemas/homepage-editor';
import {resolveHomepage} from '@/content/homepage-defaults';
import {industryDestination} from '@/content/industry-destinations';
import {industryPageDestination} from '@/content/service-destinations';
import {HomepageHeader} from './homepage-header';
import {HomepageFooter} from './homepage-footer';
import {SiteUtility} from './site-utility';
import {InternalPageHero} from './internal-page-hero';
import {AboutImage} from './about-image';
import {IndustriesMotion} from './industries-motion';
import '@/styles/homepage-final.css';
import '@/styles/homepage-editorial.css';
import '@/styles/about.css';
import '@/styles/industries.css';
import '@/styles/approved-motion.css';
import '@fontsource/josefin-sans/latin-200.css';
import '@fontsource/josefin-sans/latin-300.css';
import '@fontsource/josefin-sans/latin-700.css';

function links(value:unknown,preview:boolean):unknown{
 if(Array.isArray(value))return value.map(v=>links(v,preview));
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,(k==='href'||k==='ctaHref')&&typeof v==='string'&&v.startsWith('#')?v==='#industries'?(preview?'/preview/industries':'/industries/'):v==='#about'?(preview?'/preview/about':'/about/'):v==='#contact'?v:(preview?'/preview':'/')+v:links(v,preview)]));
 return value;
}
export function IndustriesPage({content,shared,preview=false,availablePaths=[]}:{content:IndustriesContent;shared?:HomepageContent;preview?:boolean;availablePaths?:string[]}){
 const home=resolveHomepage(shared);
 const contact=String(home.footer.ctaHref||'#contact');
 const publishedPaths=new Set(availablePaths);
 return <div className="public-surface hp about-page industries-page">
  <a className="hp-skip" href="#main">Skip to content</a><SiteUtility/>
  <HomepageHeader light content={links(home.header,preview) as EditorObject} activeHref={preview?'/preview/industries':'/industries/'} homeHref={preview?'/preview':'/'}/>
  <main id="main">
   <section className="about-hero"><InternalPageHero title={content.hero.title} media={content.hero.media}/></section>
   {content.introduction.enabled&&<section className="industries-introduction" id={content.introduction.id}>
    <div className="industries-introduction-heading">
     <svg className="industries-blueprint" viewBox="0 0 600 650" fill="none" aria-hidden="true" focusable="false"><g stroke="currentColor" strokeWidth="1.4"><path d="M-40 490 260 315 620 515M-40 525 260 350 620 550M-40 560 260 385 620 585M-40 595 260 420 620 620M60 420V220l140-80 140 80v200M60 220l140 80 140-80M200 300v200M90 245v130l80 45V290M230 290v130l80-45V245M370 355V155l80-45 100 58v205M370 155l100 58 80-45M470 213v220M390 185v115l58 34V220M240 120V65l80-45 80 45v55l-80 45zM240 65l80 45 80-45M320 110v55M30 470l70 40 65-35M350 465l65 38 70-40M185 555l85 48 90-50"/><path d="M-20 620 500 320M35 650 555 350M130 650 600 375M-20 385 500 685M-20 325 600 685" strokeDasharray="5 7"/><circle cx="100" cy="510" r="10"/><circle cx="270" cy="603" r="10"/><circle cx="415" cy="503" r="10"/></g></svg>
     <p className="industry-label">{content.introduction.label}</p><h2>{content.introduction.heading}</h2>
    </div><div className="industries-introduction-copy">{content.introduction.paragraphs.map(p=><p key={p.id}>{p.body}</p>)}</div>
   </section>}
   <IndustriesMotion/><EditorialMotion scope=".industries-page" groups={[".industries-introduction",".industries-final"]}/>
   <div className="industry-sections">{content.items.filter(i=>i.enabled).sort((a,b)=>a.position-b.position).map((item,index)=>{
    // Industry detail routes are implemented for every registered industry and
    // have approved fallback content. Don't hide their links just because a
    // matching CMS publication record is absent.
    const layout=index%4+1,href=industryDestination(item.destination,publishedPaths)||industryPageDestination(item.heading)||industryPageDestination(item.title);
    return <section className={'industry-section industry-layout-'+layout} key={item.id} id={item.id} data-layout={layout}>
     <div className="industry-heading"><p className="industry-label">{item.label}</p><h2 className="industry-name">{href?<a href={href}>{item.heading}</a>:item.heading}</h2></div>
     <div className={'industry-images '+((layout===1||layout===3)?'industry-split':'industry-large')}>
      <figure><AboutImage media={item.media} sizes="(max-width:1199px) 100vw, 54vw"/></figure>
     </div>
     <div className="industry-copy"><p className="industry-summary">{item.body}</p>
      {layout===1?<div className="industry-highlights">{item.highlights.slice(0,3).map(h=><details key={h.id} name={item.id+'-highlights'}><summary>{h.title}<span aria-hidden="true"/></summary><div className="industry-highlight-body"><p>{h.body}</p></div></details>)}</div>:layout===3?<ul className="industry-capabilities">{item.highlights.map(h=><li key={h.id}><strong>{h.title}</strong>{h.body&&<span>{h.body}</span>}</li>)}</ul>:null}
      {href?<a className="industry-action motion-text-link" href={href}>{item.ctaLabel}<span aria-hidden="true">↗</span></a>:<button className="industry-action motion-text-link" type="button" aria-disabled="true">{item.ctaLabel}<span aria-hidden="true">↗</span></button>}
     </div>
    </section>;
   })}</div>
   {content.cta.enabled&&<section className="industries-final" id={content.cta.id}><p className="industry-label">{content.cta.label}</p><div className="industries-final-columns"><h2>{content.cta.heading}</h2><div><p>{content.cta.body}</p><a className="hp-button" href={contact}>{content.cta.actionLabel}</a></div></div></section>}
  </main><HomepageFooter content={links(home.footer,preview) as EditorObject}/>
 </div>;
}
