"use client";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { str } from "@/content/homepage-render";
import type { EditorObject } from "@/schemas/homepage-editor";
import useEmblaCarousel from "embla-carousel-react";
import "@/styles/homepage-carousel-final.css";
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

type CarouselItem = {
  id: string;
  title: string;
  image: string;
  srcSet?: string;
  body?: string;
  category?: string;
  href?: string;
  alt?: string;
  focal?: string;
};
export function Carousel({
  items,
  label,
  variant,
  autoplay = false,
  filterable = false,
  intro,
}: {
  items: CarouselItem[];
  label: string;
  variant: "industry" | "project";
  autoplay?: boolean;
  filterable?: boolean;
  intro?: EditorObject;
}) {
  const [filter, setFilter] = useState("All");
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);
  const cursor = useRef<HTMLSpanElement>(null);
  const pointerFrame = useRef(0);
  const pointerPosition = useRef({ x: 0, y: 0, show: false, label: "Drag" });
  useEffect(() => () => cancelAnimationFrame(pointerFrame.current), []);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [selected, setSelected] = useState(0);
  const [prev, setPrev] = useState(false);
  const [next, setNext] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const root = useRef<HTMLElement>(null);
  const allowed = useMotionEnvironment();
  const id = useId();
  const filtered =
    filter === "All"
      ? items
      : items.filter((item) =>
          item.category
            ?.split(",")
            .map((c) => c.trim())
            .includes(filter),
        );
  // Spread the finite snaps between the first and last cards. Clamping start
  // snaps would give several desktop cards the same terminal position.
  const industryAlignment = useCallback(
    (viewSize: number, snapSize: number, index: number) =>
      Math.max(0, viewSize - snapSize - 24) *
      (index / Math.max(filtered.length - 1, 1)),
    [filtered.length],
  );
  const [viewportRef, api] = useEmblaCarousel({
    align: variant === "industry" ? industryAlignment : "start",
    loop: false,
    containScroll: false,
    duration: 36,
  });
  useEffect(() => {
    if (!api) return;
    const sync = () => {
      setSelected(api.selectedScrollSnap());
      setPrev(api.canScrollPrev());
      setNext(api.canScrollNext());
    };
    const expansion = () => {
      if (variant === "project")
        setExpanded(
          api.selectedScrollSnap() > 0 || api.scrollProgress() > 0.003,
        );
    };
    const down = () => setDragging(true);
    const up = () => setDragging(false);
    sync();
    api.on("select", sync);
    api.on("reInit", sync);
    api.on("scroll", expansion);
    api.on("select", expansion);
    api.on("pointerDown", down);
    api.on("pointerUp", up);
    return () => {
      api.off("select", sync);
      api.off("reInit", sync);
      api.off("scroll", expansion);
      api.off("select", expansion);
      api.off("pointerDown", down);
      api.off("pointerUp", up);
    };
  }, [api, variant]);
  useEffect(() => {
    setExpanded(false);
    api?.reInit();
    api?.scrollTo(0, true);
  }, [api, filter, items]);
  useEffect(() => {
    const element = root.current;
    if (!element || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    if (
      !api ||
      !autoplay ||
      paused ||
      hovered ||
      focused ||
      dragging ||
      !visible ||
      !allowed ||
      filtered.length < 2
    )
      return;
    if (variant === "project") {
      const timer = window.setInterval(
        () => (api.canScrollNext() ? api.scrollNext() : api.scrollTo(0)),
        5000,
      );
      return () => window.clearInterval(timer);
    }

    const element = root.current;
    const track = element?.querySelector<HTMLElement>(".hp-carousel-track");
    if (!element || !track) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer = 0;
    let animation: Animation | undefined;
    let cancelled = false;
    let rewinding = false;
    const cancel = () => {
      cancelled = true;
      window.clearTimeout(timer);
      animation?.cancel();
      delete element.dataset.rewinding;
    };
    const canRun = () =>
      !cancelled &&
      !document.hidden &&
      !motion.matches &&
      !element.matches(":hover") &&
      !element.contains(document.activeElement);
    const rewind = async () => {
      if (!canRun()) return;
      rewinding = true;
      element.dataset.rewinding = "out";
      animation = track.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 180,
        easing: "ease-out",
        fill: "forwards",
      });
      try {
        await animation.finished;
        if (!canRun()) {
          cancel();
          return;
        }
        // Jump only while invisible; never animate through the whole rail.
        api.scrollTo(0, true);
        animation.cancel();
        element.dataset.rewinding = "in";
        animation = track.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: 220,
          easing: "ease-in",
          fill: "forwards",
        });
        await animation.finished;
        animation.cancel();
        delete element.dataset.rewinding;
        rewinding = false;
        schedule();
      } catch {
        // Interaction or an environment change cancels and restores opacity.
      }
    };
    const schedule = () => {
      window.clearTimeout(timer);
      if (!canRun() || rewinding) return;
      timer = window.setTimeout(() => {
        if (!canRun()) return;
        if (api.canScrollNext()) api.scrollNext();
        else void rewind();
      }, api.canScrollNext() ? 5000 : 6000);
    };
    const reinitialize = () => {
      cancel();
      cancelled = false;
      rewinding = false;
      schedule();
    };
    // Synchronous cancellation also protects the interval before React rerenders.
    element.addEventListener("mouseenter", cancel);
    element.addEventListener("focusin", cancel);
    element.addEventListener("pointerdown", cancel);
    document.addEventListener("visibilitychange", cancel);
    motion.addEventListener("change", cancel);
    api.on("select", schedule);
    api.on("reInit", reinitialize);
    schedule();
    return () => {
      cancel();
      element.removeEventListener("mouseenter", cancel);
      element.removeEventListener("focusin", cancel);
      element.removeEventListener("pointerdown", cancel);
      document.removeEventListener("visibilitychange", cancel);
      motion.removeEventListener("change", cancel);
      api.off("select", schedule);
      api.off("reInit", reinitialize);
    };
  }, [
    api,
    autoplay,
    paused,
    hovered,
    focused,
    dragging,
    visible,
    allowed,
    filtered.length,
    variant,
  ]);
  const categories = [
    "All",
    ...new Set(
      items.flatMap((item) =>
        (item.category ?? "")
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      ),
    ),
  ];
  return (
    <section
      ref={root}
      className={`hp-carousel hp-carousel--${variant} ${expanded ? "is-expanded" : ""}`}
      aria-label={label}
      aria-roledescription="carousel"
      onPointerMove={(event) => {
        if (event.pointerType !== "mouse" || !allowed) return;
        const target = event.target as HTMLElement;
        pointerPosition.current = {
          x: event.clientX,
          y: event.clientY,
          show:
            !!target.closest(".hp-carousel-image") && !target.closest("button"),
          label:
            variant === "project" &&
            !!target.closest("a.hp-carousel-card[href]")
              ? "Explore"
              : "Drag",
        };
        if (pointerFrame.current) return;
        pointerFrame.current = requestAnimationFrame(() => {
          pointerFrame.current = 0;
          if (cursor.current) {
            cursor.current.style.transform =
              "translate3d(" +
              pointerPosition.current.x +
              "px," +
              pointerPosition.current.y +
              "px,0)";
            cursor.current.style.opacity = pointerPosition.current.show
              ? "1"
              : "0";
            const text = cursor.current.firstElementChild;
            if (text) text.textContent = pointerPosition.current.label;
          }
        });
      }}
      onPointerLeave={() => {
        pointerPosition.current.show = false;
        if (cursor.current) cursor.current.style.opacity = "0";
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget))
          setFocused(false);
      }}
    >
      {variant === "project" && (
        <div className="hp-project-intro-shell">
          <div className="hp-project-intro" inert={expanded}>
            <p className="hp-eyebrow">
              {str(intro?.eyebrow) || "Latest projects"}
            </p>
            <h2 id="work-title">
              {str(intro?.heading) || "Selected Case Studies"}
            </h2>
            <div className="hp-carousel-filters" aria-label="Filter projects">
              {categories.map((category) => (
                <button
                  type="button"
                  key={category}
                  aria-pressed={filter === category}
                  onClick={() => {
                    setFilter(category);
                    setAnnouncement(category + " projects selected");
                  }}
                >
                  {category}
                </button>
              ))}
            </div>
            <a
              className="hp-see-more"
              href={str(intro?.ctaHref) || "#project-list"}
              onClick={() => {
                if (!intro?.ctaHref || intro.ctaHref === "#project-list")
                  api?.scrollNext(!allowed);
              }}
            >
              {str(intro?.ctaLabel) || "See More"}{" "}
              <span aria-hidden="true">→</span>
            </a>
            <small>Reference imagery; project details awaiting approval.</small>
          </div>
        </div>
      )}
      {filterable && variant !== "project" && (
        <div className="hp-carousel-filters" aria-label="Filter projects">
          {categories.map((category) => (
            <button
              type="button"
              key={category}
              aria-pressed={filter === category}
              onClick={() => {
                setFilter(category);
                const count =
                  category === "All"
                    ? items.length
                    : items.filter((item) => item.category === category).length;
                setAnnouncement(
                  `${category}: ${count} projects. Showing the first project.`,
                );
              }}
            >
              {category}
            </button>
          ))}
        </div>
      )}
      <div
        className="hp-carousel-stage"
        id={variant === "project" ? "project-list" : undefined}
      >
        <div
          id={id}
          ref={viewportRef}
          className="hp-carousel-viewport"
          tabIndex={0}
          aria-label={`${label}. Use left and right arrow keys to browse.`}
          onKeyDown={(event) => {
            if (event.target !== event.currentTarget) return;
            if (event.key === "ArrowRight") {
              event.preventDefault();
              api?.scrollNext(!allowed);
            }
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              api?.scrollPrev(!allowed);
            }
          }}
        >
          <div className="hp-carousel-track">
            {filtered.map((item, index) => {
              const content = (
                <>
                  <div className="hp-carousel-image">
                    <img
                      src={item.image}
                      srcSet={item.srcSet}
                      sizes="(max-width: 767px) 90vw, 50vw"
                      alt={item.alt ?? ""}
                      style={{ objectPosition: item.focal }}
                      width={1000}
                      height={800}
                      loading="lazy"
                      decoding="async"
                    />
                    {variant === "project" && (
                      <span className="hp-project-vertical" aria-hidden="true">
                        {item.title}
                      </span>
                    )}
                  </div>
                  <div
                    className={
                      variant === "project"
                        ? "hp-project-metadata hp-interaction-sr"
                        : "hp-carousel-copy"
                    }
                  >
                    {item.category && (
                      <span className="hp-carousel-category">
                        {item.category}
                      </span>
                    )}
                    <h3>{item.title}</h3>
                    {item.body && <p>{item.body}</p>}
                    {item.href && (
                      <span
                        aria-hidden="true"
                        className="hp-carousel-link-arrow"
                      >
                        ↗
                      </span>
                    )}
                  </div>
                </>
              );
              return (
                <article
                  className="hp-carousel-slide"
                  key={item.id}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} of ${filtered.length}`}
                >
                  {item.href ? (
                    <a className="hp-carousel-card" href={item.href}>
                      {content}
                    </a>
                  ) : (
                    <div className="hp-carousel-card" tabIndex={0}>
                      {content}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
        <div className="hp-carousel-controls">
          <span className="hp-carousel-count">
            <span key={selected}>
              {String(filtered.length ? selected + 1 : 0).padStart(2, "0")}
            </span>
            <span className="hp-carousel-progress" aria-hidden="true">
              <span
                style={{
                  transform:
                    "scaleX(" +
                    (selected + 1) / Math.max(filtered.length, 1) +
                    ")",
                }}
              />
            </span>
            <span className="hp-interaction-sr">of </span>
            {String(filtered.length).padStart(2, "0")}
          </span>
          <div className="hp-carousel-buttons">
            {autoplay && (
              <button
                type="button"
                className="hp-carousel-pause"
                onClick={() => setPaused((value) => !value)}
                aria-label={
                  paused
                    ? `Resume ${label} autoplay`
                    : `Pause ${label} autoplay`
                }
              >
                {paused ? "Play" : "Pause"}
              </button>
            )}
            <button
              type="button"
              aria-label={`Previous ${label} slide`}
              aria-controls={id}
              disabled={!prev}
              onClick={() => api?.scrollPrev(!allowed)}
            >
              ←
            </button>
            <button
              type="button"
              aria-label={`Next ${label} slide`}
              aria-controls={id}
              disabled={!next}
              onClick={() => api?.scrollNext(!allowed)}
            >
              →
            </button>
          </div>
        </div>
      </div>
      <span ref={cursor} className="hp-media-cursor" aria-hidden="true">
        <span>Drag</span>
      </span>
      <span className="hp-interaction-sr" role="status">
        {announcement}
      </span>
    </section>
  );
}
