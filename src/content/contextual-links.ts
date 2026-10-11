/** Link one relevant service phrase per paragraph, retaining the authored copy. */
const phrases: Array<[string, string]> = [
  ["web and mobile applications", "/web-mobile-apps/"],
  ["web & app development", "/web-mobile-apps/"],
  ["website design", "/website-design/"],
  ["technical support", "/technical-support/"],
  ["digital marketing", "/digital-marketing/"],
  ["brand identity", "/brand-design/"],
  ["AI automation", "/ai-automation/"],
  ["eCommerce", "/ecommerce/"],
  ["e-commerce", "/ecommerce/"],
  ["hosting", "/website-hosting/"],
  ["SEO", "/seo-geo/"],
  ["تطوير الويب والتطبيقات", "/web-mobile-apps/"],
  ["تصميم المواقع", "/website-design/"],
  ["الدعم التقني", "/technical-support/"],
  ["التسويق الرقمي", "/digital-marketing/"],
  ["الهوية البصرية", "/brand-design/"],
  ["أتمتة الأعمال", "/ai-automation/"],
  ["التجارة الإلكترونية", "/ecommerce/"],
  ["الاستضافة", "/website-hosting/"],
];
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
