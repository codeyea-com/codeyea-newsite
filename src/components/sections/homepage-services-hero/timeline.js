import { renderAutomation } from "./automation";
import { buttonMarkup } from "./content";
// Animate only existing SSR markup. Never append a replacement hero or change page metadata.
export function mountHero(root, ar, slides) {
  const $ = (s) => root.querySelector(s.replace(/^#/, "#home-hero-")),
    $$ = (s) => [...root.querySelectorAll(s)];
  const label = (a, e) => (ar ? a : e),
    base = ar ? "/ar" : "",
    duration = 10;
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const sceneEls = $$(".scene"),
    controller = new AbortController();
  const on = (node, event, handler) =>
    node.addEventListener(event, handler, { signal: controller.signal });
  const setText = (el, text) => {
    if (el.textContent !== text) el.textContent = text;
  };
  const buttonLabel = (el, text) => {
    el.setAttribute("aria-label", text);
    el.innerHTML = buttonMarkup(text, ar);
  };
  let index = 0,
    time = 0,
    playing = !reduced.matches,
    last = 0,
    frame = 0,
    visible = true,
    disposed = false;
  const clamp = (n) => Math.max(0, Math.min(1, n)),
    ease = (p) => 1 - Math.pow(1 - clamp(p), 3),
    range = (t, s, d) => clamp((t - s) / d);
  function setSlide(i, reset = true) {
    index = (i + slides.length) % slides.length;
    if (reset) time = playing ? 0 : 6;
    const s = slides[index];
    sceneEls.forEach((el, j) => {
      el.classList.toggle("is-active", j === index);
      el.setAttribute("aria-hidden", String(j !== index));
      el.inert = j !== index;
    });
    $$(".slide-tab").forEach((b, j) => {
      b.setAttribute("aria-selected", String(j === index));
      b.tabIndex = j === index ? 0 : -1;
      b.style.setProperty("--progress", "0");
    });
    $("#eyebrow").textContent = s.eyebrow;
    $("#phrase").textContent = s.phrase;
    $("#description").textContent = s.description;
    buttonLabel($("#service-link"), s.cta);
    $("#service-link").href = base + s.url;
    $("#slide-count").textContent =
      `0${index + 1} / ${String(slides.length).padStart(2, "0")}`;
    render();
  }
  function motion(el, t) {
    const p = ease(
        range(
          t,
          Number(el.dataset.start || 0),
          Number(el.dataset.duration || 0.7),
        ),
      ),
      kind = el.dataset.motion;
    el.style.opacity = p;
    el.style.transform =
      kind === "rise"
        ? `translateY(${(1 - p) * 22}px)`
        : kind === "pop"
          ? `translateY(${(1 - p) * 10}px) scale(${0.91 + 0.09 * p})`
          : "none";
  }
  function render() {
    const t = reduced.matches ? 6 : time,
      scene = sceneEls[index],
      closing = playing && !reduced.matches ? ease((duration - t) / 0.55) : 1;
    scene.style.opacity = closing;
    scene.querySelectorAll("[data-motion]").forEach((el) => motion(el, t));
    const titleProgress = ease(range(t, 0.05, 1.05)),
      phraseProgress = ease(range(t, 0.22, 1.1)),
      eyebrowProgress = ease(range(t, 0, 0.85));
    $("#fixed-title").style.opacity = titleProgress * closing;
    $("#fixed-title").style.transform =
      `translateY(${(1 - titleProgress) * 42}px)`;
    $("#phrase").style.opacity = phraseProgress * closing;
    $("#phrase").style.transform = `translateY(${(1 - phraseProgress) * 48}px)`;
    $("#eyebrow").style.opacity = eyebrowProgress * closing;
    $("#eyebrow").style.transform =
      `translateY(${(1 - eyebrowProgress) * 24}px)`;
    $("#description").style.opacity = closing;
    scene.querySelectorAll(".typed").forEach((el) => {
      const text = el.dataset.text,
        p = range(t, Number(el.dataset.typeStart), 1.5);
      setText(el, text.slice(0, Math.floor(text.length * p)));
      el.classList.toggle("done", p === 1);
    });
    const tools = scene.querySelector(".toolbar-strip");
    if (tools) {
      tools.style.clipPath = `inset(0 ${(1 - ease(range(t, 0.9, 0.9))) * 100}% 0 0)`;
      const trigger = scene.querySelector(".tool-trigger");
      trigger.classList.toggle("clicked", t > 0.65 && t < 1.4);
    }
    if (index === 0) {
      const p = ease(range(t, 1.2, 3)),
        gauge = scene.querySelector(".gauge");
      gauge.style.color = `hsl(${5 + 143 * p} 68% 53%)`;
      setText(scene.querySelector(".gauge-value b"), (99.99 * p).toFixed(2));
      scene.querySelector(".gauge-progress").style.strokeDashoffset =
        156 * (1 - p);
      scene.querySelector(".needle").style.transform =
        `rotate(${-90 + 180 * p}deg)`;
    }
    if (index === 1) {
      scene.querySelector(".app-scroll").style.transform =
        `translateY(${-7 * ease(range(t, 2.0, 2.2))}%)`;
      const pos = Math.min(3, Math.floor(range(t, 3, 2.5) * 4));
      scene.querySelector(".rail-highlight").style.transform =
        `translateY(${pos * 5.2}cqw)`;
    }
    if (index === 2) {
      const p = ease(range(t, 2.2, 2.5));
      setText(
        scene.querySelector(".reach-count"),
        Math.round(125000 * p).toLocaleString("en-US"),
      );
      scene.querySelector(".growth-line").style.strokeDasharray = "1";
      scene.querySelector(".growth-line").style.strokeDashoffset = 1 - p;
      scene.querySelector(".chart-area").style.opacity = p;
      scene
        .querySelectorAll(".network")
        .forEach((el, i) =>
          el.classList.toggle("shine", t > 3.2 + i * 0.2 && t < 4.2 + i * 0.2),
        );
    }
    if (index === 3)
      renderAutomation(scene, t, { ease, range, reduced: reduced.matches });
    $$(".slide-tab")[index].style.setProperty(
      "--progress",
      String(time / duration),
    );
    setText($("#play"), playing ? "Ⅱ" : "▶");
    $("#play").setAttribute(
      "aria-label",
      playing ? label("إيقاف مؤقت", "Pause") : label("تشغيل", "Play"),
    );
  }

  function tick(now) {
    frame = 0;
    if (disposed) return;
    const delta = last ? (now - last) / 1000 : 0;
    last = now;
    time += Math.min(delta, 0.1);
    if (time >= duration) setSlide(index + 1);
    render();
    schedule();
  }
  function schedule() {
    if (
      !frame &&
      !disposed &&
      playing &&
      visible &&
      !document.hidden &&
      !reduced.matches
    )
      frame = requestAnimationFrame(tick);
  }
  function suspend() {
    cancelAnimationFrame(frame);
    frame = 0;
    last = 0;
  }
  $$(".slide-tab").forEach((button, i) => {
    on(button, "click", () => {
      setSlide(i);
      schedule();
    });
    on(button, "keydown", (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const direction =
        getComputedStyle($(".slide-control")).direction === "rtl" ? -1 : 1;
      let next;
      if (e.key === "ArrowRight") next = index + direction;
      if (e.key === "ArrowLeft") next = index - direction;
      if (e.key === "Home") next = 0;
      if (e.key === "End") next = slides.length - 1;
      if (next !== undefined) {
        e.preventDefault();
        setSlide(next);
        $$(".slide-tab")[index].focus();
        schedule();
      }
    });
  });
  on($("#play"), "click", () => {
    playing = !playing;
    suspend();
    render();
    schedule();
  });
  on($("#replay"), "click", () => {
    playing = !reduced.matches;
    suspend();
    setSlide(index);
    schedule();
  });
  on(document, "visibilitychange", () => {
    suspend();
    schedule();
  });
  on(reduced, "change", () => {
    playing = !reduced.matches;
    suspend();
    render();
    schedule();
  });
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    suspend();
    schedule();
  });
  observer.observe(root);
  root.classList.add("is-enhanced");
  setSlide(0, false);
  schedule();
  return () => {
    disposed = true;
    suspend();
    controller.abort();
    observer.disconnect();
    root.classList.remove("is-enhanced");
  };
}
