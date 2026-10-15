(() => {
  const root = document.querySelector(".case-detail");
  if (!root) return;
  const $ = (s) => root.querySelector(s),
    $$ = (s) => [...root.querySelectorAll(s)];
  document.documentElement.classList.add("js");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  $$("[data-tab]").forEach(
    (button) =>
      (button.tabIndex =
        button.getAttribute("aria-selected") === "true" ? 0 : -1),
  );

  // Website Design focusedSectionMotion: masked lines, 1400ms, y=-50, 90ms stagger.
  $$(".copy.reveal,.creative-copy.reveal,.journey-heading.reveal").forEach(
    (group) => {
      group.classList.remove("reveal");
      [...group.children]
        .filter((e) => !e.matches("h1,h2,h3,h4"))
        .forEach((e) => e.classList.add("reveal"));
    },
  );
  const titleAnimations = [];
  const titleObserver = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        titleObserver.unobserve(entry.target);
        if (reduced) return;
        [...entry.target.querySelectorAll(".b-line-inner")].forEach((line, i) =>
          titleAnimations.push(
            line.animate(
              [
                { opacity: 0, transform: "translateY(-50px)" },
                { opacity: 1, transform: "translateY(0)" },
              ],
              {
                duration: 1400,
                delay: 100 + i * 90,
                easing: "cubic-bezier(.165,.84,.44,1)",
                fill: "backwards",
              },
            ),
          ),
        );
      }),
    { threshold: 0.12 },
  );
  $$("h1,h2,h3,h4").forEach((title) => {
    if (title.closest(".accordion") || title.querySelector("small")) return;
    title.innerHTML = title.innerHTML
      .split(/<br\s*\/?\s*>/i)
      .map(
        (line) =>
          '<span class="b-line-mask"><span class="b-line-inner">' +
          line +
          "</span></span>",
      )
      .join("");
    titleObserver.observe(title);
  });
  matchMedia("(prefers-reduced-motion: reduce)").addEventListener(
    "change",
    (e) => {
      if (e.matches) titleAnimations.forEach((a) => a.cancel());
    },
  );

  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          io.unobserve(e.target);
          if (e.target.classList.contains("numbers")) countUp();
        }
      }),
    { threshold: 0.12 },
  );
  $$(".reveal").forEach((e) => io.observe(e));
  function countUp() {
    $$("[data-count]").forEach((el) => {
      const n = +el.dataset.count;
      if (reduced) return;
      const start = performance.now();
      function step(t) {
        el.textContent = Math.round(
          n * (1 - Math.pow(1 - Math.min((t - start) / 1300, 1), 3)),
        );
        if (t - start < 1300) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }
  const stage = $(".gallery-stage"),
    track = $(".gallery-track"),
    slides = $$(".slide");
  let current = 0,
    startX = null;
  function selectSlide(i) {
    current = (i + slides.length) % slides.length;
    track.style.transform = `translateX(${-current * 100}%)`;
    $$("[data-slide]").forEach((b, n) =>
      b.setAttribute("aria-pressed", String(n === current)),
    );
    slides.forEach((s, n) => {
      s.querySelector("img").style.transform =
        n === current ? "translateX(0)" : "translateX(4%)";
    });
  }
  if ($(".gallery-next"))
    $(".gallery-next").onclick = () => selectSlide(current + 1);
  if ($(".gallery-prev"))
    $(".gallery-prev").onclick = () => selectSlide(current - 1);
  $$("[data-slide]").forEach(
    (b) => (b.onclick = () => selectSlide(+b.dataset.slide)),
  );
  stage.onpointerdown = (e) => {
    if (slides.length < 2 || e.target.closest("button")) return;
    startX = e.clientX;
    stage.setPointerCapture(e.pointerId);
  };
  stage.onpointerup = (e) => {
    if (startX !== null && Math.abs(e.clientX - startX) > 40)
      selectSlide(current + (e.clientX < startX ? 1 : -1));
    startX = null;
  };
  stage.onpointercancel = () => (startX = null);
  stage.ondragstart = (e) => e.preventDefault();
  stage.onkeydown = (e) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      selectSlide(current + 1);
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      selectSlide(current - 1);
    }
  };
  $$("[data-tab]").forEach((b) => {
    b.onclick = () => {
      $$("[data-tab]").forEach((t) => {
        t.setAttribute("aria-selected", String(t === b));
        t.tabIndex = t === b ? 0 : -1;
      });
      $$("[role=tabpanel]").forEach(
        (p, i) => (p.hidden = i !== +b.dataset.tab),
      );
    };
    b.onkeydown = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        e.preventDefault();
        const tabs = $$("[data-tab]");
        const next =
          tabs[(+b.dataset.tab + (e.key === "ArrowRight" ? 1 : 2)) % 3];
        next.click();
        next.focus();
      }
    };
  });
  $$(".hotspot").forEach(
    (b) =>
      (b.onclick = () => {
        const open = b.getAttribute("aria-expanded") === "true";
        b.setAttribute("aria-expanded", String(!open));
        document.getElementById(b.getAttribute("aria-controls")).hidden = open;
      }),
  );
  $$(".accordion button").forEach(
    (b) =>
      (b.onclick = () => {
        const open = b.getAttribute("aria-expanded") === "true";
        $$(".accordion button").forEach((btn) => {
          const active = btn === b && !open,
            body = document.getElementById(btn.getAttribute("aria-controls")),
            wasOpen = btn.getAttribute("aria-expanded") === "true";
          btn.setAttribute("aria-expanded", String(active));
          btn.querySelector("b").textContent = active ? "−" : "+";
          if (active) {
            body.hidden = false;
            if (!reduced)
              body.animate(
                [
                  { height: "0px", opacity: 0, paddingBottom: "0px" },
                  {
                    height: body.scrollHeight + "px",
                    opacity: 1,
                    paddingBottom: "22px",
                  },
                ],
                { duration: 350, easing: "ease-out" },
              );
          } else if (wasOpen && !reduced) {
            const anim = body.animate(
              [
                { height: body.scrollHeight + "px", opacity: 1 },
                { height: "0px", opacity: 0, paddingBottom: "0px" },
              ],
              { duration: 300, easing: "ease-in" },
            );
            anim.onfinish = () => {
              if (btn.getAttribute("aria-expanded") === "false")
                body.hidden = true;
            };
          } else body.hidden = true;
        });
      }),
  );
  $(".expand-photo").onclick = () => $(".photo-dialog").showModal();
  $(".photo-dialog button").onclick = () => $(".photo-dialog").close();
  $(".photo-dialog").onclick = (e) => {
    if (e.target === $(".photo-dialog")) e.target.close();
  };
  // Keep image enlargement inside its frame, separate from entrance and slide transforms.
  $$(".image-frame").forEach((frame) => {
    const img = frame.querySelector(":scope > img");
    if (!img) return;
    const clip = document.createElement("div");
    clip.className = "image-clip";
    img.before(clip);
    clip.append(img);
  });
  $$(".hotspot").forEach((button) => {
    const glyph = document.createElement("span");
    glyph.className = "hotspot-glyph";
    glyph.textContent = button.textContent;
    glyph.setAttribute("aria-hidden", "true");
    button.replaceChildren(glyph);
  });
  const hoverMotion = matchMedia("(hover: hover) and (pointer: fine)");
  function installImageZoom(host, images) {
    let tick = 0,
      started = 0;
    const stop = () => {
      cancelAnimationFrame(tick);
      tick = 0;
      host.classList.remove("zoom-active");
      images.forEach((img) => (img.style.scale = "1"));
    };
    host.addEventListener("pointerenter", (e) => {
      if (e.pointerType === "touch" || reduced || !hoverMotion.matches) return;
      started = performance.now();
      const initial = parseFloat(getComputedStyle(images[0]).scale) || 1;
      host.classList.add("zoom-active");
      const advance = (now) => {
        const scale =
          initial + (1.18 - initial) * (1 - Math.exp(-(now - started) / 18000));
        images.forEach((img) => (img.style.scale = String(scale)));
        tick = requestAnimationFrame(advance);
      };
      cancelAnimationFrame(tick);
      tick = requestAnimationFrame(advance);
    });
    host.addEventListener("pointerleave", stop);
    host.addEventListener("pointercancel", stop);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
    });
  }
  installImageZoom($(".gallery"), $$(".slide img"));
  $$(
    ".gallery-thumbs button,.image-frame,.creative-media,.photo-dialog",
  ).forEach((host) =>
    installImageZoom(host, [...host.querySelectorAll("img")]),
  );
  let ticking = false;
  function progress() {
    document.documentElement.style.setProperty(
      "--scroll",
      `${(100 * scrollY) / Math.max(1, document.documentElement.scrollHeight - innerHeight)}%`,
    );
    ticking = false;
  }
  addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        requestAnimationFrame(progress);
        ticking = true;
      }
    },
    { passive: true },
  );
  progress();
})();
