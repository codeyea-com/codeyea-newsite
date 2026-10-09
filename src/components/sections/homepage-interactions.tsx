"use client";

import { useEffect, useRef, useState } from "react";
import { EditorialCopy } from "./homepage-editorial-copy";
import { FlowAction } from "./homepage-flow-action";

export { Carousel } from "./homepage-carousel";

function useMotionEnvironment() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!query.matches && !document.hidden);
    update();
    query.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      query.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);
  return allowed;
}

export function WordRotator({ words }: { words: string[] }) {
  const root = useRef<HTMLSpanElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) =>
      setVisible(entry.isIntersecting),
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const [index, setIndex] = useState(0);
  const allowed = useMotionEnvironment();
  useEffect(() => {
    if (!allowed || !visible || words.length < 2) return;
    const timer = window.setInterval(
      () => setIndex((value) => (value + 1) % words.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [allowed, visible, words.length]);
  return (
    <span ref={root} className="hp-word-rotator">
      <span className="hp-interaction-sr">{words.join(", ")}</span>
      <span aria-hidden="true" className="hp-word-window">
        {words.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className={`hp-word ${i === index % Math.max(words.length, 1) ? "is-active" : ""}`}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}

type FlowPanel = {
  id: string;
  title: string;
  body: string;
  image: string;
  srcSet?: string;
  kicker: string;
  alt?: string;
  focal?: string;
  ctaLabel?: string;
  ctaHref?: string;
};
export function ServiceFlow({ panels }: { panels: FlowPanel[] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element || panels.length === 0) return;
    const query = window.matchMedia(
      "(min-width: 1200px) and (prefers-reduced-motion: no-preference)",
    );
    let disposed = false;
    let teardown: (() => void) | undefined;
    let generation = 0;
    const setup = async () => {
      const current = ++generation;
      teardown?.();
      teardown = undefined;
      if (!query.matches) return;
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed || current !== generation || !query.matches) return;
      gsap.registerPlugin(ScrollTrigger);
      element.classList.add("is-enhanced");
      const media = element.querySelector<HTMLElement>(".hp-flow-media")!;
      const images = Array.from(media.querySelectorAll("img"));
      const copy = Array.from(
        element.querySelectorAll<HTMLElement>(".hp-flow-panel"),
      );
      const context = gsap.context(() => {
        gsap.set(images, { autoAlpha: 0 });
        gsap.set(images[0], { autoAlpha: 1 });
        ScrollTrigger.create({
          trigger: element,
          start: "top top+=115",
          end: "bottom bottom-=30",
          pin: media,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
        const activate = (index: number) => {
          copy.forEach((panel, i) => {
            panel.classList.toggle("is-active", i === index);
            panel.setAttribute("aria-current", i === index ? "step" : "false");
          });
          const status = element.querySelector(".hp-flow-status");
          if (status)
            status.textContent =
              index + 1 + " / " + panels.length + " — " + panels[index].kicker;
          gsap.to(images, {
            autoAlpha: (imageIndex) => (imageIndex === index ? 1 : 0),
            duration: 0.45,
            overwrite: true,
          });
        };
        activate(0);
        copy.forEach((panel, index) =>
          ScrollTrigger.create({
            trigger: panel,
            start: "top center",
            end: "bottom center",
            onEnter: () => activate(index),
            onEnterBack: () => activate(index),
          }),
        );
      }, element);
      const refresh = () => ScrollTrigger.refresh();
      images.forEach((image) => image.addEventListener("load", refresh));
      refresh();
      teardown = () => {
        images.forEach((image) => image.removeEventListener("load", refresh));
        context.revert();
        element.classList.remove("is-enhanced");
      };
    };
    void setup();
    query.addEventListener("change", setup);
    return () => {
      disposed = true;
      ++generation;
      query.removeEventListener("change", setup);
      teardown?.();
    };
  }, [panels]);
  return (
    <div className="hp-flow" ref={root}>
      <div className="hp-flow-media" aria-hidden="true">
        {panels.map((panel) => (
          <img
            key={panel.id}
            src={panel.image}
            srcSet={panel.srcSet}
            sizes="(max-width: 1199px) 100vw, 50vw"
            alt={panel.alt ?? ""}
            style={{ objectPosition: panel.focal }}
            width={1000}
            height={1100}
            loading="lazy"
            decoding="async"
          />
        ))}
        <span className="hp-flow-status">
          1 / {panels.length} — {panels[0]?.kicker}
        </span>
      </div>
      <div className="hp-flow-copy">
        {panels.map((panel, index) => (
          <article className="hp-flow-panel" key={panel.id} id={panel.id}>
            <div className="hp-flow-inline-media">
              <img
                src={panel.image}
                srcSet={panel.srcSet}
                sizes="(max-width: 1199px) 100vw, 50vw"
                alt={panel.alt ?? ""}
                style={{ objectPosition: panel.focal }}
                width={1000}
                height={1100}
                loading="lazy"
                decoding="async"
              />
            </div>
            <div className="hp-flow-narrative">
              <span className="hp-flow-kicker">
                {String(index + 1).padStart(2, "0")} / {panel.kicker}
              </span>
              <h3>{panel.title}</h3>
              <EditorialCopy text={panel.body} />
              <FlowAction href={panel.ctaHref} label={panel.ctaLabel} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function HomepageMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".hp");
    const hero = document.querySelector(".hp-hero, .hp-morph-hero");
    const header = document.querySelector(".hp-header");
    if (!root || !hero) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)");
    let countFrame = 0;
    let scrollFrame = 0;
    let pageLength = 1;
    const updateLength = () => {
      pageLength = Math.max(
        1,
        document.documentElement.scrollHeight - innerHeight,
      );
    };
    const resize = new ResizeObserver(updateLength);
    resize.observe(root);
    updateLength();
    const headerObserver = new IntersectionObserver(
      ([entry]) => {
        header?.classList.toggle(
          "is-scrolled",
          entry.boundingClientRect.bottom <= 100,
        );
        hero.classList.toggle(
          "is-inview",
          entry.isIntersecting && !document.hidden,
        );
      },
      { threshold: [0, 1], rootMargin: "-100px 0px 0px" },
    );
    headerObserver.observe(hero);
    const counters = new Set<HTMLElement>();
    const count = (el: HTMLElement) => {
      if (counters.has(el)) return;
      counters.add(el);
      const target = Number(el.dataset.countTo);
      if (reduce.matches) {
        el.textContent = String(target);
        return;
      }
      const start = performance.now();
      const tick = (now: number) => {
        if (document.hidden || reduce.matches) {
          el.textContent = String(target);
          return;
        }
        const t = Math.min(1, (now - start) / 1100);
        el.textContent = String(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) countFrame = requestAnimationFrame(tick);
      };
      countFrame = requestAnimationFrame(tick);
    };
    const entrance = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-inview");
            if (
              entry.target instanceof HTMLElement &&
              entry.target.dataset.countTo
            )
              count(entry.target);
            entrance.unobserve(entry.target);
          }
        }),
      { threshold: 0.15 },
    );
    const setMotion = () => {
      root.classList.toggle("motion-enabled", !reduce.matches);
      if (reduce.matches) {
        cancelAnimationFrame(countFrame);
        root
          .querySelectorAll<HTMLElement>("[data-count-to]")
          .forEach((el) => (el.textContent = el.dataset.countTo!));
      }
    };
    setMotion();
    reduce.addEventListener("change", setMotion);
    root
      .querySelectorAll("[data-motion-enter],[data-count-to]")
      .forEach((el) => entrance.observe(el));
    const scroll = () => {
      if (scrollFrame) return;
      scrollFrame = requestAnimationFrame(() => {
        scrollFrame = 0;
        const progress = root.querySelector<HTMLElement>(".hp-scroll-progress");
        if (progress)
          progress.style.transform =
            "scaleY(" + Math.min(scrollY / pageLength, 1) + ")";
      });
    };
    const visibility = () => {
      root.classList.toggle("is-hidden", document.hidden);
    };
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      resize.disconnect();
      headerObserver.disconnect();
      entrance.disconnect();
      reduce.removeEventListener("change", setMotion);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("scroll", scroll);
      cancelAnimationFrame(countFrame);
      cancelAnimationFrame(scrollFrame);
      root.classList.remove("motion-enabled");
    };
  }, []);
  return <span className="hp-scroll-progress" aria-hidden="true" />;
}
