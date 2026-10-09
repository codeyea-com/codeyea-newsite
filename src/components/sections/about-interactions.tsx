"use client";
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import type { AboutSection } from "@/schemas/about";
import { AboutImage } from "./about-image";

const capableViewport =
  "(min-width:1200px) and (min-height:700px) and (hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)";
const orderedItems = (section: AboutSection) =>
  section.items
    .filter((item) => item.enabled)
    .sort((a, b) => a.position - b.position);

export function AboutCapabilities({ section }: { section: AboutSection }) {
  const items = orderedItems(section),
    root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const preference = window.matchMedia(capableViewport);
    let observer: IntersectionObserver | undefined;
    const setup = () => {
      observer?.disconnect();
      element.classList.toggle("is-enhanced", preference.matches);
      if (!preference.matches) return;
      const visible = new Map<number, number>();
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = Number(
              (entry.target as HTMLElement).dataset.capabilityIndex,
            );
            if (entry.isIntersecting)
              visible.set(index, entry.intersectionRatio);
            else visible.delete(index);
          }
          const best = [...visible].sort((a, b) => b[1] - a[1])[0];
          if (best) setActive(best[0]);
        },
        {
          rootMargin: "-20% 0px -30% 0px",
          threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
        },
      );
      element
        .querySelectorAll("[data-capability-index]")
        .forEach((item) => observer?.observe(item));
    };
    setup();
    preference.addEventListener("change", setup);
    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", setup);
      element.classList.remove("is-enhanced");
    };
  }, [section]);
  return (
    <div className="about-capability-layout" ref={root}>
      <div className="about-capability-stage" aria-hidden="true">
        <div className="about-capability-stack">
          {items.map((item, index) => (
            <div
              key={item.id}
              className={
                "about-capability-layer" +
                (index === active ? " is-active" : "")
              }
            >
              <AboutImage
                media={
                  item.media
                    ? { ...item.media, decorative: true, alt: "" }
                    : undefined
                }
              />
              <span className="about-capability-caption">
                {String(index + 1).padStart(2, "0")} /{" "}
                {String(items.length).padStart(2, "0")} — {item.title}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="about-capability-copy">
        {items.map((item, index) => (
          <article
            key={item.id}
            className={
              "about-capability-item" + (index === active ? " is-active" : "")
            }
            data-capability-index={index}
          >
            <div className="about-capability-inline">
              <AboutImage media={item.media} />
            </div>
            <div className="about-capability-narrative">
              <span className="about-item-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function AboutProcess({ section }: { section: AboutSection }) {
  const items = orderedItems(section),
    root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let next = index;
    if (event.key === "ArrowRight" || event.key === "ArrowDown")
      next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
      next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    root.current
      ?.querySelectorAll<HTMLButtonElement>(".about-process-step")
      [next]?.focus();
  };
  return (
    <div
      ref={root}
      className="about-process-sequence"
      style={
        {
          "--process-count": items.length,
          "--process-progress":
            items.length > 1 ? `${(active / (items.length - 1)) * 100}%` : "0%",
        } as CSSProperties
      }
    >
      <div className="about-process-track" aria-hidden="true">
        <span />
      </div>
      {items.map((item, index) => (
        <article
          key={item.id}
          className={
            "about-process-item" + (index === active ? " is-active" : "")
          }
        >
          <h3>
            <button
              type="button"
              className="about-process-step"
              aria-current={index === active ? "step" : undefined}
              aria-controls={`${item.id}-description`}
              onClick={() => setActive(index)}
              onKeyDown={(event) => keyboard(event, index)}
            >
              <span className="about-process-number" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span>{item.title}</span>
            </button>
          </h3>
          <p id={`${item.id}-description`}>{item.body}</p>
        </article>
      ))}
    </div>
  );
}

/** Content remains visible if JavaScript or motion APIs are unavailable. */
export function AboutMotion() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".about-page");
    if (
      !root ||
      !("IntersectionObserver" in window) ||
      !Element.prototype.animate
    )
      return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)"),
      seen = new WeakSet<Element>(),
      animations = new Map<Element, Animation[]>();
    let observer: IntersectionObserver | undefined;
    const cancel = (element: Element) => {
      animations.get(element)?.forEach((animation) => animation.cancel());
      animations.delete(element);
    };
    const clear = () => {
      observer?.disconnect();
      animations.forEach((list) =>
        list.forEach((animation) => animation.cancel()),
      );
      animations.clear();
    };
    const setup = () => {
      clear();
      if (reduced.matches) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const element = entry.target as HTMLElement;
            if (!entry.isIntersecting) {
              cancel(element);
              return;
            }
            if (seen.has(element) || document.hidden) return;
            seen.add(element);
            element.classList.add("is-revealed");
            const children = [
                ...element.querySelectorAll<HTMLElement>(
                  "[data-about-stagger]",
                ),
              ],
              targets = children.length ? children : [element];
            const list = targets.map((target, index) =>
              target.animate(
                [
                  {
                    opacity: 0.35,
                    transform: "translateY(18px)",
                    clipPath: "inset(0 0 16% 0)",
                  },
                  {
                    opacity: 1,
                    transform: "translateY(0)",
                    clipPath: "inset(0 0 0% 0)",
                  },
                ],
                {
                  duration: 650,
                  delay: Math.min(
                    Number(target.dataset.aboutStagger ?? index) * 65,
                    260,
                  ),
                  easing: "cubic-bezier(.22,1,.36,1)",
                  fill: "backwards",
                },
              ),
            );
            animations.set(element, list);
            Promise.all(
              list.map((animation) =>
                animation.finished.catch(() => undefined),
              ),
            ).then(() => {
              if (animations.get(element) === list) animations.delete(element);
            });
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
      );
      root
        .querySelectorAll<HTMLElement>("[data-about-reveal]")
        .forEach((element) => observer?.observe(element));
    };
    const visibility = () => {
      if (document.hidden) {
        animations.forEach((_list, element) => cancel(element));
        root
          .querySelector("main")
          ?.getAnimations({ subtree: true })
          .forEach((animation) => animation.cancel());
      }
    };
    const offscreen = new IntersectionObserver((entries) => {
      for (const entry of entries)
        if (!entry.isIntersecting)
          entry.target
            .getAnimations({ subtree: true })
            .forEach((animation) => animation.cancel());
    });
    root
      .querySelectorAll(".about-section")
      .forEach((section) => offscreen.observe(section));
    setup();
    reduced.addEventListener("change", setup);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      clear();
      offscreen.disconnect();
      reduced.removeEventListener("change", setup);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);
  return null;
}
