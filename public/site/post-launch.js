(() => {
  const reduced = matchMedia("(prefers-reduced-motion:reduce)");
  const marked = new WeakSet();
  if (document.querySelector('.hp.public-surface') && !document.querySelector('.cy-back-top')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cy-back-top';
    button.setAttribute('aria-label', document.documentElement.lang === 'ar' ? 'العودة إلى الأعلى' : 'Back to top');
    button.textContent = '↑';
    button.hidden = true;
    button.addEventListener('click', () => {
      scrollTo({ top: 0, behavior: reduced.matches ? 'instant' : 'smooth' });
    });
    document.body.append(button);
    const update = () => { button.hidden = scrollY < 500; };
    addEventListener('scroll', update, { passive: true });
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
      });
    } catch {}
  }
  const arabicUI = {
    "عن CODEYEA": "عن كوديا",
    "Keep In Touch": "ابقَ على تواصل",
    "Enter your email address": "أدخل بريدك الإلكتروني",
    "Email delivery is not connected yet.": "إرسال البريد غير مفعّل حاليًا.",
    "Email delivery is not connected yet. Your address has not been sent or saved.":
      "إرسال البريد غير مفعّل حاليًا. لم يُرسل عنوانك أو يُحفظ.",
    MENU: "القائمة",
    "All rights reserved.": "جميع الحقوق محفوظة.",
    Support: "الدعم",
    "Client Area": "منطقة العملاء",
    "Get Your Free Quote": "اطلب عرضك المجاني",
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
    void language();
    const routePath = (pathname) =>
      pathname
        .replace(/^\/preview(?=\/|$)/, "")
        .replace(/^\/ar(?=\/|$)/, "")
        .replace(/^\/pages(?=\/|$)/, "")
        .replace(/\/$/, "") || "/";
    const path = routePath(location.pathname);
    document.querySelectorAll(".hp-desktop-nav a, .hp-mobile-panel nav a").forEach((link) => {
      const href = routePath(new URL(link.href, location.href).pathname);
      if (path === href) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
    document.querySelectorAll(".hp-desktop-nav > .hp-nav-item").forEach((item) => {
      const root = item.querySelector(":scope > a, :scope > .cy-nav-root > a");
      const toggle = item.querySelector("button[aria-controls]");
      const panel = toggle && document.getElementById(toggle.getAttribute("aria-controls"));
      if (!root || root.getAttribute("aria-current") === "page") return;
      if (panel && [...panel.querySelectorAll(".cy-host-links a")].some((link) =>
        routePath(new URL(link.href, location.href).pathname) === path
      )) root.setAttribute("aria-current", "location");
    });
    document.querySelectorAll(".hp-mobile-panel nav > details").forEach((group) => {
      const root = group.querySelector("summary a");
      if (!root || root.getAttribute("aria-current") === "page") return;
      if ([...group.querySelectorAll(".hp-mobile-submenu a")].some((link) =>
        routePath(new URL(link.href, location.href).pathname) === path
      )) root.setAttribute("aria-current", "location");
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
  refine();
  observer.observe(document.body, { childList: true, subtree: true });
})();
