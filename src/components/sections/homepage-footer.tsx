"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
import { WordRotator } from "./homepage-interactions";
import "@/styles/homepage-footer.css";
import { SharedFooterView } from "./shared-footer-view";
import { usePathname } from "next/navigation";

export function HomepageFooter({ content }: { content: EditorObject }) {
  const preview = (usePathname() ?? "").startsWith("/preview");
  const footer = useRef<HTMLElement>(null);
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  useEffect(() => {
    const node = footer.current;
    if (!node) return;
    const update = () => {
      node.style.setProperty("position", "sticky", "important");
      // Tall footers reveal their top first, then scroll to the final links.
      node.style.setProperty(
        "bottom",
        `${Math.min(0, innerHeight - node.getBoundingClientRect().height)}px`,
      );
      node.style.setProperty("z-index", "0");
    };
    const observer = new ResizeObserver(update);
    observer.observe(node);
    window.addEventListener("resize", update);
    update();
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return (
    <SharedFooterView
      content={content}
      footerRef={footer}
      words={
        <WordRotator
          words={enabledItems(content.words).map((w) => str(w.title))}
        />
      }
      ready={ready}
      submitted={submitted}
      submitEmail={submitEmail}
      preview={preview}
    />
  );
}
