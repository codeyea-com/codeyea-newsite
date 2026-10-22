export type GalleryCaption = { title: string; body: string };
type CaptionPair = { en: GalleryCaption[]; ar: GalleryCaption[] };

/** Editable, illustrative explanations for the existing five-image sections. */
export const galleryCaptions: Record<string, CaptionPair> = {
  "website-design": {
    en: [
      {
        title: "Business website",
        body: "An engineering company needs visitors to understand its expertise before making an enquiry. This illustrative responsive website brings services, project examples and contact actions into one consistent experience across desktop, tablet and mobile.",
      },
      {
        title: "Content management",
        body: "A useful website also needs a practical editing workflow. This concept shows how a team can organize pages, update photographs and prepare content for review, with access suited to each person’s role.",
      },
      {
        title: "Service pages",
        body: "A focused service page answers the questions that come before a booking or enquiry. This concept connects a clear explanation, relevant imagery and a direct next step, helping visitors understand the service and decide whether it fits their needs.",
      },
      {
        title: "Mobile experience",
        body: "Customers often browse while moving between other tasks. This responsive concept keeps essential information, navigation and the enquiry or ordering action easy to use on a smaller screen, without losing the identity of the full website.",
      },
      {
        title: "Website design",
        body: "The design begins with content and the journeys the website must support. This concept connects page planning, visual direction and interface design so the finished website communicates clearly and gives each important action a natural place.",
      },
    ],
    ar: [
      {
        title: "موقع أعمال",
        body: "تحتاج الشركة الهندسية إلى توضيح خبرتها قبل أن يبدأ العميل الاستفسار. يجمع هذا التصور التوضيحي الخدمات ونماذج المشاريع وخطوات التواصل ضمن تجربة متسقة على الحاسوب والتابلت والهاتف.",
      },
      {
        title: "إدارة المحتوى",
        body: "يحتاج الموقع المفيد إلى طريقة عملية لتحديثه. يوضح هذا التصور كيف يستطيع الفريق تنظيم الصفحات وتحديث الصور وإعداد المحتوى للمراجعة، مع منح كل مستخدم الصلاحيات المناسبة لدوره.",
      },
      {
        title: "صفحات الخدمات",
        body: "تجيب صفحة الخدمة المركزة عن الأسئلة التي تسبق الحجز أو الاستفسار. يربط هذا التصور شرحاً واضحاً وصوراً مرتبطة بالخدمة وخطوة تالية مباشرة، ليساعد الزائر على فهم العرض وتقييم مناسبته لاحتياجه.",
      },
      {
        title: "تجربة الموبايل",
        body: "يتصفح كثير من العملاء أثناء انشغالهم بمهام أخرى. يحافظ هذا التصور المتجاوب على سهولة الوصول للمعلومات والتنقل وطلب الخدمة أو التواصل على الشاشة الصغيرة، مع بقاء هوية الموقع متسقة.",
      },
      {
        title: "تصميم المواقع",
        body: "يبدأ التصميم من المحتوى ورحلات الاستخدام المطلوبة. يربط هذا التصور تخطيط الصفحات والتوجه البصري وتصميم الواجهة، حتى يشرح الموقع نشاطك بوضوح ويمنح كل إجراء مهم مكاناً طبيعياً.",
      },
    ],
  },
  "brand-design": {
    en: [
      {
        title: "Visual identity",
        body: "A recognizable identity connects the logo, color palette and typography around a clear business character. This illustrative direction shows how those decisions can work together, giving the brand a consistent foundation for its everyday communication.",
      },
      {
        title: "Brand applications",
        body: "An identity becomes useful when it works in the places customers encounter it. This concept explores applying the same visual language to business materials and digital touchpoints, with consistent proportions, color and hierarchy.",
      },
      {
        title: "Campaign design",
        body: "Campaign creative needs a clear message while remaining recognizable as part of the brand. This concept connects imagery, typography and layout around a focused communication goal, with room to adapt the composition to different placements.",
      },
      {
        title: "Social design",
        body: "A coherent social presence needs more than an individual attractive post. This concept explores a repeatable visual system for announcements, useful information and promotional content, helping a team publish consistently while keeping each message distinct.",
      },
      {
        title: "Art direction",
        body: "Art direction brings photography, materials, composition and typography into one visual idea. This illustrative concept shows how a deliberate creative direction can guide individual assets while preserving the personality and purpose of the brand.",
      },
    ],
    ar: [
      {
        title: "الهوية البصرية",
        body: "تجمع الهوية الواضحة الشعار والألوان والخطوط حول شخصية محددة للنشاط. يوضح هذا التصور كيف تتكامل هذه القرارات لتمنح العلامة أساساً متسقاً في تواصلها اليومي.",
      },
      {
        title: "تطبيقات الهوية",
        body: "تصبح الهوية عملية عندما تنجح في المواضع التي يراها العميل. يستكشف هذا التصور تطبيق اللغة البصرية نفسها على مواد الأعمال ونقاط التواصل الرقمية، مع اتساق النسب والألوان وترتيب المعلومات.",
      },
      {
        title: "تصميم الحملات",
        body: "يحتاج تصميم الحملة إلى رسالة واضحة مع الحفاظ على شخصية العلامة. يربط هذا التصور الصورة والخط والتكوين بهدف تواصلي محدد، مع إمكانية تكييف التصميم لمواضع عرض مختلفة.",
      },
      {
        title: "تصميم محتوى التواصل",
        body: "يحتاج الحضور المتسق على منصات التواصل إلى أكثر من منشور جميل. يستكشف هذا التصور نظاماً بصرياً قابلاً للتكرار للإعلانات والمعلومات المفيدة والمحتوى الترويجي، ليساعد الفريق على النشر باتساق مع تمييز كل رسالة.",
      },
      {
        title: "الإخراج الفني",
        body: "يجمع الإخراج الفني التصوير والخامات والتكوين والخطوط حول فكرة بصرية واحدة. يوضح هذا التصور كيف يوجّه التوجه الإبداعي المدروس الأصول المختلفة مع الحفاظ على شخصية العلامة وهدفها.",
      },
    ],
  },
  ecommerce: {
    en: [
      {
        title: "Online storefront",
        body: "A connected storefront gives products a clear place in the shopping journey. This illustrative concept brings a consistent collection, useful product information and a direct route to purchase across desktop and mobile devices.",
      },
      {
        title: "Store management",
        body: "The customer experience depends on reliable work behind the storefront. This concept shows how product information, stock availability and order status can be organized so the team can manage routine store tasks with greater clarity.",
      },
      {
        title: "Product collections",
        body: "Useful collections help shoppers move from a broad interest to a suitable product. This concept connects product comparison and the basket journey, with clear imagery and information that supports a purchase decision.",
      },
      {
        title: "Mobile shopping",
        body: "A small screen still needs a clear path from choosing a product to confirming an order. This concept focuses on readable order details, understandable payment status and a reassuring next step in the mobile shopping journey.",
      },
      {
        title: "Storefront design",
        body: "Storefront design must connect the visible shopping journey with the work that follows an order. This concept brings the basket, payment, shipping and delivery stages into a coherent flow that customers and the store team can understand.",
      },
    ],
    ar: [
      {
        title: "واجهة المتجر",
        body: "تمنح واجهة المتجر المترابطة المنتجات مكاناً واضحاً ضمن رحلة الشراء. يجمع هذا التصور مجموعة متسقة ومعلومات مفيدة عن المنتجات ومساراً مباشراً للشراء على الحاسوب والهاتف.",
      },
      {
        title: "إدارة المتجر",
        body: "تعتمد تجربة العميل على تنظيم العمل خلف واجهة المتجر. يوضح هذا التصور كيف يمكن جمع معلومات المنتجات وتوفر المخزون وحالة الطلبات، ليتمكن الفريق من إدارة المهام اليومية بوضوح أكبر.",
      },
      {
        title: "مجموعات المنتجات",
        body: "تساعد المجموعات المفيدة المتسوق على الانتقال من اهتمام عام إلى منتج مناسب. يربط هذا التصور مقارنة المنتجات برحلة السلة، مع صور ومعلومات واضحة تدعم قرار الشراء.",
      },
      {
        title: "التسوق عبر الموبايل",
        body: "تحتاج الشاشة الصغيرة إلى مسار واضح من اختيار المنتج إلى تأكيد الطلب. يركز هذا التصور على تفاصيل طلب مقروءة وحالة دفع مفهومة وخطوة تالية واضحة ضمن تجربة التسوق بالموبايل.",
      },
      {
        title: "تصميم واجهة المتجر",
        body: "يربط تصميم المتجر رحلة التسوق بالعمل الذي يلي استلام الطلب. يجمع هذا التصور السلة والدفع والشحن والتسليم ضمن مسار متسق يستطيع العميل وفريق المتجر فهمه ومتابعته.",
      },
    ],
  },
};

