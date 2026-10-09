"use client";

import { useEffect, useState, type FormEvent } from "react";
import { enabledItems, type EditorObject } from "@/schemas/homepage-editor";
import { str } from "@/content/homepage-render";
import { WordRotator } from "./homepage-interactions";
import "@/styles/homepage-footer.css";

export function HomepageFooter({ content }: { content: EditorObject }) {
  const [submitted, setSubmitted] = useState(false);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  const groups = enabledItems(content.groups);
  const menu = groups[0];
  const otherLinks = groups.slice(1).flatMap((group) => enabledItems(group.links));
  const menuLinks = [
    ...(menu ? enabledItems(menu.links) : []),
    ...otherLinks.filter((link) => str(link.id) === "footer-contact"),
  ];
  const portalOrder = ["footer-client", "footer-support", "footer-cms"];
  const portalLinks = otherLinks
    .filter((link) => str(link.id) !== "footer-contact")
    .sort((a, b) => {
      const rank = (link: EditorObject) => {
        const index = portalOrder.indexOf(str(link.id));
        return index < 0 ? portalOrder.length : index;
      };
      return rank(a) - rank(b);
    });
  function submitEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }
  return (
    <footer id="contact" className="hp-footer hp-footer-v2">
      <div className="hp-container hp-footer-v2-layout">
        <div className="hp-footer-v2-lead">
          <h2>
            <span className="hp-footer-v2-prefix">{str(content.heading)}</span>
            <span className="hp-footer-v2-ending"><WordRotator words={enabledItems(content.words).map((word) => str(word.title))} />
            {str(content.suffix).trim() && <span className="hp-footer-v2-suffix"> {str(content.suffix)}</span>}</span>
          </h2>
          <svg className="hp-footer-v2-outline" viewBox="0 0 100 100" fill="none" aria-hidden="true">
            <path d="M17 76 66 27H24V14h64v64H75V36L26 85Z" stroke="currentColor" strokeWidth="1.4" />
          </svg>
        </div>
        <div className="hp-footer-v2-quote">
          <h3>{str(content.supportHeading)}</h3>
          <p>{str(content.body)}</p>
          <a className="hp-footer-v2-action" href={str(content.ctaHref)}>
            <span>{str(content.ctaLabel)}</span><span aria-hidden="true">→</span>
          </a>
        </div>
        <div className="hp-footer-v2-brand">
          <img src="/brand/logo-animated-light.svg" width="330" height="75" alt="CODEYEA" loading="lazy" />
          <p>{str(content.contact)}</p>
          <small>{str(content.copyright)}</small>
        </div>
        <nav className="hp-footer-v2-menu" aria-label="Footer navigation">
          <h3>MENU</h3>
          {menuLinks.map((link) => <a key={str(link.id)} href={str(link.href)}>{str(link.title)}</a>)}
        </nav>
        <div className="hp-footer-v2-connect">
          <h3>Keep In Touch</h3>
          <form className="hp-footer-v2-form" onSubmit={submitEmail}>
            <fieldset disabled={!ready}>
            <label htmlFor="footer-email">Enter your email address</label>
            <div className="hp-footer-v2-email-row">
              <input id="footer-email" name="email" type="email" autoComplete="email" required aria-describedby="footer-email-status" />
              <button type="submit" aria-label="Submit email address"><span aria-hidden="true">→</span></button>
            </div>
            </fieldset>
            <p id="footer-email-status" className="hp-footer-v2-status" role="status">{submitted ? "Email delivery is not connected yet. Your address has not been sent or saved." : "Email delivery is not connected yet."}</p>
          </form>
          <div className="hp-footer-v2-portals">
            <nav aria-label="Client portal and support">
              <h4>Client Portal</h4>
              {portalLinks.map((link) => <a key={str(link.id)} href={str(link.href)}>{str(link.title)}</a>)}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  );
}
