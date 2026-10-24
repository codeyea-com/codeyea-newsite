/** Four owner-supplied logos and two matching flat email feature icons. */
export const hostingServerFeatureArtwork = {
  cpanel: { file: "cpanel.webp", label: "cPanel" },
  backups: { file: "backups.webp", label: "JetBackup" },
  spam: { file: "spam.svg", label: "" },
  wordpress: { file: "wordpress.webp", label: "WordPress" },
  mail: { file: "mail.svg", label: "" },
  imunify360: { file: "imunify360.webp", label: "Imunify360" },
} as const;

/** Owner supplied five features; Imunify360 capabilities follow its official introduction. */
export const hostingServerFeatures = {
  en: {
    label: "CODEYEA HOSTING",
    heading: "Server features",
    cta: "Find Your Plan",
    category: "YOUR HOSTING TOOLKIT",
    note: "Tools for the everyday work behind your website and email.",
    logoNote: "Control, recovery, email and protection, working together.",
    previous: "Previous feature",
    next: "Next feature",
    status: "Feature",
    slides: [
      {
        id: "cpanel",
        title: "cPanel control panel",
        body: "Take care of your CODEYEA hosting from one familiar dashboard. Manage website files, domains, databases and email accounts with cPanel, keeping everyday administration in one place.",
        caption: "One dashboard. Your everyday hosting tools.",
      },
      {
        id: "backups",
        title: "Twice-daily offsite backups",
        body: "Keep a recent recovery point within reach. CODEYEA takes offsite backups every 12 hours, giving you a copy to return to when an update goes wrong or an accidental change needs undoing.",
        caption: "A fresh backup, twice a day.",
      },
      {
        id: "spam",
        title: "Incoming and outgoing spam protection",
        body: "Keep unwanted mail from getting in the way of business. Incoming and outgoing messages are scanned to help filter spam and reduce abuse that could affect your email reputation.",
        caption: "Cleaner mail. Greater care for your sending reputation.",
      },
      {
        id: "wordpress",
        title: "One-click WordPress with Softaculous",
        body: "Give your next website a straightforward start. Install WordPress through Softaculous in your hosting panel, without working through a manual file upload and database setup.",
        caption: "Less setup. More time for your website.",
      },
      {
        id: "mail",
        title: "Full POP and IMAP access",
        body: "Use your business email in the desktop or mobile app you prefer. Full POP and IMAP connectivity lets you connect your CODEYEA mailbox to familiar email clients and choose the way you work.",
        caption: "Your mailbox. Your preferred email app.",
      },
      {
        id: "imunify360",
        title: "Imunify360 server protection",
        body: "Put several layers of protection around your hosting. Imunify360 combines a firewall, malware scanning and proactive PHP protection to help detect threats and block malicious activity.",
        caption: "Multiple layers of protection for your hosting environment.",
      },
    ],
  },
  ar: {
    label: "استضافة كوديا",
    heading: "مواصفات السيرفرات",
    cta: "اختر خطتك",
    category: "أدوات استضافتك",
    note: "أدوات تساعدك في إدارة موقعك وبريدك كل يوم.",
    logoNote: "الإدارة والنسخ الاحتياطي والبريد والحماية، معاً.",
    previous: "الميزة السابقة",
    next: "الميزة التالية",
    status: "الميزة",
    slides: [
      {
        id: "cpanel",
        title: "لوحة تحكم cPanel",
        body: "أدر استضافتك لدى كوديا من لوحة واحدة مألوفة. تتيح لك cPanel إدارة ملفات الموقع والنطاقات وقواعد البيانات وحسابات البريد، لتبقى مهام الإدارة اليومية في مكان واحد.",
        caption: "لوحة واحدة لأدوات استضافتك اليومية.",
      },
      {
        id: "backups",
        title: "نسخ احتياطي خارجي مرتين يومياً",
        body: "احتفظ بنسخة حديثة يمكنك الرجوع إليها. تنشئ كوديا نسخاً احتياطية كل 12 ساعة وتخزنها خارج السيرفر، لتساعدك على استعادة بياناتك عند تعثر تحديث أو إجراء تغيير غير مقصود.",
        caption: "نسخة احتياطية حديثة، مرتان كل يوم.",
      },
      {
        id: "spam",
        title: "حماية البريد الوارد والصادر من السبام",
        body: "خلّص مراسلات العمل من إزعاج الرسائل غير المرغوبة. نفحص البريد الوارد والصادر للمساعدة في تصفية السبام وتقليل إساءة الاستخدام التي قد تؤثر في سمعة بريدك الإلكتروني.",
        caption: "بريد أنظف وعناية بسمعة الإرسال.",
      },
      {
        id: "wordpress",
        title: "تثبيت WordPress بنقرة عبر Softaculous",
        body: "ابدأ موقعك التالي بخطوات بسيطة. ثبّت WordPress عبر Softaculous من لوحة الاستضافة، دون الحاجة إلى رفع الملفات وإعداد قاعدة البيانات يدوياً، وركّز على بناء موقعك.",
        caption: "إعداد أبسط ووقت أكبر لموقعك.",
      },
      {
        id: "mail",
        title: "اتصال كامل عبر POP وIMAP",
        body: "استخدم بريد أعمالك في التطبيق الذي تفضله على الحاسوب أو الموبايل. يتيح لك دعم POP وIMAP ربط صندوق بريدك لدى كوديا ببرامج البريد المألوفة، والعمل بالطريقة التي تناسبك.",
        caption: "صندوق بريدك في التطبيق الذي تختاره.",
      },
      {
        id: "imunify360",
        title: "حماية السيرفرات مع Imunify360",
        body: "أضف طبقات متعددة من الحماية إلى بيئة استضافتك. يجمع Imunify360 بين جدار الحماية وفحص البرمجيات الخبيثة والحماية الاستباقية لتطبيقات PHP، للمساعدة في اكتشاف التهديدات وحظر الأنشطة الضارة.",
        caption: "طبقات حماية متعددة لبيئة استضافتك.",
      },
    ],
  },
} as const;
