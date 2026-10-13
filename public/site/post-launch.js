(() => {
  const reduced = matchMedia("(prefers-reduced-motion:reduce)");
  const marked = new WeakSet();
  const faqGroups = new WeakSet();
  const quoteLabels = new WeakMap();
  const updateHeader = () =>
    document
      .querySelectorAll(".hp-header")
      .forEach((header) => header.classList.toggle("cy-sticky", scrollY > 100));
  addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();
  if (
    document.querySelector(".hp.public-surface") &&
    !document.querySelector(".cy-back-top")
  ) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "cy-back-top";
    button.setAttribute(
      "aria-label",
      document.documentElement.lang === "ar"
        ? "العودة إلى الأعلى"
        : "Back to top",
    );
    button.textContent = "↑";
    button.setAttribute("aria-hidden", "true");
    button.addEventListener("click", () => {
      scrollTo({ top: 0, behavior: reduced.matches ? "instant" : "smooth" });
    });
    document.body.append(button);
    const update = () => {
      const visible = scrollY >= 500;
      button.classList.toggle("is-visible", visible);
      button.setAttribute("aria-hidden", String(!visible));
      button.tabIndex = visible ? 0 : -1;
    };
    addEventListener("scroll", update, { passive: true });
    update();
  }
  if (
    document.documentElement.lang === "ar" &&
    !window.CODEYEA_ARABIC_QUOTE_UI
  ) {
    const script = document.createElement("script");
    script.src = "/site/arabic-quote-ui.js";
    script.onload = () => refine();
    document.head.append(script);
  }
  let languagePath = "";
  let openedQuoteRoute = "";
  async function language() {
    if (languagePath === location.pathname) return;
    languagePath = location.pathname;
    try {
      const response = await fetch(
        "/api/site-language?path=" + encodeURIComponent(location.pathname),
        { cache: "no-store" },
      );
      if (!response.ok) return;
      const data = await response.json();
      document.querySelectorAll(".cy-language-slot").forEach((slot) => {
        slot.replaceChildren();
        if (!data.enabled) return;
        const link = document.createElement("a");
        link.href = data.href;
        link.lang = data.label === "English" ? "en" : "ar";
        link.textContent = data.label;
        link.setAttribute(
          "aria-label",
          data.label === "English"
            ? "Switch to English"
            : "تصفح الموقع بالعربية",
        );
        slot.append(link);
        if (!document.querySelector(".cy-language-float")) {
          const floating = link.cloneNode(true);
          floating.className = "cy-language-float";
          document.body.append(floating);
          const update = () => {
            const visible = scrollY > 160;
            floating.classList.toggle("is-visible", visible);
            floating.tabIndex = visible ? 0 : -1;
            floating.setAttribute("aria-hidden", String(!visible));
          };
          addEventListener("scroll", update, { passive: true });
          update();
        }
      });
    } catch {}
  }
  const arabicUI = {
    "عن CODEYEA": "عن كوديا",
    "Explore Details": "اكتشف التفاصيل",
    "Full name": "الاسم الكامل",
    "Email address": "بريدك الإلكتروني",
    "Phone number": "رقم الهاتف",
    "New project": "مشروع جديد",
    "Tell us about your project": "حدثنا عن مشروعك",
    Pause: "إيقاف مؤقت",
    Play: "متابعة",
    Drag: "اسحب",
    "Technical support": "الدعم التقني",
    "Keep In Touch": "ابقَ على تواصل",
    "Enter your email address": "أدخل بريدك الإلكتروني",
    "Email delivery is not connected yet.": "إرسال البريد غير مفعّل حاليًا.",
    "Email delivery is not connected yet. Your address has not been sent or saved.":
      "إرسال البريد غير مفعّل حاليًا. لم يُرسل عنوانك أو يُحفظ.",
    MENU: "القائمة",
    "All rights reserved.": "جميع الحقوق محفوظة.",
    Daily: "يوميًا",
    Unlimited: "غير محدود",
    "Twice daily": "مرتين يوميًا",
    Included: "مشمول",
    "/month": "/ شهر",
    Support: "الدعم",
    "Client Area": "منطقة العملاء",
    "Get Your Free Quote": "أطلب التسعيرة المجانية الآن",
    "ابدأ محادثة": "راسلنا الآن",
    "Reviewing the recent WordPress update.": "نراجع تحديث WordPress الأخير.",
    "Support is checking the issue.": "يفحص الدعم سبب المشكلة.",
    "DNS records are responding.": "سجلات DNS تستجيب.",
    "Hosting is reachable.": "الاستضافة متاحة.",
    "Database connection is stable.": "الاتصال بقاعدة البيانات مستقر.",
    "Website response has been restored.": "عاد الموقع إلى الاستجابة.",
    "SITE BACK ONLINE": "الموقع متاح مجددًا",
    ONLINE: "متاح",
    UNAVAILABLE: "غير متاح",
    "Storage ready": "التخزين جاهز",
    "NVMe SSD storage connected.": "تخزين NVMe SSD متصل.",
    "Manage your website with cPanel.": "أدر موقعك عبر cPanel.",
    "BUILT FOR WHAT’S NEXT": "جاهز لخطوتك القادمة",
    RESOLVED: "تم الحل",
    "Open menu": "افتح القائمة",
    "Close menu": "أغلق القائمة",
    Contact: "تواصل معنا",
    "Skip to content": "انتقل إلى المحتوى",
  };
  function refine() {
    if (document.documentElement.lang === "ar") {
      document.querySelectorAll('a[href^="/ar/"]').forEach((a) => {
        if (!location.pathname.startsWith("/preview/")) return;
        const url = new URL(a.href),
          slug = url.pathname.replace(/^\/ar\//, "").replace(/\/$/, "");
        if (!slug || /^(about|services|industries)(?:\/|$)/.test(slug))
          url.pathname = "/preview/ar/" + slug;
        else {
          url.pathname = "/preview/pages/" + slug;
          url.searchParams.set("locale", "ar");
        }
        a.setAttribute("href", url.pathname + url.search + url.hash);
      });
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
      );
      let node;
      const copy = { ...arabicUI, ...window.CODEYEA_ARABIC_QUOTE_UI };
      document
        .querySelectorAll("[placeholder], [aria-label]")
        .forEach((element) => {
          for (const attribute of ["placeholder", "aria-label"]) {
            const value = element.getAttribute(attribute);
            if (value && copy[value])
              element.setAttribute(attribute, copy[value]);
          }
        });
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim();
        let translated = copy[text];
        if (
          !translated &&
          /\s*\*$/.test(text) &&
          copy[text.replace(/\s*\*$/, "")]
        )
          translated = copy[text.replace(/\s*\*$/, "")] + " *";
        if (
          !translated &&
          node.parentElement?.closest("#cq-dialog") &&
          text.includes(", ")
        )
          translated = text
            .split(", ")
            .map((value) => copy[value] ?? value)
            .join("، ");
        if (!translated && /^TECHNICAL SUPPORT \/ \d+$/.test(text))
          translated = text.replace("TECHNICAL SUPPORT", "الدعم التقني");
        if (!translated && /^Technical support —/.test(text))
          translated = text.replace("Technical support", "الدعم التقني");
        if (!translated && /^SECOND SERVICE \/ \d+ OF 2$/.test(text))
          translated = text.replace(
            /^SECOND SERVICE \/ (\d+) OF 2$/,
            "الخدمة الثانية / $1 من 2",
          );
        if (
          translated &&
          !["SCRIPT", "STYLE", "CODE"].includes(node.parentElement?.tagName)
        )
          node.textContent = node.textContent.replace(text, translated);
      }
    }
    const visibleText = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    let visibleNode;
    while ((visibleNode = visibleText.nextNode())) {
      if (
        !visibleNode.parentElement?.closest("script,style,code,pre") &&
        /\u2014|&(?:amp;)*nbsp;/.test(visibleNode.textContent)
      )
        visibleNode.textContent = visibleNode.textContent
          .replaceAll("\u2014", ", ")
          .replace(/&(?:amp;)*nbsp;/g, " ");
    }
    void language();
    document
      .querySelectorAll(
        ".hp.public-surface a, .hp.public-surface button, #cq-dialog a, #cq-dialog button",
      )
      .forEach((control) => {
        if (
          control.closest(
            ".hp-carousel-buttons, .about-reference-pagination, .hp-desktop-nav",
          ) ||
          control.classList.contains("cy-back-top") ||
          control.matches("[data-slide], [data-period]") ||
          control.closest(".v-plan-controls")
        )
          return;
        [...control.childNodes].forEach((node) => {
          if (
            node.nodeType !== Node.TEXT_NODE ||
            !/[↗↖↘↙→←›‹]\s*$/.test(node.textContent)
          )
            return;
          const arrow = document.createElement("span");
          arrow.setAttribute("aria-hidden", "true");
          arrow.textContent = "↗";
          node.textContent =
            node.textContent.replace(/[↗↖↘↙→←›‹]\s*$/, "").trimEnd() + " ";
          node.after(arrow);
        });
        control.querySelectorAll("span").forEach((span) => {
          if (
            !span.children.length &&
            /^[↗↖↘↙→←›‹]$/.test(span.textContent.trim()) &&
            !span.classList.contains("cy-button-arrow")
          ) {
            span.textContent = "↗";
            span.setAttribute("aria-hidden", "true");
            span.classList.add("cy-button-arrow");
            control.classList.add("cy-arrow-control");
          }
        });
      });
    const routePath = (pathname) =>
      pathname
        .replace(/^\/preview(?=\/|$)/, "")
        .replace(/^\/ar(?=\/|$)/, "")
        .replace(/^\/pages(?=\/|$)/, "")
        .replace(/\/$/, "") || "/";
    const path = routePath(location.pathname);
    document
      .querySelectorAll(
        ".hp-desktop-nav a, .cy-host-links a, .hp-mobile-panel nav a",
      )
      .forEach((link) => {
        const href = routePath(new URL(link.href, location.href).pathname);
        if (path === href) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });
    document
      .querySelectorAll(".hp-desktop-nav > .hp-nav-item")
      .forEach((item) => {
        const root = item.querySelector(
          ":scope > a, :scope > .cy-nav-root > a",
        );
        const toggle = item.querySelector("button[aria-controls]");
        const panel =
          toggle &&
          document.getElementById(toggle.getAttribute("aria-controls"));
        if (!root || root.getAttribute("aria-current") === "page") return;
        if (
          [
            "/website-hosting",
            "/cloud-hosting",
            "/wordpress-hosting",
            "/email-hosting",
          ].includes(path) &&
          routePath(new URL(root.href, location.href).pathname) !==
            "/website-hosting"
        )
          return;
        if (
          panel &&
          [...panel.querySelectorAll(".cy-host-links a")].some(
            (link) =>
              routePath(new URL(link.href, location.href).pathname) === path,
          )
        )
          root.setAttribute("aria-current", "location");
      });
    document
      .querySelectorAll(".hp-mobile-panel nav > details")
      .forEach((group) => {
        const root = group.querySelector("summary a");
        if (!root || root.getAttribute("aria-current") === "page") return;
        if (
          [...group.querySelectorAll(".hp-mobile-submenu a")].some(
            (link) =>
              routePath(new URL(link.href, location.href).pathname) === path,
          )
        )
          root.setAttribute("aria-current", "location");
      });
    document
      .querySelectorAll(
        '[class*="faq"] summary,[class*="faq"] button[aria-expanded]',
      )
      .forEach((question) => {
        question.querySelectorAll(":scope>span").forEach((span) => {
          if (/^[+−–-]?$/.test(span.textContent.trim())) span.remove();
        });
        question.classList.add("cy-faq-question");
        question.closest("details,article")?.classList.add("cy-faq-item");
      });

    document.querySelectorAll(".b-process").forEach((group) => {
      const cards = [...group.querySelectorAll(":scope>article")];
      if (!cards.length) return;
      group.style.setProperty("--cy-process-card-height", "0px");
      const height = Math.ceil(
        Math.max(...cards.map((card) => card.getBoundingClientRect().height)),
      );
      group.style.setProperty("--cy-process-card-height", height + "px");
    });
    document.querySelectorAll(".b-marquee>div").forEach((track) => {
      if (marked.has(track)) return;
      marked.add(track);
      const text = track.textContent.trim();
      for (let i = 1; i < text.length; i++) {
        const first = text.slice(0, i).trim(),
          second = text.slice(i).trim();
        if (first !== second) continue;
        const phrase = document.createElement("span");
        phrase.className = "cy-marquee-phrase";
        phrase.textContent = first;
        const duplicate = phrase.cloneNode(true);
        duplicate.setAttribute("aria-hidden", "true");
        track.replaceChildren(phrase, duplicate);
        break;
      }
    });

    // Keep each FAQ's own animation/state while closing its previous answer.
    document
      .querySelectorAll('section[class*="faq"], #services-faq')
      .forEach((group) => {
        if (faqGroups.has(group)) return;
        faqGroups.add(group);
        let closingPeers = false;
        group.addEventListener(
          "click",
          (event) => {
            const question = event.target.closest(
              "summary, button[aria-expanded]",
            );
            if (!question || closingPeers || !group.contains(question)) return;
            const expanded = (q) =>
              q.hasAttribute("aria-expanded")
                ? q.getAttribute("aria-expanded") === "true"
                : !!q.closest("details")?.open;
            if (expanded(question)) return;
            closingPeers = true;
            group
              .querySelectorAll("summary, button[aria-expanded]")
              .forEach((other) => {
                if (other !== question && expanded(other)) other.click();
              });
            closingPeers = false;
          },
          true,
        );
      });
    const arabic = document.documentElement.lang === "ar";
    const preview = location.pathname.startsWith("/preview");
    const contact = preview
      ? "/preview/pages/contact" + (arabic ? "?locale=ar" : "")
      : (arabic ? "/ar" : "") + "/contact/";
    const endSections =
      ".b-contact,.rp-cta,.rf-cta,.detail-cta,.hp-contact,.hp-cta,.industries-final";
    document
      .querySelectorAll(
        ".hp.public-surface .hp-header-quote,.hp.public-surface main a,.hp.public-surface main button",
      )
      .forEach((control) => {
        if (
          control.closest(
            ".internal-hero-media,.hp-plan-table .v-plan-controls",
          )
        )
          return;
        const text = control.textContent.trim();
        const href = control.getAttribute("href") || "";
        const atEnd = !!control.closest(endSections);
        const existingQuote =
          control.hasAttribute("data-quote-open") ||
          /free\s+(?:project\s+)?quote|تسعيرة مجانية|التسعيرة المجانية|عرضك المجاني/i.test(text);
        const contactLink =
          /^(?:https?:\/\/(?:www\.)?codeyea\.com)?\/(?:ar\/|preview\/pages\/)?contact(?:[/?#]|$)/.test(
            href,
          );
        if (atEnd || existingQuote || contactLink) {
          // Discussion/support CTAs belong to contact; project/plan/end CTAs to quote.
          const message =
            !atEnd &&
            !existingQuote &&
            /message|conversation|talk|support|محادثة|راسل|لنتحدث|دعم|نقل|migrat/i.test(
              text,
            );
          if (message) {
            control.removeAttribute("data-quote-open");
            control.setAttribute("href", contact + "#contact-form");
          } else {
            control.setAttribute("data-quote-open", "");
            control.setAttribute("href", contact + "#quote-form");
          }
        }
        if (
          arabic &&
          (/عرضك المجاني|اطلب عرض|احصل على عرض|تسعيرة مجانية|التسعيرة المجانية/.test(text) ||
            control.matches(".hp-header-quote"))
        ) {
          let label = quoteLabels.get(control);
          if (!label) {
            const walker = document.createTreeWalker(
              control,
              NodeFilter.SHOW_TEXT,
            );
            let node;
            while ((node = walker.nextNode()))
              if (/عرض|تسعيرة/.test(node.textContent)) {
                label = node;
                break;
              }
            if (label) quoteLabels.set(control, label);
          }
          if (label) {
            const desired = "أطلب التسعيرة المجانية الآن";
            if (label.textContent.trim() !== desired)
              label.textContent = desired;
          }
        }
      });
    // A visible fallback URL opens the same quote form on the contact page.
    if (
      location.hash === "#quote-form" &&
      openedQuoteRoute !== location.pathname + location.search
    ) {
      openedQuoteRoute = location.pathname + location.search;
      document.querySelector(".hp-header-quote[data-quote-open]")?.click();
    }

    document.querySelectorAll(".v-showcases").forEach((stack) => {
      if (marked.has(stack)) return;
      marked.add(stack);
      const anchor = document.createElement("span");
      anchor.style.cssText = "display:block;height:0;pointer-events:none";
      stack.querySelector(".v-show").before(anchor);
      let locked = false,
        timer,
        accumulated = 0,
        direction = 0;
      stack.addEventListener(
        "wheel",
        (event) => {
          if (
            reduced.matches ||
            innerWidth <= 900 ||
            event.ctrlKey ||
            Math.abs(event.deltaX) > Math.abs(event.deltaY) ||
            event.target.closest("input,textarea,select,button,a")
          )
            return;
          const cards = [...stack.querySelectorAll(".v-show")];
          if (cards.length < 2) return;
          const top = 96,
            base = anchor.getBoundingClientRect().top + scrollY;
          let offset = 0;
          const stops = cards.map((card) => {
            const stop = base + offset - top;
            offset += card.offsetHeight;
            return stop;
          });
          if (
            scrollY < stops[0] - 4 ||
            scrollY > stops.at(-1) + cards.at(-1).offsetHeight - 4
          )
            return;
          if (locked) {
            event.preventDefault();
            return;
          }
          const delta =
              event.deltaY *
              (event.deltaMode === 1
                ? 16
                : event.deltaMode === 2
                  ? innerHeight
                  : 1),
            sign = Math.sign(delta);
          if (!sign) return;
          let index = stops.reduce(
            (best, stop, i) =>
              Math.abs(stop - scrollY) < Math.abs(stops[best] - scrollY)
                ? i
                : best,
            0,
          );
          if (sign < 0 && index === 0 && Math.abs(scrollY - stops[0]) < 5)
            return;
          if (direction !== sign) accumulated = 0;
          direction = sign;
          accumulated += Math.abs(delta);
          event.preventDefault();
          if (accumulated < 40) return;
          const next = index + sign;
          const target =
            next >= cards.length
              ? base + offset - top
              : next < 0
                ? stops[0]
                : stops[next];
          accumulated = 0;
          locked = true;
          scrollTo({ top: target, behavior: "smooth" });
          clearTimeout(timer);
          timer = setTimeout(() => (locked = false), 900);
        },
        { passive: false },
      );
    });
  }
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      refine();
    });
  });
  document.fonts.ready.then(() => refine());
  addEventListener("resize", () => refine());
  refine();
  observer.observe(document.body, { childList: true, subtree: true });
})();
