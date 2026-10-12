export type WorkConcept = {
  en: [string, string];
  ar: [string, string];
  visual: "photo" | "technical";
  topic: string;
};
export const illustrativeWork: Record<string, WorkConcept[]> = {
  "seo-geo": [
    {
      en: [
        "A clearer route from search to enquiry",
        "Organize a specialist service page around customer questions, a useful search snippet and a direct enquiry action.",
      ],
      ar: [
        "من البحث إلى استفسار واضح",
        "تنظيم صفحة خدمة متخصصة حول أسئلة العملاء ونتيجة بحث مفيدة وخطوة مباشرة لطلب التفاصيل.",
      ],
      visual: "technical",
      topic: "Search visibility",
    },
    {
      en: [
        "Performance that keeps the journey moving",
        "Connect page-speed diagnostics with image delivery and loading improvements so visitors reach important content sooner.",
      ],
      ar: [
        "أداء يسهّل الوصول للمحتوى",
        "ربط فحص سرعة الصفحة بتحسين الصور والتحميل ليصل الزائر إلى المعلومات المهمة بسهولة أكبر.",
      ],
      visual: "photo",
      topic: "Page performance",
    },
    {
      en: [
        "An indexable product catalogue",
        "Create useful category pages, descriptive metadata and internal links that help search engines understand the catalogue.",
      ],
      ar: [
        "كتالوج منتجات قابل للاكتشاف",
        "بناء صفحات فئات مفيدة وبيانات وصفية وروابط داخلية تساعد محركات البحث على فهم المنتجات.",
      ],
      visual: "technical",
      topic: "Catalogue structure",
    },
    {
      en: [
        "A local business customers can find",
        "Bring verified locations, opening hours and services into a consistent website and local discovery journey.",
      ],
      ar: [
        "نشاط محلي يسهل العثور عليه",
        "جمع الموقع وساعات العمل والخدمات الموثقة ضمن حضور متسق ومسار واضح للاكتشاف المحلي.",
      ],
      visual: "photo",
      topic: "Local discovery",
    },
    {
      en: [
        "Expert answers with clear context",
        "Structure a focused answer with relevant expertise, source context and supporting service information for people and answer systems.",
      ],
      ar: [
        "إجابات خبيرة بسياق واضح",
        "تنظيم إجابة محددة مع الخبرة ومصادر المعلومات والخدمات المرتبطة ليسهل فهمها من الناس وأنظمة الإجابات.",
      ],
      visual: "technical",
      topic: "Answer readiness",
    },
    {
      en: [
        "Progress connected to business goals",
        "Review relevant visibility, visits and enquiries together to identify the next content and technical priorities.",
      ],
      ar: [
        "تقدّم مرتبط بأهداف النشاط",
        "مراجعة الظهور والزيارات ذات الصلة والاستفسارات معًا لتحديد أولويات المحتوى والتحسين التقني التالية.",
      ],
      visual: "photo",
      topic: "Progress review",
    },
  ],
  "digital-marketing": [
    {
      en: [
        "A campaign with a clear next step",
        "Connect an audience-specific message to a focused landing page and a measurable enquiry action.",
      ],
      ar: [
        "حملة بخطوة تالية واضحة",
        "ربط رسالة مناسبة للجمهور بصفحة هبوط مركزة وإجراء استفسار يمكن قياسه.",
      ],
      visual: "technical",
      topic: "Campaign journey",
    },
    {
      en: [
        "A seasonal collection launch",
        "Coordinate campaign creative, product discovery and the store journey around a new fashion collection.",
      ],
      ar: [
        "إطلاق مجموعة موسمية",
        "تنسيق محتوى الحملة واكتشاف المنتجات وتجربة المتجر حول مجموعة أزياء جديدة.",
      ],
      visual: "photo",
      topic: "Collection launch",
    },
    {
      en: [
        "Follow-up that stays relevant",
        "Design an email sequence around genuine customer actions, useful product information and clear preference controls.",
      ],
      ar: [
        "متابعة تحافظ على صلتها بالعميل",
        "تصميم تسلسل بريد يستند إلى تفاعل العميل ومعلومات المنتج المفيدة وخيارات تواصل واضحة.",
      ],
      visual: "technical",
      topic: "Email follow-up",
    },
    {
      en: [
        "Local discovery for a café",
        "Align the café story, current menu and location information across search, social content and the website.",
      ],
      ar: [
        "اكتشاف محلي لمقهى",
        "توحيد قصة المقهى والقائمة الحالية ومعلومات الموقع بين البحث والمحتوى الاجتماعي والموقع.",
      ],
      visual: "photo",
      topic: "Local campaign",
    },
    {
      en: [
        "A useful campaign measurement view",
        "Bring campaign sources, landing-page actions and enquiry stages into one understandable review.",
      ],
      ar: [
        "صورة مفيدة لقياس الحملات",
        "جمع مصادر الحملات وتفاعل صفحات الهبوط ومراحل الاستفسار ضمن مراجعة واضحة.",
      ],
      visual: "technical",
      topic: "Campaign measurement",
    },
    {
      en: [
        "Explain a complex service simply",
        "Develop coordinated visual and written campaign material that helps business buyers understand the offer and request details.",
      ],
      ar: [
        "شرح خدمة معقدة ببساطة",
        "تطوير محتوى بصري ونصي مترابط يساعد مشتري الخدمات على فهم العرض وطلب التفاصيل.",
      ],
      visual: "photo",
      topic: "Service campaign",
    },
  ],
  "web-mobile-apps": [
    {
      en: [
        "A booking journey across devices",
        "Connect available appointments, customer details and confirmation in a consistent mobile and web experience.",
      ],
      ar: [
        "رحلة حجز عبر الأجهزة",
        "ربط المواعيد المتاحة وبيانات العميل والتأكيد ضمن تجربة متسقة بالموبايل والويب.",
      ],
      visual: "technical",
      topic: "Booking application",
    },
    {
      en: [
        "A field team with connected updates",
        "Help a site team capture job progress and approved evidence while the office follows the same current record.",
      ],
      ar: [
        "فريق ميداني بتحديثات مترابطة",
        "تمكين فريق الموقع من تسجيل التقدم والأدلة المعتمدة بينما يتابع المكتب نفس السجل الحالي.",
      ],
      visual: "photo",
      topic: "Field operations",
    },
    {
      en: [
        "A customer portal with a clear status",
        "Give customers a structured view of requests, documents and next actions without scattered messages.",
      ],
      ar: [
        "بوابة عميل بحالة واضحة",
        "منح العميل عرضًا منظمًا للطلبات والمستندات والخطوات التالية بدل الرسائل المتفرقة.",
      ],
      visual: "technical",
      topic: "Customer portal",
    },
    {
      en: [
        "Inventory where work happens",
        "Connect a warehouse workflow to product availability and movement records so the team can act on current information.",
      ],
      ar: [
        "المخزون بمكان تنفيذ العمل",
        "ربط إجراءات المستودع بتوفر المنتجات وحركتها ليعمل الفريق على معلومات محدثة.",
      ],
      visual: "photo",
      topic: "Inventory application",
    },
    {
      en: [
        "A practical loyalty experience",
        "Present available rewards, account information and redemption steps in a focused customer app.",
      ],
      ar: [
        "تجربة ولاء عملية",
        "عرض المكافآت المتاحة ومعلومات الحساب وخطوات الاستخدام ضمن تطبيق واضح للعميل.",
      ],
      visual: "technical",
      topic: "Customer loyalty",
    },
    {
      en: [
        "Delivery updates people can use",
        "Support a dispatch team with clear job assignments and customer-facing updates around each delivery stage.",
      ],
      ar: [
        "تحديثات توصيل مفيدة",
        "دعم فريق التوصيل بتوزيع واضح للمهام وتحديثات للعميل مرتبطة بمراحل الطلب.",
      ],
      visual: "photo",
      topic: "Delivery application",
    },
  ],
  "ai-automation": [
    {
      en: [
        "Answers grounded in approved knowledge",
        "A scoped assistant retrieves relevant approved material, shows its source and offers a human handoff when needed.",
      ],
      ar: [
        "إجابات تستند إلى معرفة معتمدة",
        "مساعد محدد النطاق يسترجع المعلومات المعتمدة ويوضح مصدرها ويوفر إحالة للفريق عند الحاجة.",
      ],
      visual: "technical",
      topic: "Knowledge assistant",
    },
    {
      en: [
        "A smoother request handoff",
        "Connect incoming customer requests to the right team, required information and a clear follow-up status.",
      ],
      ar: [
        "انتقال أسهل لطلبات العملاء",
        "ربط الطلبات الواردة بالفريق المناسب والمعلومات المطلوبة وحالة متابعة واضحة.",
      ],
      visual: "photo",
      topic: "Request routing",
    },
    {
      en: [
        "Invoice preparation with review controls",
        "Extract agreed invoice fields, flag missing information and route the prepared record for human approval.",
      ],
      ar: [
        "تجهيز فواتير مع ضوابط مراجعة",
        "استخراج حقول الفاتورة المتفق عليها والتنبيه للمعلومات الناقصة وإحالة السجل للموافقة البشرية.",
      ],
      visual: "technical",
      topic: "Invoice workflow",
    },
    {
      en: [
        "Orders that move between systems",
        "Connect agreed order events to stock and fulfilment tasks while preserving traceable updates and exceptions.",
      ],
      ar: [
        "طلبات تنتقل بين الأنظمة",
        "ربط أحداث الطلب بالمخزون ومهام التجهيز مع الحفاظ على تحديثات قابلة للتتبع ومعالجة الاستثناءات.",
      ],
      visual: "photo",
      topic: "Order automation",
    },
    {
      en: [
        "Internal knowledge with clear access",
        "Help staff find relevant procedures and supporting documents within defined permissions and review boundaries.",
      ],
      ar: [
        "معرفة داخلية بصلاحيات واضحة",
        "مساعدة الفريق على العثور على الإجراءات والمستندات المناسبة ضمن صلاحيات وحدود مراجعة محددة.",
      ],
      visual: "technical",
      topic: "Internal knowledge",
    },
    {
      en: [
        "A reviewed content workflow",
        "Turn approved business information into draft campaign material that a person checks before publication.",
      ],
      ar: [
        "إجراءات محتوى تخضع للمراجعة",
        "تحويل معلومات النشاط المعتمدة إلى مسودات حملات يراجعها شخص قبل النشر.",
      ],
      visual: "photo",
      topic: "Reviewed content",
    },
  ],
};
