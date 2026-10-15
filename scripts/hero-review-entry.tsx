import React from 'react';
import {createRoot} from 'react-dom/client';
import '../src/app/globals.css';
import '../src/styles/surface.css';
import '@fontsource/josefin-sans/latin-400.css';
import '@fontsource/josefin-sans/latin-500.css';
import '@fontsource/josefin-sans/latin-600.css';
import '../src/styles/tokens.css';
import '../src/styles/homepage.css';
import '../src/styles/homepage-interactions.css';
import '../src/styles/homepage-motion.css';
import '../src/styles/homepage-refinements.css';
import '../src/styles/homepage-mobile.css';
import {IndustryDetailPage} from '../src/components/sections/industry-detail-page';
import {AboutPage} from '../src/components/sections/about-page';
import {ServicesPage} from '../src/components/sections/services-page';
import {IndustriesPage} from '../src/components/sections/industries-page';
import {ArabicSurface} from '../src/components/sections/arabic-surface';
import type {Snapshot} from '../src/schemas/content';

const data = JSON.parse(document.getElementById('review-data')!.textContent!) as {snapshot:Snapshot; locale:string};
const s = data.snapshot;
const page = s.industryDetail ? <IndustryDetailPage content={s.industryDetail}/> : s.about ? <AboutPage content={s.about}/> : s.servicesPage ? <ServicesPage content={s.servicesPage}/> : s.industriesPage ? <IndustriesPage content={s.industriesPage}/> : null;
createRoot(document.getElementById('root')!).render(data.locale === 'ar' ? <ArabicSurface>{page}</ArabicSurface> : page);
// Review-only deep links and language control, after React mounts the real page.
const reviewRoot=document.getElementById('root')!;
const mounted=new MutationObserver(()=>{
 if(!reviewRoot.querySelector('.hp-header'))return;
 mounted.disconnect();
 const counterpart=location.pathname.replace(/-(ar|en)\.html$/,data.locale==='ar'?'-en.html':'-ar.html');
 reviewRoot.querySelectorAll('.cy-language-slot').forEach(slot=>{
  const link=document.createElement('a');link.href=location.origin+counterpart;link.lang=data.locale==='ar'?'en':'ar';link.textContent=data.locale==='ar'?'English':'العربية';slot.replaceChildren(link);
 });
 if(location.hash)void document.fonts.ready.then(()=>requestAnimationFrame(()=>document.getElementById(location.hash.slice(1))?.scrollIntoView()));
});
mounted.observe(reviewRoot,{childList:true});
