// Trusted, locally authored artwork from the approved v3 preview. No CMS HTML is interpolated.
import { automationScene } from "./automation";
export function buttonMarkup(text, ar) {
  let unit = 0;
  return (
    '<span class="button-text" aria-hidden="true">' +
    text
      .split(" ")
      .map(
        (word) =>
          '<span class="button-word">' +
          (ar ? [word] : [...word])
            .map(
              (part) =>
                `<span class="button-unit" style="--unit-index:${unit++}">${part.replaceAll("&", "&amp;")}</span>`,
            )
            .join("") +
          "</span>",
      )
      .join(" ") +
    '</span><span class="button-icon" aria-hidden="true">↗</span>'
  );
}
export function heroContent(ar) {
  const label = (a, e) => (ar ? a : e),
    base = ar ? "/ar" : "";
  const iconPaths = {
    check: '<path d="m4 12 5 5L21 5"/>',
    robot:
      '<rect x="5" y="7" width="14" height="12"/><path d="M12 3v4M9 3h6M2 11v5m20-5v5M8 22v-3m8 3v-3M8 15h8"/><path d="M8 11h2m4 0h2"/>',
    code: '<path d="m8 6-6 6 6 6m8-12 6 6-6 6m-5 1 2-14"/>',
    menu: '<path d="M3 5h13M3 12h10M3 19h13m5-14-4 7 4 7"/>',
    edit: '<path d="m5 16-1 5 5-1L21 8l-4-4ZM14 7l4 4M3 23h18"/>',
    undo: '<path d="m8 4-5 5 5 5M3 9h11a7 7 0 0 1 7 7v4"/>',
    redo: '<path d="m16 4 5 5-5 5m5-5H10a7 7 0 0 0-7 7v4"/>',
    monitor:
      '<rect x="3" y="4" width="18" height="12"/><path d="M12 16v5M7 21h10"/>',
    phone:
      '<rect x="6" y="2" width="12" height="20"/><path d="M10 5h4M10 19h4"/>',
    arrow: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
    mic: '<rect x="9" y="2" width="6" height="13"/><path d="M5 10v2a7 7 0 0 0 14 0v-2m-7 9v3m-4 0h8"/>',
    clip: '<path d="m9 13 6-6a3 3 0 0 1 4 4L9 21a5 5 0 0 1-7-7L14 2"/>',
    home: '<path d="m2 11 10-9 10 9M5 9v13h5v-7h4v7h5V9"/>',
    search: '<circle cx="10" cy="10" r="7"/><path d="m15 15 7 7"/>',
    grid: '<path d="M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z"/>',
    person:
      '<circle cx="12" cy="7" r="4"/><path d="M3 22v-3a9 9 0 0 1 18 0v3"/>',
    instagram:
      '<rect x="3" y="3" width="18" height="18"/><circle cx="12" cy="12" r="4"/><path d="M17 6h1"/>',
    facebook:
      '<path fill="currentColor" stroke="none" d="M14 22v-9h3l1-4h-4V7c0-1 0-2 2-2h2V1h-3c-4 0-6 2-6 6v2H6v4h3v9z"/>',
    linkedin:
      '<path d="M4 9v12M4 3v1M10 21V9m0 5c0-7 10-7 10 0v7" stroke-width="3"/>',
    youtube:
      '<path d="M2 5h20v14H2z"/><path d="m10 8 6 4-6 4Z" fill="currentColor" stroke="none"/>',
    meta: '<path d="M12 12C7-3-5 3 3 18c4 7 11-17 16-13 4 3 5 15-1 15-3 0-4-5-6-8Z"/>',
    tiktok:
      '<path d="M14 2v14a5 5 0 1 1-5-5m5-9c1 5 4 6 7 6" stroke-width="3"/>',
    mail: '<rect x="2" y="5" width="20" height="14"/><path d="m2 5 10 9L22 5"/>',
    chart: '<path d="M3 3v18h18M6 16l5-7 4 3 6-9m-6 0h6v6"/>',
    analytics:
      '<path d="M5 18v3m7-12v12m7-19v19" stroke="#f9ab00" stroke-width="5"/><path d="M5 18v3m7-12v12" stroke="#e37400" stroke-width="5"/>',
    tag: '<path d="m12 1 11 11-11 11L1 12Z" fill="#8ab4f8" stroke="none"/><path d="m8 5 7 7-7 7 4 4 11-11L12 1Z" fill="#4285f4" stroke="none"/><circle cx="8" cy="19" r="3" fill="#2464ce" stroke="none"/>',
    ads: '<path d="m14 4 7 13" stroke="#4285f4" stroke-width="6"/><path d="M14 4 6 18" stroke="#fbbc04" stroke-width="6"/><circle cx="6" cy="18" r="3.5" fill="#34a853" stroke="none"/>',
  };
  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="miter">${iconPaths[name] || iconPaths.grid}</svg>`;
  }
  const slides = [
    {
      key: "hosting",
      eyebrow: label(
        "استضافة موثوقة. وصيانة مستمرة.",
        "RELIABLE HOSTING. HUMAN SUPPORT.",
      ),
      phrase: label("استضافة تثق بها.", "hosting you can trust."),
      description: label(
        "استضافة مستقرة، ومساعدة ذكية، وفريق يهتم بموقعك حتى تتفرّغ لأعمالك.",
        "Reliable hosting, intelligent assistance and a team that cares for your website. So you can focus on your business.",
      ),
      cta: label("اكتشف الاستضافة والصيانة", "Explore hosting & support"),
      url: "/website-hosting/",
      name: label("الاستضافة والصيانة", "Hosting & support"),
    },
    {
      key: "apps",
      eyebrow: label(
        "من الفكرة إلى تجربة يستخدمها عملاؤك.",
        "FROM YOUR IDEA TO EVERY SCREEN.",
      ),
      phrase: label("تجربة رقمية تميّزها.", "experiences that stand out."),
      description: label(
        "نصمّم مواقع وتطبيقات تربط فكرتك بعملائك، بتجربة واضحة تعمل بسلاسة على كل شاشة.",
        "Websites and applications that bring your idea to life, with thoughtful design and a seamless experience on every screen.",
      ),
      cta: label("اكتشف الويب والتطبيقات", "Explore websites & apps"),
      url: "/services/web-mobile-apps/",
      name: label("الويب والتطبيقات", "Websites & apps"),
    },
    {
      key: "marketing",
      eyebrow: label(
        "التسويق الرقمي وتحسين الظهور في البحث.",
        "DIGITAL MARKETING & SEO.",
      ),
      phrase: label("حضورًا يصل أبعد.", "visibility that goes further."),
      description: label(
        "نربط حملاتك ومحتواك وتحسين ظهورك في البحث، حتى تصل رسالتك إلى الجمهور المناسب.",
        "Connect campaigns, content and search visibility to put your message in front of the people who matter.",
      ),
      cta: label("اكتشف التسويق وSEO", "Explore marketing & SEO"),
      url: "/services/digital-marketing/",
      name: label("التسويق وSEO", "Marketing & SEO"),
    },
    {
      key: "ai",
      eyebrow: label(
        "ذكاء اصطناعي يعمل مع فريقك.",
        "AI THAT WORKS WITH YOUR TEAM.",
      ),
      phrase: label("عملًا أذكى، كل يوم.", "smarter work, every day."),
      description: label(
        "نربط أدواتك ونؤتمت المهام المتكررة، بمساعدين أذكياء يختصرون الخطوات ويدعمون فريقك.",
        "Connect your tools and automate repetitive tasks with AI agents that simplify everyday work and support your team.",
      ),
      cta: label("اكتشف الذكاء الاصطناعي", "Explore AI & automation"),
      url: "/services/ai-automation/",
      name: label("الذكاء والأتمتة", "AI & automation"),
    },
  ];

  function toolbar(app = false) {
    return `<div class="layer toolbar ${app ? "app-toolbar" : ""}" data-motion="fade" data-start=".4"><div class="tool-trigger">${icon(app ? "code" : "menu")}</div><div class="toolbar-strip"><span class="tool-add">+</span>${icon(app ? "grid" : "edit")}${icon("undo")}${icon("redo")}<span class="tool-label">${app ? label("المكوّنات", "Components") : ""}</span>${icon(app ? "phone" : "monitor")}<span class="tool-publish">${app ? label("بناء التطبيق", "Build app") : label("نشر", "Publish")}</span></div></div>`;
  }
  const imageSources = (name, widths, width, height, sizes, first = false) =>
    `src="/homepage/services-hero/${name}-${widths[0]}.webp" srcset="${widths.map(w => `/homepage/services-hero/${name}-${w}.webp ${w}w`).join(', ')}" sizes="${sizes}" width="${width}" height="${height}" decoding="async" fetchpriority="${first ? 'high' : 'low'}"`;
  const support = `<div class="scene" data-scene="0" role="tabpanel" id="panel-0" aria-label="${slides[0].name}">
<div class="layer person" data-motion="fade" data-start=".05" data-duration="1.2"><img ${imageSources('support-specialist', [320, 480, 640], 941, 1672, '(max-width: 900px) 40vw, (min-width: 1600px) 320px, 20vw', true)} alt="${label("مختص كوديا يحمل حاسوبًا محمولًا", "CODEYEA specialist holding a laptop")}"></div>
${toolbar()}
<div class="layer gauge" data-motion="pop" data-start="1.0"><div class="gauge-plate"><svg viewBox="0 0 120 76"><path class="gauge-track" d="M10 64a50 50 0 0 1 100 0"/><path class="gauge-progress" d="M10 64a50 50 0 0 1 100 0"/><path stroke="#adc8d0" stroke-width="1" d="M20 64h5m2-26 5 3m28-27v6m28 18-5 3m17 23h-5"/><g class="needle"><path d="M60 64V28"/><circle cx="60" cy="64" r="4" fill="currentColor" stroke="none"/></g></svg><div class="gauge-value"><b>0.00</b><small>%</small></div><div class="gauge-name">UPTIME</div></div></div>
<p class="layer scene-title" data-motion="rise" data-start=".5">${label("موقعك.<br>بأيدٍ أمينة.", "YOUR WEBSITE.<br>IN GOOD HANDS.")}</p>
<div class="layer agent" data-motion="fade" data-start="1.2"><i class="agent-corner"></i><div class="agent-tag">${icon("robot")}<span class="typed" data-text="AI Agent Ready to work" data-type-start="2.4"></span></div><div class="agent-lines"><i></i><i></i><i></i></div></div>
<div class="layer product-mini" data-motion="pop" data-start="3.8"><img ${imageSources('support-product', [128, 256], 1024, 1536, '(max-width: 900px) 18vw, (min-width: 1600px) 150px, 10vw')} alt="${label("منتج داخل الموقع", "A product on the website")}"></div>
<div class="layer message" data-motion="rise" data-start="1.7"><span class="typed" data-text="${label("صلّح موقعي من الأخطاء", "Fix the errors on my website")}" data-type-start="2.0"></span><div class="message-bottom">${icon("clip")}<div class="message-send">${icon("mic")}<span class="send-icon">${icon("arrow")}</span></div></div></div>
</div>`;
  function fitnessRing() {
    return `<svg viewBox="0 0 120 120" class="fitness-ring"><circle cx="60" cy="60" r="47" fill="none" stroke="#dce8ee" stroke-width="9"/><circle cx="60" cy="60" r="47" fill="none" stroke="#10aabc" stroke-width="9" stroke-dasharray="238 296" transform="rotate(-90 60 60)"/><circle cx="60" cy="60" r="34" fill="none" stroke="#ed6864" stroke-width="6" stroke-dasharray="164 214" transform="rotate(-90 60 60)"/><text x="60" y="59" text-anchor="middle" font-size="19" fill="#143a50" font-weight="600">8,420</text><text x="60" y="73" text-anchor="middle" font-size="7" fill="#6c7f91">${label("خطوات اليوم", "STEPS TODAY")}</text></svg>`;
  }
  const apps = `<div class="scene" data-scene="1" role="tabpanel" id="panel-1" aria-label="${slides[1].name}">
<div class="layer phone" data-motion="rise" data-start=".05" data-duration="1.1"><img class="phone-hardware" ${imageSources('phone-frame', [256, 480, 640], 863, 1822, '(max-width: 900px) 29vw, (min-width: 1600px) 240px, 15vw')} alt="${label("تطبيق لياقة توضيحي داخل موبايل", "Illustrative fitness app inside a phone")}"><div class="phone-screen"><div class="phone-status"><span>9:41</span><span>▴ ▰</span></div><div class="island"></div><div class="app-scroll"><div class="app-top">PULSE<span>${label("الإثنين، 19", "MON, 19")}</span></div><h3 class="app-greeting">${label("كل حركة<br>خطوة للأمام.", "Every move<br>is progress.")}<small>${label("نشاطك اليومي، في مكان واحد.", "Your everyday activity, together.")}</small></h3><div class="activity-card">${fitnessRing()}<div class="activity-stats"><span><b>5.6</b>${label("كم", "km")}</span><span><b>42</b>${label("دقيقة", "minutes")}</span><span><b>286</b>${label("سعرة", "kcal")}</span></div></div><div class="app-categories"><b>${label("أسبوعك", "Your week")}</b><span>${label("عرض النشاط", "View activity")} ↗</span></div><div class="week-chart">${[43, 66, 54, 89, 71, 95, 62].map((h, i) => `<div><i style="--bar:${h}%"></i><small>${ar ? ["إ","ث","ر","خ","ج","س","أ"][i] : "MTWTFSS"[i]}</small></div>`).join("")}</div><div class="app-workout"><small>${label("تمرينك القادم", "YOUR NEXT SESSION")}</small><b>${label("اكتشف إيقاعك.", "Find your rhythm.")}</b><span>${label("20 دقيقة · الجسم بالكامل", "20 MIN · FULL BODY")} →</span></div></div><div class="app-bottom">${icon("home")}${icon("chart")}${icon("grid")}${icon("person")}</div></div></div>
${toolbar(true)}
<div class="layer app-code-badge" data-motion="pop" data-start="1.1">${icon("code")}</div>
<div class="layer app-codeyea-badge" data-motion="pop" data-start="1.4"><img src="/homepage/services-hero/codeyea-mark.png" alt="${label("أيقونة تطبيق كوديا", "CODEYEA application icon")}"></div>
<div class="layer app-stores" data-motion="rise" data-start="3.0"><div><img src="/homepage/services-hero/googleplay.svg" alt="Google Play"><span>Google Play</span></div><div><img src="/homepage/services-hero/appstore.svg" alt="App Store"><span>App Store</span></div></div>
<div class="layer app-caption" data-motion="rise" data-start=".6">${label("فكرتك.<br>على كل شاشة.", "YOUR IDEA.<br>EVERY SCREEN.")}<small>${label("مواقع وتطبيقات<br>مصممة حول أعمالك", "WEBSITES & APPLICATIONS<br>BUILT AROUND YOUR BUSINESS")}</small></div>
<div class="layer social-rail" data-motion="rise" data-start="2.8"><i class="rail-highlight"></i>${["facebook", "instagram", "linkedin", "youtube"].map((name, i) => `<div class="social-tile" data-social="${i}">${icon(name)}</div>`).join("")}</div>
<div class="layer website-window" data-motion="pop" data-start="2.2"><div class="window-top"><i></i><i></i><i></i><span></span></div><div class="website-nav"><b>PULSE</b><span>${label("تطبيقنا &nbsp; من نحن &nbsp; قصصنا", "Our app &nbsp; About &nbsp; Stories")}</span></div><div class="website-body"><div><h3>${label("خطوات صغيرة.<br>وأيام أفضل.", "Small steps.<br>Better days.")}</h3><p>${label("تقدّم بسيط، كل يوم.<br>حركتك. صحتك.", "A little progress, every day.<br>Your movement. Your wellbeing.")}</p><b>${label("اكتشف التطبيق", "DISCOVER THE APP")} ↗</b></div><div class="web-ring">${fitnessRing()}</div></div><div class="website-footer"><span>${label("حركة لها هدف", "MOVE WITH PURPOSE")}</span><span>${label("مصمّم ليومك", "MADE FOR EVERY DAY")}</span></div></div>
</div>`;
  const marketing = `<div class="scene" data-scene="2" role="tabpanel" id="panel-2" aria-label="${slides[2].name}">
<div class="layer product-layout" data-motion="pop" data-start=".3"><img ${imageSources('campaign-sweatshirt', [320, 480, 640], 1122, 1402, '(max-width: 900px) 32vw, (min-width: 1600px) 270px, 17vw')} alt="${label("قميص أخضر ضمن مثال لحملة تسويقية", "Green sweatshirt in an illustrative marketing campaign")}"><div class="product-brand"><b>FORM / STUDIO</b><span>01</span></div></div>
<div class="layer campaign-copy" data-motion="rise" data-start=".5"><h3>${label("حملة واحدة.<br>فرص أكثر.", "ONE CAMPAIGN.<br>MORE POSSIBILITIES.")}</h3><p>${label("منتجك، أمام الجمهور المناسب.<br>محتوى وإعلانات وبحث.", "YOUR PRODUCT. THE RIGHT PEOPLE.<br>CONTENT. CAMPAIGNS. SEARCH.")}</p><span class="campaign-cta">${label("اكتشف المجموعة", "EXPLORE THE COLLECTION")} ↗</span></div>
<div class="layer analytics-rail" data-motion="rise" data-start="1.1">${["analytics", "tag", "ads", "search"].map((n, i) => `<div data-motion="fade" data-start="${1.3 + i * 0.2}">${icon(n)}</div>`).join("")}</div>
<div class="layer reach" data-motion="rise" data-start="1.9"><div class="reach-top"><span>${label("وصول حملتك، أبعد.", "Your campaign. Further.")}</span>${icon("chart")}</div><div class="reach-main"><b class="reach-count">0</b><div class="reach-chart"><svg viewBox="0 0 160 70"><defs><linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#78cddd" stop-opacity=".6"/><stop offset="1" stop-color="#78cddd" stop-opacity="0"/></linearGradient></defs><path class="chart-area" d="M0 58Q10 38 22 48T45 36T68 34T93 23T116 19T140 12L160 4V70H0Z" fill="url(#chart-fill)"/><path class="growth-line" d="M0 58Q10 38 22 48T45 36T68 34T93 23T116 19T140 12L160 4" fill="none" stroke="#10aabc" stroke-width="2" pathLength="1"/></svg></div></div><div class="reach-growth"><b>+85.2%</b><span>${label("نمو الوصول", "REACH GROWTH")}</span><small>${label("بيانات توضيحية", "ILLUSTRATIVE DATA")}</small></div></div>
<div class="layer social-grid">${["facebook", "instagram", "youtube", "meta", "seo", "linkedin"].map((n, i) => `<div class="network" data-motion="pop" data-start="${1.4 + i * 0.18}">${n === "seo" ? "<b>SEO</b>" : icon(n)}</div>`).join("")}</div>
</div>`;

  const scenes = (
    support +
    apps +
    marketing +
    automationScene({ label, icon, name: slides[3].name })
  )
    .replace(
      /class="scene" data-scene="0"/,
      'class="scene is-active" data-scene="0"',
    )
    .replace(
      /role="tabpanel" id="panel-(\d)"/g,
      (_, i) =>
        `role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" aria-hidden="${i !== "0"}" ${i !== "0" ? "inert" : ""}`,
    );
  const tabs = slides
    .map(
      (s, i) =>
        `<button type="button" class="slide-tab" role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-index="${i}"><span>0${i + 1}</span>${s.name}</button>`,
    )
    .join("");
  const html = `
  <div class="ambient" aria-hidden="true"><svg viewBox="0 0 1600 760" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="currentColor" stroke-width=".7"><path d="M770 0 1012 420 530 420Z M1012 420 1252 0 1493 420Z M1012 420 1252 840 1493 420Z M530 420 770 840 290 840Z M1252 0 1493 420 1734 0Z M530 420 288 0 770 0Z"/><path d="m1040 75 92 160h-185Z m214 325 138 240h-277Z M678 490l55 95H623Z M150 590l110 190H40Z"/></g></svg></div>
  <div class="hero-inner">
    <div class="hero-copy"><div class="copy-text"><p class="eyebrow" id="eyebrow">${slides[0].eyebrow}</p><h1><span id="fixed-title">${label("أعمالك تستحق", "Your business deserves")}</span><span class="changing-phrase" id="phrase">${slides[0].phrase}</span></h1><p class="description" id="description">${slides[0].description}</p></div><div class="actions"><a class="primary" id="service-link" href="${base + slides[0].url}" aria-label="${slides[0].cta}">${buttonMarkup(slides[0].cta, ar)}</a><a class="secondary" id="about-link" href="${base}/about/" aria-label="${label("تعرّف على كوديا", "Discover CODEYEA")}">${buttonMarkup(label("تعرّف على كوديا", "Discover CODEYEA"), ar)}</a></div></div>
    <div class="visual"><div class="stage" aria-label="${label("مشهد تفاعلي", "Interactive scene")}"><div class="subject-spotlight" aria-hidden="true"></div><div class="browser-shell"><div class="browser-chrome"><i></i><i></i><i></i><span class="browser-address">CODEYEA / DIGITAL EXPERIENCES</span></div><div class="browser-guides"><i></i><i></i></div></div><div id="slides">${scenes}</div></div></div>
  </div>
  <div class="hero-bottom"><div class="slide-control" role="tablist" aria-label="${label("السلايدات", "Slides")}">${tabs}</div><div class="playback"><span id="slide-count">01 / 04</span><button id="play" type="button" aria-label="${label("إيقاف مؤقت", "Pause")}">Ⅱ</button><button id="replay" type="button" aria-label="${label("إعادة الحركة", "Replay animation")}">↻</button></div></div>
`;
  return {
    slides,
    html: html
      .replace(/id="/g, 'id="home-hero-')
      .replace(/aria-controls="panel-/g, 'aria-controls="home-hero-panel-')
      .replace(/aria-labelledby="tab-/g, 'aria-labelledby="home-hero-tab-')
      .replace(/url\(#chart-fill\)/g, "url(#home-hero-chart-fill)"),
  };
}
