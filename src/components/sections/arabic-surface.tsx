"use client";
import { useEffect, useRef } from "react";
import { localizedHref } from "@/content/arabic-navigation";
const ui: Record<string, string> = {
  "Keep In Touch": "ابقَ على تواصل",
  "Enter your email address": "أدخل بريدك الإلكتروني",
  "Email delivery is not connected yet.": "إرسال البريد غير مفعّل حاليًا.",
  "Email delivery is not connected yet. Your address has not been sent or saved.":
    "إرسال البريد غير مفعّل حاليًا. لم يُرسل عنوانك أو يُحفظ.",
  "Skip to content": "انتقل إلى المحتوى",
  Support: "الدعم",
  "Client Area": "منطقة العملاء",
  "Get Your Free Quote": "اطلب عرضك المجاني",
  "Open menu": "افتح القائمة",
  "Close menu": "أغلق القائمة",
  Menu: "القائمة",
  MENU: "القائمة",
  "Explore Industries": "استكشف القطاعات",
  "Learn More": "اعرف المزيد",
  "Your email address": "بريدك الإلكتروني",
  "Email address": "البريد الإلكتروني",
  "Send a message": "أرسل رسالة",
  "Start a conversation": "ابدأ محادثة",
  Send: "إرسال",
  Submit: "إرسال",
  Next: "التالي",
  Back: "السابق",
  Close: "إغلاق",
  Name: "الاسم",
  "Your name": "اسمك",
  Phone: "رقم الهاتف",
  Company: "اسم الشركة",
  Message: "الرسالة",
  Monthly: "شهري",
  Annual: "سنوي",
  "View project": "شاهد المشروع",
  "Let’s Talk": "لنتحدث",
  "Technical Support": "الدعم التقني",
  Contact: "تواصل معنا",
  Save: "وفر",
  "EXPLORE INDUSTRIES": "استكشف القطاعات",
  "All rights reserved.": "جميع الحقوق محفوظة.",
};
export function ArabicSurface({ children }: { children: React.ReactNode }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const refine = () => {
      const target = root.current;
      if (!target) return;
      target.querySelectorAll<HTMLAnchorElement>("a[href]").forEach((a) => {
        const href = a.getAttribute("href")!;
        if (
          href.startsWith("/") &&
          !/^\/(api|asset|site|brand|homepage)\//.test(href)
        )
          a.setAttribute(
            "href",
            localizedHref(href, location.pathname.startsWith("/preview")),
          );
        else if (/^https?:\/\/(?:www\.)?codeyea\.com\/contact/.test(href))
          a.setAttribute(
            "href",
            location.pathname.startsWith("/preview")
              ? "/preview/pages/contact?locale=ar#contact-form"
              : "/ar/contact/#contact-form",
          );
      });
      const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        const text = node.textContent?.trim();
        if (
          text &&
          ui[text] &&
          !["SCRIPT", "STYLE", "CODE"].includes(
            node.parentElement?.tagName ?? "",
          )
        )
          node.textContent = node.textContent!.replace(text, ui[text]);
      }
      target
        .querySelectorAll<HTMLInputElement>("[placeholder]")
        .forEach((input) => {
          if (ui[input.placeholder]) input.placeholder = ui[input.placeholder];
        });
    };
    refine();
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(refine);
    });
    observer.observe(root.current!, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div ref={root} lang="ar" dir="rtl" className="cy-arabic-surface">
      {children}
    </div>
  );
}
