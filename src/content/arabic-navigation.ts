export const arabicNavigation: Record<string, string> = {
  "About Us": "عن CODEYEA",
  Services: "الخدمات",
  Hosting: "الاستضافة",
  Domains: "النطاقات",
  Industries: "القطاعات",
  Contact: "تواصل معنا",
  Work: "الأعمال",
  Home: "الرئيسية",
  "Technical Support": "الدعم التقني",
  "Website Hosting": "استضافة المواقع",
  "WordPress Hosting": "استضافة WordPress",
  "Cloud Hosting": "الاستضافة السحابية",
  "Email Hosting": "استضافة البريد",
  "Website Design & Development": "تصميم وتطوير المواقع",
  "E-Commerce": "التجارة الإلكترونية",
  eCommerce: "التجارة الإلكترونية",
  "Web & Mobile Apps": "تطبيقات الويب والموبايل",
  "AI & Automation": "الذكاء الاصطناعي والأتمتة",
  "SEO & GEO": "تحسين الظهور في البحث والذكاء الاصطناعي",
  "Digital Marketing": "التسويق الرقمي",
  "Brand & Graphic Design": "الهوية والتصميم الجرافيكي",
  Roofing: "الأسقف والعزل",
  Healthcare: "الرعاية الصحية",
  "Healthcare & Aesthetic Clinics": "الرعاية الصحية والعيادات التجميلية",
  Construction: "الإنشاءات والمقاولات",
  "Small Business": "الأعمال الصغيرة",
  "Event Coordinators": "تنظيم الفعاليات",
  Legal: "الخدمات القانونية",
  "Online Magazine": "المجلات الإلكترونية",
  "Oil and Gas": "النفط والغاز",
  "Oil & Gas": "النفط والغاز",
  "Real Estate": "العقارات",
  "Fashion and Lifestyle": "الأزياء وأسلوب الحياة",
  "Beauty, Skincare & Med Spa": "الجمال والعناية بالبشرة والمراكز التجميلية",
  "Restaurants, Cafés & Bakeries": "المطاعم والمقاهي والمخابز",
  "Solar Energy": "الطاقة الشمسية",
  "A dependable home for your website.": "أساس عملي لموقعك.",
  "Hosting built around your WordPress site.": "استضافة تناسب موقع WordPress.",
  "More resources for growing websites.": "موارد أوسع للمواقع المتنامية.",
  "Professional email for your business.": "بريد مهني باسم نشاطك.",
  "Repairs, migration and website recovery.":
    "إصلاح المواقع ونقلها واستعادتها.",
  "Websites built around your business.": "مواقع تنطلق من احتياجات نشاطك.",
  "Connected shopping and store management.": "تجربة شراء وإدارة متجر مترابطة.",
  "Applications for your customers and team.": "تطبيقات لعملائك وفريقك.",
  "Simplify everyday business workflows.": "تبسيط إجراءات العمل اليومية.",
  "Improve discovery across search and AI.":
    "محتوى أوضح للبحث والذكاء الاصطناعي.",
  "Connect your audience, message and channels.":
    "جمهور ورسالة وقنوات مترابطة.",
  "A distinctive and consistent visual identity.": "هوية بصرية مميزة ومتسقة.",
  "Explore our approach for your industry.": "اكتشف نهجنا لاحتياجات قطاعك.",
  "Digital experiences for patients and practices.":
    "تجارب رقمية للمريض والمنشأة.",
  "Present your expertise and connect with clients.":
    "وضح خبرتك وتواصل مع العملاء.",
  "Showcase properties and generate enquiries.":
    "اعرض العقارات وسهّل الاستفسار.",
  "Connect products, customers and operations.":
    "منتجات وعملاء وعمليات مترابطة.",
  "Communicate your practice with clarity.": "عرض واضح لخدمات مكتبك.",
  "Digital solutions for complex industries.": "حلول رقمية لقطاعات متخصصة.",
  "Show your work and capture project enquiries.":
    "اعرض أعمالك ونظّم استفسارات المشاريع.",
  "Build a stronger presence for your business.": "حضور أوضح لنشاطك.",
};
export function localizedHref(href: string, preview = false): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;
  const url = new URL(href, "https://local.invalid");
  if (
    /^\/(?:preview\/ar|api|asset|brand|homepage|site|admin|login)(?:\/|$)/.test(
      url.pathname,
    )
  )
    return href;
  if (/^\/ar(?:\/|$)/.test(url.pathname)) {
    if (!preview) return href;
    const slug = url.pathname.replace(/^\/ar\/?/, "").replace(/\/$/, "");
    if (!slug || /^(about|services|industries)(?:\/|$)/.test(slug))
      url.pathname = "/preview/ar/" + slug;
    else {
      url.pathname = "/preview/pages/" + slug;
      url.searchParams.set("locale", "ar");
    }
    return url.pathname + url.search + url.hash;
  }
  if (url.pathname.startsWith("/preview/pages/"))
    url.searchParams.set("locale", "ar");
  else if (/^\/preview(?:\/|$)/.test(url.pathname))
    url.pathname = url.pathname.replace("/preview", "/preview/ar");
  else url.pathname = "/ar" + url.pathname;
  const destination = url.pathname + url.search + url.hash;
  return preview && url.pathname.startsWith("/ar/")
    ? localizedHref(destination, true)
    : destination;
}
