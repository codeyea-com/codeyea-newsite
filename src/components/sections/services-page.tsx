import type {ServicesContent,ServiceItem} from '@/schemas/services-page';
import type {HomepageContent,EditorObject} from '@/schemas/homepage-editor';
import {resolveHomepage,iconKeys} from '@/content/homepage-defaults';
import {servicePageDestination} from '@/content/service-destinations';
import {HomepageHeader} from './homepage-header';
import {HomepageFooter} from './homepage-footer';
import {SiteUtility} from './site-utility';
import {InternalPageHero} from './internal-page-hero';
import {AboutImage} from './about-image';
import {ServiceWords} from './homepage-service-words';
import {ServicesAccordion,ServicesMotion} from './services-interactions';
import '@/styles/homepage-final.css';import '@/styles/homepage-editorial.css';import '@/styles/about.css';import '@/styles/services.css';
import '@fontsource/josefin-sans/latin-200.css';import '@fontsource/josefin-sans/latin-300.css';import '@fontsource/josefin-sans/latin-700.css';
function sharedLinks(value:unknown,preview:boolean):unknown{if(Array.isArray(value))return value.map(v=>sharedLinks(v,preview));if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,(k==='href'||k==='ctaHref')&&typeof v==='string'&&v.startsWith('#')?v==='#about'?(preview?'/preview/about':'/about/'):v==='#industries'?(preview?'/preview/industries':'/industries/'):v==='#contact'?v:(preview?'/preview':'/')+v:sharedLinks(v,preview)]));return value;}
function Copy({text}:{text:string}){return <>{text.split(/\n\s*\n/).filter(Boolean).map((p,n)=><p key={n}>{p}</p>)}</>}
function List({item}:{item:ServiceItem}){return item.list.length?<ul>{item.list.map(l=><li key={l.id}>{l.text}</li>)}</ul>:null}
function ServiceIcon({ index }: { index: number }) {
  const paths = [
    "M3 4h18v14H3zM3 8h18M9 11l-3 2 3 2m6-4 3 2-3 2M8 22h8m-4-4v4",
    "M3 3h2l3 13h11l2-10H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2m9 0a1 1 0 1 0 0-2 1 1 0 0 0 0 2M10 10h7",
    "M7 7h10v10H7zM10 10h4v4h-4zM9 3v4m6-4v4M9 17v4m6-4v4M3 9h4m-4 6h4m10-6h4m-4 6h4",
    "M3 3h18v7H3zm0 11h18v7H3zM6 6.5h.01M6 17.5h.01M11 6.5h7M11 17.5h7",
    "M3 3v18h18M6 16l5-5 4 3 6-8m-6 0h6v6",
    "M4 20l1-6L16 3l5 5-11 11-6 1zm8-13 5 5M5 14l5 5M4 20l4-4",
    "M4 14v-3a8 8 0 0 1 16 0v3M4 11H2v7h4v-7H4m16 0h2v7h-4v-7h2m0 7v3h-7",
    "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M16 8l-2 6-6 2 2-6 6-2z",
  ];
  return (
    <svg
      className="hp-service-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[index] ?? paths[0]} />
    </svg>
  );
}
export function ServicesPage({content,shared,preview=false,availablePaths=[]}:{content:ServicesContent;shared?:HomepageContent;preview?:boolean;availablePaths?:string[]}){
 const home=resolveHomepage(shared),[intro,priority,strategy,complete,process,growth,faq,cta]=content.sections;
 const active=(items:ServiceItem[])=>items.filter(i=>i.enabled!==false);
 const target=(path:string|null,id?:string)=>{const destination=path|| (id?servicePageDestination(id):undefined);return destination&&(destination==='https://codeyea.com/contact/'||availablePaths.includes(destination))?destination:undefined};
 const Link=({item}:{item:{id:string;destination:string|null;actionLabel:string}})=>{const href=target(item.destination,item.id);return href?<a className="rp-link" href={href}>{item.actionLabel}<span aria-hidden="true">↗</span></a>:null};
 return <div className="public-surface hp about-page services-page"><a className="hp-skip" href="#main">Skip to content</a><SiteUtility/><HomepageHeader light content={sharedLinks(home.header,preview) as EditorObject} activeHref={preview?'/preview#services':'/#services'} homeHref={preview?'/preview':'/'}/><main id="main">
 <section className="about-hero"><InternalPageHero title={content.hero.title} media={content.hero.media}/></section>
 <section className="rp-intro rp-container" id={intro.id}><div className="rp-intro-left" data-sv-reveal="intro"><span className="rp-pill">{intro.label}</span><h2>{intro.heading}</h2><p className="rp-small">{intro.body}</p><div className="rp-indicators">{active(intro.outcomes).map(i=><div key={i.id}><strong>{i.label}</strong><p>{i.title}</p><small>{i.body}</small></div>)}</div></div><div data-sv-reveal="accordion"><ServicesAccordion items={active(intro.items)}/></div></section>
 <section id={priority.id}><header className="rp-container rp-service-heading" data-sv-reveal="row"><div><span className="rp-pill rp-pill-gray">{priority.label}</span><h2>{priority.heading}</h2></div><p>{priority.body}</p></header><div className="rp-cards" data-sv-reveal="cards">{active(priority.items).map((i,n)=><article key={i.id} tabIndex={0} aria-labelledby={i.id+'-title'}><div className="rp-card-perspective"><div className="rp-card-surface"><div className="rp-card-frame"><figure><AboutImage media={i.media} sizes="(max-width:480px) 100vw,(max-width:800px) 50vw,25vw"/></figure></div><div className="rp-card-content"><div className="rp-card-copy"><div className="rp-card-icon"><ServiceIcon index={[2,4,0,1][n]}/></div><span className="rp-card-eyebrow">{i.label}</span><h3 id={i.id+'-title'}>{i.title}</h3><div className="rp-card-detail"><p>{i.body}</p><Link item={i}/></div></div></div></div></div></article>)}</div></section>
 <section className="rp-container rp-strategy" id={strategy.id}><figure><AboutImage media={strategy.media} sizes="(max-width:800px) 100vw,45vw"/><svg className="rp-geometry" viewBox="0 0 420 420" aria-hidden="true"><path d="M105 260 210 70 315 260Z"/><rect x="70" y="180" width="165" height="165"/><circle cx="285" cy="275" r="82"/></svg></figure><div>{active(strategy.items).map((i,n)=><article key={i.id} className={n?'rp-experiences':''} data-sv-reveal="strategy"><span className="rp-caption">{i.label}</span><h2>{i.title}</h2><Copy text={i.body}/><List item={i}/><Link item={i}/></article>)}</div></section>
 <section id={complete.id} className="sv-home-services rp-dark"><div className="rp-container rp-dark-layout"><header data-sv-reveal="row"><span className="rp-pill rp-pill-yellow">{complete.label}</span><h2>{complete.heading}</h2></header><div><p className="rp-dark-intro" data-sv-reveal="text">{complete.body}</p><div id="services" className="hp-services" aria-label="Our eight services">{active(complete.items).map((i,n)=><article key={i.id} id={i.id} data-motion-enter style={{transitionDelay:(n%4)*70+'ms'}}><ServiceIcon index={iconKeys.indexOf(i.label)}/><h3><ServiceWords text={i.title}/></h3><p><ServiceWords text={i.body} offset={i.title.split(/\s+/).length}/></p>{target(i.destination,i.id)&&<a className="hp-service-link" href={target(i.destination,i.id)} aria-label={'Discuss '+i.title}>{i.actionLabel} <span aria-hidden="true">→</span></a>}</article>)}</div></div></div></section>
 <section className="rp-process" id={process.id} aria-label={process.heading}>{active(process.items).map((i,n)=><article key={i.id} tabIndex={0} data-sv-reveal="intro"><span className="rp-process-number" aria-hidden="true">{n+1}</span><p className="rp-step">STEP {n+1}</p><h2>{i.label}</h2><p className="rp-process-lead">{i.title}</p><Copy text={i.body}/><List item={i}/></article>)}</section>
 <section className="rp-container rp-growth" id={growth.id}><header className="rp-work-header" data-sv-reveal="text"><h2>{growth.heading}</h2><p>{growth.body}</p></header><div className="rp-work-label"><span aria-hidden="true"/><span>{growth.label}</span></div><div className="rp-work-rows">{active(growth.items).map(i=><article key={i.id} data-sv-reveal="text"><h3>{i.label}</h3><div><h4>{i.title}</h4><p>{i.body}</p></div></article>)}</div></section>
 <section className="rp-container rp-faq" id={faq.id}><h2 data-sv-reveal="intro">{faq.heading}</h2><div data-sv-reveal="accordion"><ServicesAccordion items={active(faq.items)}/></div></section>
 <section className="rp-cta" id={cta.id}><AboutImage media={cta.media} sizes="100vw"/><div className="rp-container rp-cta-inner" data-sv-reveal="text"><div><p className="rp-step">{cta.label}</p><h2>{cta.heading}</h2><p>{cta.body}</p></div>{target(cta.destination)&&<a className="hp-button" href={target(cta.destination)}>{cta.actionLabel}<span aria-hidden="true">↗</span></a>}</div></section>
 </main><HomepageFooter content={sharedLinks(home.footer,preview) as EditorObject}/><ServicesMotion/></div>;
}
