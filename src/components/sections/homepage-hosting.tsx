"use client";
import {MobileHosting} from "./homepage-mobile-hosting";
import {useState} from "react";
import {enabledItems,type EditorObject} from "@/schemas/homepage-editor";
import {str} from "@/content/homepage-render";
export function HomepageHosting({content}:{content:EditorObject}){const [annual,setAnnual]=useState(false);const plans=enabledItems(content.plans),features=enabledItems(content.features);return (        <section
          id="hosting"
          className="hp-hosting hp-container"
          aria-labelledby="hosting-title"
        >
          <div className="hp-hosting-intro">
            <div>
              <svg className="hp-hosting-icon" viewBox="0 0 48 48" width="54" height="54" fill="none" aria-hidden="true"><rect x="7" y="9" width="34" height="12" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="7" y="27" width="34" height="12" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M13 15h15M13 33h15M34 15h2M34 33h2" stroke="currentColor" strokeWidth="2"/></svg>
              <h2 id="hosting-title">{str(content.heading)}</h2>
              <p>
                {str(content.body)}
              </p>
            </div>
            <div className="hp-billing-wrap"><span className="hp-saving-note">Save 20%<svg viewBox="0 0 60 40" width="60" height="40" fill="none" aria-hidden="true"><path d="M50 3Q45 28 8 30m0 0 10-8M8 30l13 3" stroke="currentColor" strokeWidth="1.4"/></svg><small>Reference offer · TBC</small></span><div className="hp-billing" aria-label="Billing period"><button type="button" aria-pressed={!annual} onClick={() => setAnnual(false)}>{str(content.monthlyLabel)}</button><button type="button" aria-pressed={annual} onClick={() => setAnnual(true)}>{str(content.annualLabel)}</button></div></div>
          </div>
          <MobileHosting annual={annual} content={content} />
          <div
            className="hp-table-wrap"
            role="region"
            aria-label="Hosting comparison, scroll horizontally on small screens"
            tabIndex={0}
          >
            <table className="hp-plan-table">
              <caption>
                Reference prices only. {annual ? "Business annual price has conflicting units on the source site; confirmation required. Renewal prices and all inclusions require approval." : "Prices and inclusions require approval."}
              </caption>
              <thead>
                <tr>
                  <th scope="col"><span className="hp-compare-heading">Compare Web Hosting</span><span className="hp-package-prompt">Choose Your Package</span></th>
                  {plans.map((plan) => (
                    <th scope="col" key={str(plan.id)} data-featured={!!plan.featured}>
                      <span>{str(plan.title)}</span>
                      <strong key={String(annual)} className="hp-price-enter">
                        {str(annual?plan.annualPrice:plan.monthlyPrice)}
                        <small>{str(annual?plan.annualUnit:plan.monthlyUnit)}</small>
                      </strong>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {features.map((feature, i) => (
                  <tr key={str(feature.id)}>
                    <th scope="row"><svg className="hp-feature-icon" viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true"><path d={["M4 4h16v6H4zM4 14h16v6H4z","M3 17a9 9 0 1 1 18 0M12 13l5-5","M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20M2 12h20M12 2v20","M6 11V7a6 6 0 0 1 12 0v4M4 11h16v11H4z","m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6z","M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4","M2 4h20v16H2zM2 4l10 9L22 4","M3 12h4l3-7 4 14 3-7h4","M4 10a8 8 0 1 1 2 9M4 3v7h7","m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6z","M4 10a8 8 0 1 1 2 9M4 3v7h7"][i]} stroke="currentColor" strokeWidth="1.5"/></svg>{str(feature.title)}</th>
                    {plans.map((plan) => (
                      <td key={str(plan.id)} data-featured={!!plan.featured}>
                        {str(enabledItems(plan.values).find(v=>v.featureId===feature.id)?.value)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th scope="row">
                    <small>*Unverified reference claim</small>
                  </th>
                  {plans.map((plan) => (
                    <td key={str(plan.id)} data-featured={!!plan.featured}>
                      <a className="hp-button" href={str(plan.ctaHref)} aria-label={str(plan.ctaLabel)+" with " + str(plan.title) + " — contact CODEYEA"}>{str(plan.ctaLabel)}</a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </section>);}
