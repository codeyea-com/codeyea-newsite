/** Contextual destinations, preserving the authored text and phrase boundaries. */
const phrases: Array<[string, string]> = [
  ["CODEYEA", "/about/"],
  ["branding", "/services/brand-design/"],
  ["brand design", "/services/brand-design/"],
  ["web development", "/services/web-mobile-apps/"],
  ["automation", "/services/ai-automation/"],
  ["الهوية والتصميم", "/services/brand-design/"],
  ["الهوية", "/services/brand-design/"],
  ["التصميم", "/services/brand-design/"],
  ["الأتمتة", "/services/ai-automation/"],
  ["والأتمتة", "/services/ai-automation/"],
  ["التطوير", "/services/web-mobile-apps/"],
  ["الذكاء الاصطناعي", "/services/ai-automation/"],
  ["web and mobile applications", "/services/web-mobile-apps/"],
  ["web & app development", "/services/web-mobile-apps/"],
  ["website design", "/services/website-design/"],
  ["technical support", "/services/technical-support/"],
  ["digital marketing", "/services/digital-marketing/"],
  ["brand identity", "/services/brand-design/"],
  ["AI automation", "/services/ai-automation/"],
  ["eCommerce", "/services/ecommerce/"],
  ["e-commerce", "/services/ecommerce/"],
  ["hosting", "/website-hosting/"],
  ["SEO", "/services/seo-geo/"],
  ["تطوير الويب والتطبيقات", "/services/web-mobile-apps/"],
  ["تصميم المواقع", "/services/website-design/"],
  ["الدعم التقني", "/services/technical-support/"],
  ["التسويق الرقمي", "/services/digital-marketing/"],
  ["الهوية البصرية", "/services/brand-design/"],
  ["أتمتة الأعمال", "/services/ai-automation/"],
  ["التجارة الإلكترونية", "/services/ecommerce/"],
  ["الاستضافة", "/website-hosting/"],
];
export function contextualLinks(text: string) {
  const lower = text.toLowerCase();
  const matches = phrases.flatMap(([phrase, href]) => {
    const index = lower.indexOf(phrase.toLowerCase());
    if (index < 0) return [];
    // Do not match English abbreviations inside larger words.
    if (/^[a-z]/i.test(phrase) && /[a-z]/i.test(text[index - 1] || '')) return [];
    if (/[a-z]$/i.test(phrase) && /[a-z]/i.test(text[index + phrase.length] || '')) return [];
    return [{index, label: text.slice(index, index + phrase.length), href}];
  }).sort((a,b) => a.index-b.index || b.label.length-a.label.length);
  const result: {text: string; href?: string}[] = [];
  const seen = new Set<string>();
  let end = 0;
  for (const match of matches) {
    if (match.index < end || seen.has(match.href)) continue;
    result.push({text: text.slice(end, match.index)});
    result.push({text: match.label, href: (/\p{Script=Arabic}/u.test(text) ? '/ar' : '') + match.href});
    seen.add(match.href);
    end = match.index + match.label.length;
  }
  result.push({text: text.slice(end)});
  return result;
}
export function contextualLink(text: string) {
  const lower = text.toLowerCase();
  const found = phrases
    .map(([phrase, href]) => ({
      index: lower.indexOf(phrase.toLowerCase()),
      phrase,
      href,
    }))
    .filter((item) => item.index >= 0)
    .sort((a, b) => a.index - b.index)[0];
  if (!found) return undefined;
  return {
    before: text.slice(0, found.index),
    label: text.slice(found.index, found.index + found.phrase.length),
    after: text.slice(found.index + found.phrase.length),
    href: (/\p{Script=Arabic}/u.test(text) ? "/ar" : "") + found.href,
  };
}
