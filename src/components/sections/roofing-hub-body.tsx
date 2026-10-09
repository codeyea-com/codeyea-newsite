import type {IndustryDetailContent, DetailSection} from '@/schemas/industry-detail';
import type {IndustryItem} from '@/schemas/industries-page';
import {AboutImage} from './about-image';
import {RoofingAccordion, RoofingStrip, RoofingReferenceMotion} from './roofing-hub-interactions';
import '@/styles/roofing-hub.css';
import {EditorialMotion} from '../motion/editorial-motion';
import {FixedImageMotion} from '../motion/fixed-image-motion';
import {OrderedPath} from '../motion/ordered-path';
import {industryPageDestination,servicePageDestinationForText} from '@/content/service-destinations';
import '@/styles/approved-motion.css';

function Paragraphs({text}:{text:string}) {return <>{text.split(/\n\s*\n/).filter(Boolean).map((p,i)=><p key={i}>{p}</p>)}</>}
function AnimatedTitle({text}:{text:string}) {return <h2 aria-label={text}>{text.split(' ').map((word,i)=><span className="rf-word" aria-hidden="true" key={i}>{[...word].map((char,j)=><span className="rf-char" key={j}>{char}</span>)}{' '}</span>)}</h2>}

export function RoofingHubBody({content,industryItems,availablePaths,preview,contact}:{content:IndustryDetailContent;industryItems:IndustryItem[];availablePaths:string[];preview:boolean;contact:string}) {
 const sections=content.sections;
 const overview=sections.find(s=>s.type==='overview');
 const resolve=(value:string)=>{if(value==='https://codeyea.com/contact/'||value===contact||value==='#contact')return value;if(!availablePaths.includes(value))return undefined;return preview?value.startsWith('/industries/')&&value!=='/industries/'?'/preview'+value.replace(/\/$/,''):value==='/industries/'?'/preview/industries':value==='/about/'?'/preview/about':value:value};
 const action=(s:DetailSection,cls='rf-text-action motion-text-link')=>{const href=resolve(s.destination);return href?<a className={cls} href={href}>{s.actionLabel}{cls.includes("motion-text-link")&&<span aria-hidden="true">↗</span>}</a>:<button type="button" aria-disabled="true" className={cls}>{s.actionLabel}</button>};
 return <div className="rf-body"><RoofingReferenceMotion/><EditorialMotion scope=".rf-body" groups={[".rf-story-grid",".rf-needs-copy",".rf-needs-media figcaption",".rf-pillars article",".rf-growth .rf-kicker",".rf-growth li h3",".rf-growth li p",".rf-faq-copy",".rf-accordion summary",".rf-industry-grid",".rf-cta-content"]}/><EditorialMotion scope=".rf-services" groups={[".rf-service-heading",".rf-service-paragraphs",".rf-service-lists"]} when="(max-width:1023px), (hover:none), (pointer:coarse)"/><FixedImageMotion selector=".rf-image-break,.rf-needs-media .motion-contained-image"/><OrderedPath selector=".rf-growth"/>{sections.filter(s=>s.enabled).map(s=>{
  if(s.type==='overview')return <section id={s.id} key={s.id} className="rf-overview rf-section" aria-labelledby={s.id+'-title'}>
   {s.media&&<div className="rf-blueprint" aria-hidden="true"><AboutImage media={{...s.media,alt:'',decorative:true}}/></div>}
   <div className="rf-container rf-story-grid"><h2 id={s.id+'-title'}>{s.heading}</h2><div className="rf-story-copy"><Paragraphs text={s.body}/></div></div>
  </section>;
  if(s.type==='strip')return <section id={s.id} key={s.id} className="rf-strip-section" aria-label={s.heading}><RoofingStrip items={s.items} label={content.hero.title}/></section>;
  if(s.type==='needs')return <section id={s.id} key={s.id} className="rf-needs rf-section" aria-labelledby={s.id+'-title'}>
   <div className="rf-container"><div className="rf-needs-grid">
    <figure className="rf-needs-media"><div className="motion-contained-image"><AboutImage media={s.media} sizes="(max-width: 767px) 90vw, 43vw"/></div>{s.actionLabel&&<figcaption>{s.actionLabel}</figcaption>}</figure>
    <div className="rf-needs-copy"><p className="rf-kicker">{s.label}</p><h2 id={s.id+'-title'}>{s.heading}</h2><Paragraphs text={s.body}/></div>
   </div><div className="rf-pillars">{(s.pillarMedia??overview?.media)&&<div className="rf-pillar-blueprint" aria-hidden="true"><AboutImage media={{...(s.pillarMedia??overview!.media!),decorative:true,alt:''}}/></div>}{s.items.map(i=><article key={i.id}><span className="rf-dot" aria-hidden="true"/><h3>{i.title}</h3><p>{i.body}</p></article>)}</div></div>
  </section>;
  if(s.type==='imageBreak')return <section id={s.id} key={s.id} className="rf-image-break" aria-label={s.heading}><div className="rf-image-zoom"><AboutImage media={s.media} sizes="100vw"/></div></section>;
  if(s.type==='services'){const paras=s.body.split(/\n\s*\n/).filter(Boolean),mid=Math.ceil(s.items.length/2);return <section id={s.id} key={s.id} className="rf-services rf-section" aria-label={s.heading}><div className="rf-service-container">
   <div className="rf-service-count"><strong>{s.items.length}</strong><span>{s.actionLabel}</span></div>
   <div className="rf-service-content"><header className="rf-service-heading"><p className="rf-badge">{s.label}</p><AnimatedTitle text={s.heading}/></header>
    <div className="rf-service-paragraphs">{paras.map((p,i)=><p data-rf-paragraph={i} key={i}>{p}</p>)}</div>
    <div className="rf-service-lists">{[s.items.slice(0,mid),s.items.slice(mid)].map((list,col)=><div data-rf-list={col} key={col}><h3>{s.listLabel||'OUR SERVICES'}</h3><ul>{list.map(i=>{const href=resolve(i.destination||servicePageDestinationForText(i.id,i.title)||'');return <li key={i.id}>{href?<a href={href}>{i.title}</a>:<span>{i.title}</span>}</li>})}</ul></div>)}</div>
   </div></div></section>}
  if(s.type==='growth')return <section id={s.id} key={s.id} className="rf-growth rf-section" aria-labelledby={s.id+'-title'}><div className="rf-container"><h2 className="rf-kicker" id={s.id+'-title'}>{s.heading}</h2><ol>{s.items.map((i,n)=><li key={i.id}><span className="rf-stage-number" aria-hidden="true">{String(n+1).padStart(2,'0')}</span><h3>{i.title}</h3><p>{i.body}</p></li>)}</ol></div></section>;
  if(s.type==='faq')return <section id={s.id} key={s.id} className="rf-faq rf-section" aria-labelledby={s.id+'-title'}><div className="rf-container rf-faq-grid"><div className="rf-faq-copy"><h2 id={s.id+'-title'}>{s.heading}</h2><Paragraphs text={s.body}/>{action(s)}</div><RoofingAccordion items={s.items}/></div></section>;
  if(s.type==='related'){const groups=[0,1,2].map(n=>industryItems.slice(n*Math.ceil(industryItems.length/3),(n+1)*Math.ceil(industryItems.length/3)));return <section id={s.id} key={s.id} className="rf-industries rf-section" aria-labelledby={s.id+'-title'}><div className="rf-container rf-industry-grid"><h2 id={s.id+'-title'}>{s.heading}</h2><div className="rf-industry-lists">{groups.map((group,n)=><ul key={n}>{group.map(i=>{const current=i.title===content.hero.title,href=current?undefined:resolve(i.destination||industryPageDestination(i.title)||'');return <li key={i.id}>{href?<a href={href}>{i.title}</a>:<span aria-current={current?'page':undefined}>{i.title}</span>}</li>})}</ul>)}</div></div></section>}
  if(s.type==='cta')return <section id={s.id} key={s.id} className="rf-cta rf-section" aria-labelledby={s.id+'-title'}><div className="rf-cta-media"><AboutImage media={s.media} sizes="100vw"/></div><div className="rf-container rf-cta-content"><h2 id={s.id+'-title'}>{s.heading}</h2>{action(s,'rf-corporate-button')}</div></section>;
  return null;
 })}</div>;
}
