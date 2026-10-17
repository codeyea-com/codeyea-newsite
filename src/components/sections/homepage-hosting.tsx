"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
import { annualPlanSavings } from "@/content/homepage-hosting-savings";
import "@/styles/homepage-hosting.css";

type HostingKind = "web" | "email";

export function HomepageHosting({
  content,
  arabic = false,
}: {
  content: EditorObject;
  arabic?: boolean;
}) {
  const [kind, setKind] = useState<HostingKind>("web");
  const [annual, setAnnual] = useState(false);
  const section = useRef<HTMLElement>(null);
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const email = kind === "email";
  const plans = enabledItems(email ? content.emailPlans : content.plans);
  const features = enabledItems(
    email ? content.emailFeatures : content.features,
  );
  const hasEmail = enabledItems(content.emailPlans).length > 0;
  const savings = plans.map(annualPlanSavings);
  const sharedSaving = savings.length > 0 && savings.every((saving) => saving?.percent === savings[0]?.percent)
    ? savings[0]?.percent
    : undefined;
  const savingsLabel = (percent: number) => arabic ? `خصم ${percent}%` : `${percent}% OFF`;
  const prefix = arabic ? "/ar" : "";
  const copy = arabic
    ? {
        web: "استضافة المواقع",
        email: "استضافة البريد الإلكتروني",
        type: "نوع الاستضافة",
        billing: "فترة الفوترة",
        recommended: "خطة مقترحة",
        month: "/ شهر",
        year: "/ سنة",
        resources: "مساحة لنمو موقعك",
        tools: "البناء والإدارة",
        connect: "البريد والنسخ الاحتياطي",
        webDescription:
          "مساحة لموقعك، وأدوات لإدارته، وموارد تناسب خطوتك القادمة.",
        emailDescription:
          "بريد باسم نطاقك، مع مساحة لفريقك وأدوات لتنظيم التواصل اليومي.",
        all: "اطلع على جميع خطط الاستضافات المميزة",
        allEmail: "اطلع على جميع خطط استضافة البريد",
        note: "الأسعار المعروضة توضيحية بالدولار الأمريكي. تُؤكّد تفاصيل الاشتراك عند الطلب.",
        emailNote: "تطبق مساحة التخزين الإجمالية للخطة على جميع صناديق البريد.",
      }
    : {
        web: "Web hosting",
        email: "Email hosting",
        type: "Hosting type",
        billing: "Billing period",
        recommended: "Recommended",
        month: "/mo",
        year: "/year",
        resources: "Room for your website",
        tools: "Build & manage",
        connect: "Email & backup",
        webDescription:
          "Space for your website, tools to manage it, and resources for your next step.",
        emailDescription:
          "Email on your own domain, with room for your team and tools for everyday communication.",
        all: "View all premium hosting plans",
        allEmail: "View all email hosting plans",
        note: "Illustrative prices in USD. Subscription details are confirmed when you enquire.",
        emailNote:
          "The plan’s total storage allowance applies across all mailboxes.",
      };

  useEffect(() => {
    const root = section.current;
    if (!root) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.visible = "true";
            observer.unobserve(entry.target);
          }
      },
      { threshold: 0.06 },
    );
    for (const element of root.querySelectorAll<HTMLElement>(
      "[data-hosting-reveal]",
    )) {
      if (reducedMotion.matches) element.dataset.visible = "true";
      else {
        element.dataset.prepared = "true";
        observer.observe(element);
      }
    }
    const cards = Array.from(
      root.querySelectorAll<HTMLElement>(".hph-card-drift"),
    );
    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = root.getBoundingClientRect();
      if (rect.bottom < 0 || rect.top > window.innerHeight) return;
      const distance = reducedMotion.matches
        ? 0
        : Math.max(
            -7,
            Math.min(7, (window.innerHeight / 2 - rect.top) * 0.012),
          );
      cards.forEach((card, index) =>
        card.style.setProperty(
          "--hosting-drift",
          `${distance * (index === 1 ? -1 : 1)}px`,
        ),
      );
    };
    const scroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    reducedMotion.addEventListener("change", scroll);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", scroll);
      reducedMotion.removeEventListener("change", scroll);
      cancelAnimationFrame(frame);
    };
  }, [kind]);

  function switchWithKeys(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === "Home" ? 0 : event.key === "End" ? 1 : 1 - index;
    setKind(next === 0 ? "web" : "email");
    tabs.current[next]?.focus();
  }

  return (
    <section
      ref={section}
      id="hosting"
      className="hp-hosting-showcase"
      aria-labelledby="hosting-title"
    >
      <div className="hph-inner">
        <header className="hph-intro" data-hosting-reveal>
          <h2 id="hosting-title">{str(content.heading)}</h2>
          {hasEmail && (
            <div className="hph-tabs" role="tablist" aria-label={copy.type}>
              <span
                className="hph-tab-indicator"
                data-email={email}
                aria-hidden="true"
              />
              {(["web", "email"] as const).map((value, index) => (
                <button
                  key={value}
                  ref={(el) => {
                    tabs.current[index] = el;
                  }}
                  type="button"
                  role="tab"
                  id={`hosting-tab-${value}`}
                  aria-controls="hosting-panel"
                  aria-selected={kind === value}
                  tabIndex={kind === value ? 0 : -1}
                  onClick={() => setKind(value)}
                  onKeyDown={(event) => switchWithKeys(event, index)}
                >
                  {copy[value]}
                </button>
              ))}
            </div>
          )}
          <p className="hph-description" key={kind}>
            {email
              ? copy.emailDescription
              : str(content.body) || copy.webDescription}
          </p>
          <div className="hph-billing" role="group" aria-label={copy.billing}>
            <button
              type="button"
              aria-pressed={!annual}
              onClick={() => setAnnual(false)}
            >
              {str(content.monthlyLabel)}
            </button>
            <button
              type="button"
              aria-pressed={annual}
              onClick={() => setAnnual(true)}
            >
              {str(content.annualLabel)}
              {sharedSaving && <span className="hph-discount">{savingsLabel(sharedSaving)}</span>}
            </button>
          </div>
        </header>
        <div
          key={kind}
          id="hosting-panel"
          role={hasEmail ? "tabpanel" : undefined}
          aria-labelledby={hasEmail ? `hosting-tab-${kind}` : undefined}
          className="hph-panel"
          data-kind={kind}
        >
          <div
            className="hph-cards"
            style={{ "--hosting-count": plans.length } as CSSProperties}
          >
            {plans.map((plan, index) => {
              const values = new Map(
                enabledItems(plan.values).map((value) => [
                  str(value.featureId),
                  str(value.value),
                ]),
              );
              const groups = email
                ? [{ label: "", items: features }]
                : [
                    { label: copy.resources, items: features.slice(0, 3) },
                    {
                      label: copy.tools,
                      items: [...features.slice(3, 6), ...features.slice(8)],
                    },
                    { label: copy.connect, items: features.slice(6, 8) },
                  ];
              return (
                <div
                  key={str(plan.id)}
                  className="hph-card-reveal"
                  data-hosting-reveal
                  style={
                    { "--hosting-delay": `${index * 110}ms` } as CSSProperties
                  }
                >
                  <div className="hph-card-drift">
                    <article
                      className="hph-card"
                      data-featured={!!plan.featured}
                    >
                      <div className="hph-plan-heading">
                        {plan.featured && (
                          <span className="hph-recommended">
                            {copy.recommended}
                          </span>
                        )}
                        <h3 dir="auto">{str(plan.title)}</h3>
                        <p>{str(plan.description)}</p>
                      </div>
                      <div className="hph-plan-content">
                        {annual && savings[index] && (
                          <div className="hph-annual-saving">
                            <span className="hph-discount">{savingsLabel(savings[index].percent)}</span>
                            <del aria-label={arabic ? "السعر السنوي قبل الخصم" : "Annual price before discount"}>
                              <bdi>{savings[index].regularAnnual}</bdi> {copy.year}
                            </del>
                          </div>
                        )}
                        <p className="hph-price" key={String(annual)}>
                          <bdi>
                            {str(annual ? plan.annualPrice : plan.monthlyPrice)}
                          </bdi>
                          <span>{annual ? copy.year : copy.month}</span>
                        </p>
                        <a
                          className="hp-button hph-choose"
                          href={str(plan.ctaHref)}
                          aria-label={`${str(plan.ctaLabel)}: ${str(plan.title)}`}
                        >
                          <span>{str(plan.ctaLabel)}</span>
                          <span aria-hidden="true">{arabic ? "↖" : "↗"}</span>
                        </a>
                        <p className="hph-renewal">{str(plan.renewal)}</p>
                        <div className="hph-features">
                          {groups
                            .filter((group) => group.items.length)
                            .map((group, groupIndex) => (
                              <div
                                className="hph-feature-group"
                                key={groupIndex}
                              >
                                {group.label && <h4>{group.label}</h4>}
                                <ul>
                                  {group.items.map((feature) => (
                                    <li key={str(feature.id)}>
                                      <svg
                                        viewBox="0 0 20 20"
                                        width="18"
                                        height="18"
                                        aria-hidden="true"
                                      >
                                        <path
                                          d="m4 10 4 4 8-8"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="1.7"
                                        />
                                      </svg>
                                      <span>
                                        <strong dir="auto">
                                          {values.get(str(feature.id))}
                                        </strong>
                                        <span>{str(feature.title)}</span>
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="hph-bottom" data-hosting-reveal>
            <a
              className="hph-all"
              href={`${prefix}/${email ? "email-hosting" : "website-hosting"}/#hosting-plans`}
            >
              {email ? copy.allEmail : copy.all}
              <span aria-hidden="true">{arabic ? "↖" : "↗"}</span>
            </a>
            <p>{copy.note}</p>
            {email && <p>{copy.emailNote}</p>}
          </div>
        </div>
      </div>
    </section>
  );
}