export const brandFaq = {
  en: {
    enabled: true,
    label: "FAQs",
    heading: "Questions about brand design.",
    items: [
      {
        title: "What can a brand design project include?",
        body: "The agreed scope can include visual direction, logo design, color and typography, practical brand guidelines and selected applications. We define the required assets and deliverables with you before work begins.",
      },
      {
        title: "Can you improve an existing identity?",
        body: "Yes. We first review the current identity, audience and business goals, then agree whether it needs a focused refinement or a broader redesign. Elements that remain useful can be retained.",
      },
      {
        title: "Will the identity work in Arabic and English?",
        body: "Bilingual requirements are considered in the typography, hierarchy and selected brand applications. We agree the languages, logo variations and assets required for the project.",
      },
      {
        title: "What files and guidelines will we receive?",
        body: "The handover includes the approved file formats and guidance listed in the scope, such as logo versions, color values, typography and usage examples. Print production and third-party licenses are confirmed separately where relevant.",
      },
      {
        title: "How do feedback and revisions work?",
        body: "We agree review stages, the number of revision rounds and who approves decisions before starting. Feedback is gathered around the agreed brief so each stage has a clear direction.",
      },
      {
        title: "How much does brand design cost and how long does it take?",
        body: "Cost and timing depend on the research, number of assets, applications and review stages required. After understanding your needs, we provide a defined scope, schedule and quotation.",
      },
    ],
  },
  ar: {
    enabled: true,
    label: "FAQs",
    heading: "أسئلة حول تصميم الهوية.",
    items: [
      {
        title: "ماذا يمكن أن يشمل مشروع تصميم الهوية؟",
        body: "يمكن أن يشمل النطاق المتفق عليه التوجه البصري وتصميم الشعار والألوان والخطوط ودليل استخدام الهوية وتطبيقات محددة. نحدد معك الأصول والمخرجات المطلوبة قبل بدء العمل.",
      },
      {
        title: "هل تستطيعون تطوير هوية موجودة؟",
        body: "نعم. نراجع الهوية الحالية والجمهور وأهداف النشاط أولاً، ثم نحدد إن كانت تحتاج إلى تحسين محدد أو إعادة تصميم أوسع. يمكن الاحتفاظ بالعناصر التي ما زالت تخدم العلامة.",
      },
      {
        title: "هل تناسب الهوية العربية والإنجليزية؟",
        body: "نراعي متطلبات اللغتين في اختيار الخطوط وترتيب المعلومات وتطبيقات الهوية المحددة. نتفق على اللغات ونسخ الشعار والأصول المطلوبة ضمن نطاق المشروع.",
      },
      {
        title: "ما الملفات والإرشادات التي نستلمها؟",
        body: "يتضمن التسليم صيغ الملفات والإرشادات المحددة في النطاق، مثل نسخ الشعار وقيم الألوان والخطوط وأمثلة الاستخدام. نتفق بصورة مستقلة على الإنتاج الطباعي وتراخيص الجهات الخارجية عند الحاجة.",
      },
      {
        title: "كيف تتم المراجعات والتعديلات؟",
        body: "نتفق قبل البدء على مراحل المراجعة وعدد جولات التعديل والشخص المخوّل باعتماد القرارات. نجمع الملاحظات وفق موجز العمل المتفق عليه حتى تتقدم كل مرحلة باتجاه واضح.",
      },
      {
        title: "ما تكلفة تصميم الهوية والمدة المطلوبة؟",
        body: "تعتمد التكلفة والمدة على البحث وعدد الأصول والتطبيقات ومراحل المراجعة. بعد فهم احتياجك نقدم نطاقاً محدداً وجدولاً زمنياً وعرض سعر.",
      },
    ],
  },
};
