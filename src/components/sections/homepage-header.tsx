"use client";
import { usePathname } from "next/navigation";
import { useApprovedNavigation } from "./approved-navigation";
import { useEffect, useRef } from "react";
import { SharedHeaderView, SharedMobileView } from "./shared-header-view";
import "@/styles/homepage-header-final.css";
import "../../../public/site/shared-layout.css";
import { PreviewQuote } from "../cms/preview-quote";
import { type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
export function HomepageHeader({
  content,
  activeHref,
  homeHref = "#top",
  light = false,
}: {
  content: EditorObject;
  activeHref?: string;
  homeHref?: string;
  light?: boolean;
}) {
  const pathname = usePathname() ?? "";
  const preview = pathname.startsWith("/preview");
  const arabic = /^\/(?:preview\/)?ar(?:\/|$)/.test(pathname);
  const approved = useApprovedNavigation(
    content,
    preview,
    arabic ? "ar" : "en",
  );
  return (
    <SharedHeaderView
      content={approved.content}
      navigation={approved.navigation}
      panels={approved.panels}
      mobile={<MobileMenu content={approved.content} activeHref={activeHref} />}
      homeHref={arabic ? (preview ? "/preview/ar/" : "/ar/") : homeHref}
      light={light}
      quote={!preview ? <PreviewQuote publicAssets /> : undefined}
      quoteClick={(event) => {
        if (!document.querySelector("#cq-dialog")) {
          event.preventDefault();
          event.currentTarget.setAttribute("data-quote-pending", "true");
        }
      }}
    />
  );
}

function MobileMenu({
  content,
  activeHref,
}: {
  content: EditorObject;
  activeHref?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const previousOverflow = useRef("");
  const close = () => {
    dialog.current?.close();
    document.body.style.overflow = previousOverflow.current;
    trigger.current?.focus();
  };
  useEffect(() => {
    const query = matchMedia("(min-width:1200px)");
    const resize = () => {
      if (query.matches && dialog.current?.open) close();
    };
    query.addEventListener("change", resize);
    return () => {
      query.removeEventListener("change", resize);
      if (dialog.current?.open)
        document.body.style.overflow = previousOverflow.current;
    };
  }, []);
  return (
    <SharedMobileView
      content={content}
      activeHref={activeHref}
      dialog={dialog}
      trigger={trigger}
      close={close}
      show={() => {
        previousOverflow.current = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog.current?.showModal();
      }}
    />
  );
}
