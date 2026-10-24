export function domainVisitorCountry(request: Request) {
  const country = request.headers.get('x-vercel-ip-country');
  const local = process.env.NODE_ENV === 'development' && ['localhost','127.0.0.1'].includes(new URL(request.url).hostname);
  return country || (local ? 'IQ' : null);
}

export function refineDomains(html: string, locale: string, country?: string | null) {
  const ar = locale === 'ar';
  html = html.replace(/(<article\b[^>]*class="d-identity[^"]*"[\s\S]*?<strong)[^>]*>[\s\S]*?<\/strong>/, '$1 dir="ltr" class="d-full-domain">yourdomain.com</strong>');
  html = html.replace(/(<section\b[^>]*class="d-hosting-types[^"]*"[\s\S]*?)(<p class="d-small">)/, '$1' + `<div class="d-all-hosting"><a class="d-btn" href="${ar?'/ar':''}/website-hosting/">${ar?'اطّلع على جميع خطط الاستضافة':'View all hosting plans'} <span aria-hidden="true">↗</span></a></div>` + '$2');
  html = html.replace(/<span\b[^>]*class="d-faq-label"[^>]*>[\s\S]*?<\/span>/, '');
  html = html.replace(/(<strong dir="ltr" class="d-full-domain">yourdomain\.com<\/strong>)(\s*)(<h3\b[^>]*>[\s\S]*?<\/h3>)/, '$3$2$1');
  // Retain the legacy script's event target until its handler has been installed.
  html = html.replace(/<button\b[^>]*class="d-show"[^>]*>[\s\S]*?<\/button>/, '<button class="d-show" hidden aria-hidden="true" tabindex="-1"></button>');
  if (country?.toUpperCase() === 'IQ') {
    html = html.replace(/(<section\b[^>]*id="extensions"[^>]*>[\s\S]*?<h2\b[^>]*>[\s\S]*?<\/h2>)/, '$1' + `<div id="iraq-request" class="d-iraq-request" hidden><a class="d-btn" href="${ar?'/ar':''}/contact/#contact-form">${ar?'اطلب نطاقاً عراقياً':'Request an Iraqi domain'} <span aria-hidden="true">↗</span></a></div>`);
    html = html.replace(/(<button\b[^>]*id="country-tab"[\s\S]*?<\/button>)/, '$1' + `<button id="iraq-tab" role="tab" aria-selected="false" aria-controls="iraq-panel" tabindex="-1">${ar?'نطاقات العراق':'Iraq domains'}</button>`);
    const panel = `<div id="iraq-panel" class="d-extension-grid" role="tabpanel" aria-labelledby="iraq-tab" hidden>${['.iq','.com.iq'].map(t=>`<a class="d-extension" href="${ar?'/ar':''}/contact/?domain-extension=${encodeURIComponent(t)}#contact-form"><span>${ar?'استفسر عن التسجيل':'Enquire about registration'}</span><strong dir="ltr">${t}</strong></a>`).join('')}</div>`;
    html = html.replace(/(<div id="more-extensions"[^>]*>)/, panel+'$1');
  }
  html = html.replace('</main>', `<section class="d-domain-cta" aria-labelledby="domain-cta-title"><div class="d-container"><h2 id="domain-cta-title">${ar?'اسمك القادم يبدأ من هنا.':'Your next name starts here.'}</h2><a class="d-btn" href="#domain">${ar?'ابحث عن نطاقك':'Find your domain'} <span aria-hidden="true">↗</span></a></div></section></main>`);
  return html.replace('</head>', '<link rel="stylesheet" href="/site/domain-refinements.css?v=5"></head>').replace('</body>', '<script src="/site/domain-refinements.js?v=20261023-1"></script></body>');
}
