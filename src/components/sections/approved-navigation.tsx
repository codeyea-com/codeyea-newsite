"use client";
import { useEffect, useRef, useState } from "react";
import { type EditorObject } from "@/schemas/homepage-editor";
import { approvedMenuContent } from "@/content/approved-navigation";
import "@/styles/approved-mega.css";
import { approvedNavigationView } from "./shared-navigation-view";
export { IndustryIcon } from "./shared-navigation-view";
export function useApprovedNavigation(content: EditorObject, preview = true) {
  const [active, setActive] = useState<string | null>(null),
    [current, setCurrent] = useState<string | null>(null),
    timer = useRef<ReturnType<typeof setTimeout> | null>(null),
    buttons = useRef<Record<string, HTMLButtonElement | null>>({}),
    panels = useRef<Record<string, HTMLDivElement | null>>({});
  const menu = approvedMenuContent(content, preview);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const close = () => {
    cancel();
    setActive(null);
    setCurrent(null);
  };
  const open = (id: string) => {
    cancel();
    setActive(id);
    setCurrent(null);
  };
  const leave = () => {
    cancel();
    timer.current = setTimeout(() => {
      if (
        !Object.values(panels.current).some((p) =>
          p?.contains(document.activeElement),
        )
      )
        close();
    }, 180);
  };
  useEffect(() => {
    const outside = (e: PointerEvent) => {
      if (
        !Object.values(buttons.current).some((b) =>
          b?.contains(e.target as Node),
        ) &&
        !Object.values(panels.current).some((p) =>
          p?.contains(e.target as Node),
        )
      )
        close();
    };
    document.addEventListener("pointerdown", outside);
    return () => {
      cancel();
      document.removeEventListener("pointerdown", outside);
    };
  }, []);
  const keyboard = (event: React.KeyboardEvent, id: string) => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      buttons.current[id]?.focus();
    }
  };
  const linkProps = (key: string) => ({
    onPointerEnter: (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (e.pointerType === "mouse") setCurrent(key);
    },
    onPointerMove: (e: React.PointerEvent<HTMLAnchorElement>) => {
      if (
        e.pointerType !== "mouse" ||
        matchMedia("(prefers-reduced-motion:reduce)").matches ||
        !matchMedia("(hover:hover) and (pointer:fine)").matches
      )
        return;
      const r = e.currentTarget.getBoundingClientRect();
      e.currentTarget.style.setProperty(
        "--cy-x",
        Math.max(-4, Math.min(4, (e.clientX - r.left - r.width / 2) * 0.025)) +
          "px",
      );
      e.currentTarget.style.setProperty(
        "--cy-y",
        Math.max(-3, Math.min(3, (e.clientY - r.top - r.height / 2) * 0.055)) +
          "px",
      );
    },
    onPointerLeave: (e: React.PointerEvent<HTMLAnchorElement>) => {
      setCurrent(null);
      e.currentTarget.style.removeProperty("--cy-x");
      e.currentTarget.style.removeProperty("--cy-y");
    },
    onFocus: () => setCurrent(key),
    onBlur: () => setCurrent(null),
    onClick: close,
  });
  return {
    ...approvedNavigationView(menu, {
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
    }),
    content: menu,
  };
}
