import type {
  CSSProperties,
  KeyboardEvent,
  PointerEvent,
  RefObject,
} from "react";
import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
const arrow = (
  <svg
    className="hp-chevron"
    viewBox="0 0 12 8"
    width="12"
    height="8"
    fill="none"
    aria-hidden="true"
  >
    <path d="m1 1 5 5 5-5" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);
const industryIconPaths: Record<string, string[]> = {
  "healthcare and aesthetic clinics": [
    "M12 3v18M3 12h18",
    "M5 5h.01M19 19h.01",
  ],
  construction: [
    "M3 21h18M5 21V9l7-5 7 5v12",
    "M9 21v-6h6v6",
    "M9 10h.01M15 10h.01",
  ],
  "real estate": [
    "M3 21h18M5 21V8h14v13",
    "M9 12h2m2 0h2M9 16h2m2 0h2",
    "M8 8V4h8v4",
  ],
  ecommerce: [
    "M3 4h2l2.2 11.2a2 2 0 0 0 2 1.6h8.9a2 2 0 0 0 2-1.6L22 8H6",
    "M10 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2ZM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z",
  ],
  legal: ["M12 3v17M5 7h14M5 7l-3 6h6L5 7Zm14 0-3 6h6l-3-6ZM7 21h10M9 17h6"],
  "oil and gas": [
    "M12 3c-2.4 3.5-6 7.2-6 11a6 6 0 0 0 12 0c0-3.8-3.6-7.5-6-11Z",
    "M9 15a3 3 0 0 0 3 3",
  ],
  roofing: ["m3 11 9-7 9 7", "M5 10v10h14V10", "M10 20v-6h4v6"],
  "small business": [
    "M3 10h18l-2-6H5l-2 6Z",
    "M5 10v10h14V10",
    "M9 20v-6h6v6",
    "M3 10a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0",
  ],
  "event coordinators": [
    "M4 6h16v15H4z",
    "M8 3v6m8-6v6M4 11h16",
    "M8 15h.01M12 15h.01M16 15h.01",
  ],
  "online magazine": [
    "M4 5h11a3 3 0 0 1 3 3v12H7a3 3 0 0 1-3-3V5Z",
    "M18 8h2v12h-2",
    "M8 9h6M8 13h6M8 17h4",
  ],
  "fashion and lifestyle": ["M4 20h16L12 9 4 20Z", "M9 10a3 3 0 1 1 6 0"],
  "beauty skincare and med spa": [
    "m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7L12 2Z",
    "m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z",
  ],
  "restaurants cafes and bakeries": [
    "M4 3v7a3 3 0 0 0 6 0V3M7 3v18M17 3v18M17 3c3 2 3 7 0 9",
  ],
  "solar energy": [
    "M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4m0-12.8L17 7M7 17l-1.4 1.4",
    "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  ],
};
export function IndustryIcon({ title }: { title: string }) {
  const key = title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  const paths = industryIconPaths[key] ?? [
    "M4 20h16M5 20V9l7-6 7 6v11",
    "M9 20v-6h6v6",
  ];
  return (
    <span className="cy-industry-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        width="22"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {paths.map((d, index) => (
          <path d={d} key={index} />
        ))}
      </svg>
    </span>
  );
}
export function approvedNavigationView(
  menu: EditorObject,
  controls?: {
    active: string | null;
    current: string | null;
    buttons: RefObject<Record<string, HTMLButtonElement | null>>;
    panels: RefObject<Record<string, HTMLDivElement | null>>;
    open: (id: string) => void;
    close: () => void;
    leave: () => void;
    cancel: () => void;
    setCurrent: (value: string | null) => void;
    keyboard: (event: KeyboardEvent, id: string) => void;
    linkProps: (key: string) => Record<string, unknown>;
  },
) {
  const items = enabledItems(menu.items),
    roots = items.filter((i) => !i.parentId);
  const fallback: NonNullable<typeof controls> = {
    active: null,
    current: null,
    buttons: { current: {} },
    panels: { current: {} },
    open: () => {},
    close: () => {},
    leave: () => {},
    cancel: () => {},
    setCurrent: () => {},
    keyboard: () => {},
    linkProps: () => ({}),
  };
  const {
    active,
    current,
    buttons,
    panels,
    open,
    close,
    leave,
    cancel,
    setCurrent,
    keyboard,
    linkProps,
  } = controls ?? fallback;
  const navigation = roots.map((item) => {
    const id = str(item.id),
      children = items.filter((c) => c.parentId === id);
    return (
      <span
        className="hp-nav-item cy-host-item"
        key={id}
        onPointerEnter={(e) => {
          if (children.length && e.pointerType === "mouse") open(id);
        }}
        onPointerLeave={leave}
      >
        {children.length ? (
          <button
            ref={(el) => {
              buttons.current[id] = el;
            }}
            className="cy-host-toggle"
            aria-expanded={active === id}
            aria-controls={"approved-" + id}
            onClick={() => (active === id ? close() : open(id))}
            onKeyDown={(e) => {
              keyboard(e, id);
              if (e.key === "ArrowDown") {
                e.preventDefault();
                open(id);
                requestAnimationFrame(() =>
                  panels.current[id]?.querySelector("a")?.focus(),
                );
              }
            }}
            onBlur={(e) => {
              if (!panels.current[id]?.contains(e.relatedTarget as Node))
                leave();
            }}
          >
            {str(item.title)}
            {arrow}
          </button>
        ) : (
          <a href={str(item.href)}>{str(item.title)}</a>
        )}
      </span>
    );
  });
  const panelElements = roots
    .filter((i) => items.some((c) => c.parentId === i.id))
    .map((item) => {
      const id = str(item.id),
        title = str(item.title),
        children = items.filter((c) => c.parentId === id),
        host = title === "Hosting",
        service = title === "Services",
        industry = title === "Industries",
        feature = id + "-feature";
      return (
        <div
          ref={(el) => {
            panels.current[id] = el;
          }}
          id={"approved-" + id}
          key={id}
          className={"cy-host-panel" + (industry ? " cy-industry-panel" : "") + (current ? " cy-link-active" : "")}
          hidden={active !== id}
          onPointerEnter={cancel}
          onPointerLeave={() => {
            setCurrent(null);
            leave();
          }}
          onKeyDown={(e) => keyboard(e, id)}
          onBlur={(e) => {
            if (
              !e.currentTarget.contains(e.relatedTarget as Node) &&
              !buttons.current[id]?.contains(e.relatedTarget as Node)
            )
              close();
          }}
        >
          <div
            className="cy-host-links"
            style={
              {
                gridTemplateRows: `repeat(${Math.ceil(children.length / (industry ? 3 : 2))},auto)`,
              } as CSSProperties
            }
          >
            {children.map((child) => (
              <a
                className={
                  "cy-host-link" + (current === child.id ? " cy-current" : "")
                }
                href={str(child.href)}
                key={str(child.id)}
                {...linkProps(str(child.id))}
              >
                <span className="cy-host-line">
                  {industry ? (
                    <IndustryIcon title={str(child.title)} />
                  ) : (
                    <i aria-hidden="true">{str(child.icon)}</i>
                  )}
                  <strong>{str(child.title)}</strong>
                </span>
                <span className="cy-host-desc">{str(child.body)}</span>
              </a>
            ))}
          </div>
          <aside className="cy-host-feature">
            <span>
              {host
                ? "KEEP YOUR WEBSITE MOVING"
                : service
                  ? "IDEAS INTO EXPERIENCES"
                  : "BUILT AROUND YOUR INDUSTRY"}
            </span>
            <img
              src={
                "/homepage/" +
                (host ? "support" : service ? "project-web" : "about") +
                ".webp"
              }
              alt={
                host
                  ? "Technical support and website care"
                  : service
                    ? "Digital design and development"
                    : "Business collaboration"
              }
            />
            <h3>
              {host ? (
                <>
                  One place for hosting.
                  <br />
                  Support when you need it.
                </>
              ) : service ? (
                <>
                  The right services.
                  <br />
                  One connected direction.
                </>
              ) : (
                <>
                  Your business.
                  <br />A relevant digital approach.
                </>
              )}
            </h3>
            <a
              href={
                host
                  ? str(
                      children.find(
                        (child) => str(child.title) === "Technical Support",
                      )?.href,
                    )
                  : str(item.href)
              }
              className={current === feature ? "cy-current" : ""}
              {...linkProps(feature)}
            >
              Explore {host ? "technical support" : title.toLowerCase()}{" "}
              <span aria-hidden="true">↗</span>
            </a>
          </aside>
        </div>
      );
    });
  return { navigation, panels: panelElements };
}
