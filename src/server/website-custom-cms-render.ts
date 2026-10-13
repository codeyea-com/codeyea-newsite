import { websiteCustomCms } from '../content/website-custom-cms';

const escape = (value: string) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
export function renderWebsiteCustomCms(html: string, slug: string, locale: string, contactHref: string) {
  if (slug !== 'website-design' || html.includes('id="custom-cms"')) return html;
  const copy = websiteCustomCms[locale === 'ar' ? 'ar' : 'en'];
  const section = `<section id="custom-cms" class="cy-custom-cms" aria-labelledby="custom-cms-title"><div class="b-wrap">
    <header class="ccms-heading"><div><span class="b-eyebrow">${copy.label}</span><h2 id="custom-cms-title">${copy.title.split('\n').join('<br>')}</h2></div><p>${copy.intro}</p></header>
    <div class="ccms-overview"><figure><img src="/site/generated/website-design/custom-cms-editor-v1.webp" alt="${copy.imageAlt}" width="1440" height="1080" loading="lazy" decoding="async"><figcaption>${copy.mainCaption}</figcaption></figure><div class="ccms-benefits"><h3>${copy.benefitTitle}</h3><ul>${copy.benefits.map(([title,body])=>`<li><span class="ccms-tick" aria-hidden="true">↗</span><div><h4>${title}</h4><p>${body}</p></div></li>`).join('')}</ul></div></div>
    <div class="ccms-technical"><div class="ccms-technical-copy"><span class="b-eyebrow">${copy.technicalLabel}</span><h3>${copy.technicalTitle}</h3><ul>${copy.technical.map(([title,body])=>`<li><h4>${title}</h4><p>${body}</p></li>`).join('')}</ul></div><figure><img src="/site/generated/website-design/custom-cms-workflow-v1.webp" alt="${copy.workflowAlt}" width="1080" height="1350" loading="lazy" decoding="async"><figcaption>${copy.workflowCaption}</figcaption></figure></div>
    <section id="custom-cms-ai" class="ccms-ai" aria-labelledby="custom-cms-ai-title"><header><span class="b-eyebrow">${copy.aiLabel}</span><h3 id="custom-cms-ai-title">${copy.aiTitle}</h3><p>${copy.aiIntro}</p></header><div class="ccms-ai-content"><figure><img src="/site/generated/website-design/custom-cms-ai-${locale === 'ar' ? 'ar' : 'en'}-v1.webp" alt="${copy.aiAlt}" width="1440" height="1080" loading="lazy" decoding="async"><figcaption>${copy.aiCaption}</figcaption></figure><div><ol>${copy.aiSteps.map(([title,body],index)=>`<li><span class="ccms-ai-step" aria-hidden="true">0${index+1}</span><div><h4>${title}</h4><p>${body}</p></div></li>`).join('')}</ol><p class="ccms-ai-note">${copy.aiNote}</p><a class="b-btn ccms-cta ccms-ai-cta" data-quote-open href="${escape(contactHref)}#quote-form">${copy.aiCta}<span aria-hidden="true">${locale === 'ar' ? '↖' : '↗'}</span></a></div></div></section>
    <div class="ccms-closing"><div><h3>${copy.closingTitle}</h3><p>${copy.closing}</p></div><a class="b-btn ccms-cta" data-quote-open href="${escape(contactHref)}#quote-form">${copy.cta}<span aria-hidden="true">${locale === 'ar' ? '↖' : '↗'}</span></a></div>
  </div></section>`;
  const marker = /<section\b(?=[^>]*\bclass="[^"]*\be-payments\b)[^>]*>/;
  if (!marker.test(html)) throw new Error('Website Design Custom CMS insertion anchor missing');
  // Extend the existing Website Design commerce observer without changing its timing or easing.
  const motionTargets = '.e-operations header,.e-management-grid,.e-payment-grid';
  const cmsTargets = '.ccms-heading,.ccms-overview>figure,.ccms-benefits,.ccms-technical-copy,.ccms-technical>figure,.ccms-ai>header,.ccms-ai-content>figure,.ccms-ai-content>div,.ccms-closing';
  return html.replace(marker, (anchor) => section + anchor)
    .replace(motionTargets, motionTargets + ',' + cmsTargets)
    .replace('</head>', '<link rel="stylesheet" href="/site/website-custom-cms.css"></head>');
}
