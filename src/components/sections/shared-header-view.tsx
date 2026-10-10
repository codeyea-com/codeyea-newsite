import type { ReactNode, RefObject, MouseEventHandler } from "react";
import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
export function SharedHeaderView({
  content,
  navigation,
  panels,
  mobile,
  quote,
  homeHref = "#top",
  light = false,
  quoteClick,
}: {
  content: EditorObject;
  navigation: ReactNode;
  panels: ReactNode;
  mobile?: ReactNode;
  quote?: ReactNode;
  homeHref?: string;
  light?: boolean;
  quoteClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return (
    <header className={"hp-header" + (light ? " is-scrolled" : "")}>
      <div className="hp-container hp-header-row">
        <a href={homeHref} aria-label="CODEYEA home" className="hp-logo">
          <img
            className="hp-logo-dark"
            src="/brand/logo-animated-dark.svg"
            width="205"
            height="47"
            alt="CODEYEA"
          />
          <img
            className="hp-logo-light"
            src="/brand/logo-animated-light.svg"
            width="205"
            height="47"
            alt=""
          />
        </a>
        <nav className="hp-desktop-nav" aria-label="Main navigation">
          {navigation}
        </nav>
        <a
          className="hp-button hp-header-quote"
          href="#contact"
          onClick={quoteClick}
        >
          Get Your Free Quote
        </a>
        {mobile ?? <SharedMobileView content={content} />}
      </div>
      {panels}
      {quote}
    </header>
  );
}

export function SharedMobileView({
  content,
  activeHref,
  dialog = { current: null },
  trigger = { current: null },
  close = () => {},
  show = () => {},
}: {
  content: EditorObject;
  activeHref?: string;
  dialog?: RefObject<HTMLDialogElement | null>;
  trigger?: RefObject<HTMLButtonElement | null>;
  close?: () => void;
  show?: () => void;
}) {
  const items = enabledItems(content.items).filter(
    (item) => str(item.title) !== "Work",
  );
  return (
    <>
      <button
        ref={trigger}
        className="hp-mobile-trigger"
        aria-haspopup="dialog"
        aria-controls="mobile-navigation"
        onClick={show}
      >
        Menu <span aria-hidden="true">☰</span>
      </button>
      <dialog
        ref={dialog}
        id="mobile-navigation"
        className="hp-mobile-panel"
        aria-label="CODEYEA navigation"
        onCancel={(e) => {
          e.preventDefault();
          close();
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            const r = e.currentTarget.getBoundingClientRect();
            if (e.clientX < r.left) close();
          }
        }}
        onKeyDown={(e) => {
          if (e.key !== "Tab") return;
          const nodes = [
            ...e.currentTarget.querySelectorAll<HTMLElement>(
              "a[href],button,summary",
            ),
          ].filter((n) => n.getClientRects().length);
          const first = nodes[0],
            last = nodes[nodes.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }}
      >
        <div className="hp-mobile-panel-top">
          <img
            src="/brand/logo-animated-light.svg"
            width="220"
            height="50"
            alt="CODEYEA"
          />
          <button type="button" aria-label="Close navigation" onClick={close}>
            ×
          </button>
        </div>
        <nav
          aria-label="Mobile navigation"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) close();
          }}
        >
          {items
            .filter((i) => !i.parentId)
            .map((item) =>
              items.some((child) => child.parentId === item.id) ? (
                <details key={str(item.id)}>
                  <summary>
                    <a
                      href={str(item.href)}
                      onClick={(e) => e.stopPropagation()}
                    >
                      {str(item.title)}
                    </a>
                    <svg
                      className="hp-chevron"
                      viewBox="0 0 12 8"
                      width="12"
                      height="8"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="m1 1 5 5 5-5"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                    </svg>
                  </summary>
                  <div className="hp-mobile-submenu">
                    <a href={str(item.href)}>Explore {str(item.title)}</a>
                    {items
                      .filter((child) => child.parentId === item.id)
                      .map((child) => (
                        <a key={str(child.id)} href={str(child.href)}>
                          {str(child.title)}
                        </a>
                      ))}
                  </div>
                </details>
              ) : (
                <a
                  key={str(item.id)}
                  href={str(item.href)}
                  aria-current={activeHref === item.href ? "page" : undefined}
                >
                  {str(item.title)}
                </a>
              ),
            )}
          {!items.some((i) => !i.parentId && str(i.title) === "Contact") && (
            <a href="#contact">Contact</a>
          )}
        </nav>
        <div className="hp-mobile-actions">
          {enabledItems(content.actions).map((item) => (
            <a key={str(item.id)} href={str(item.href)}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d={
                    item.id === "mobile-action-0"
                      ? "M3 5h18v5a2 2 0 0 0 0 4v5H3v-5a2 2 0 0 0 0-4z"
                      : item.id === "mobile-action-1"
                        ? "M8 7a4 4 0 1 0 8 0 4 4 0 0 0-8 0M4 21v-3a8 8 0 0 1 16 0v3z"
                        : "M13 4H4v16h16v-9M12 12 22 2M15 2h7v7"
                  }
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
              </svg>
              {str(item.title)}
            </a>
          ))}
        </div>
      </dialog>
    </>
  );
}
