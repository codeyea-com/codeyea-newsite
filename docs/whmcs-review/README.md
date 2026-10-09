# CODEYEA WHMCS design preview

Open `index.html`. This is a standalone interactive design, not an installed WHMCS theme. The main website is paused and unchanged by this work. No live account, registrar, order, payment, email or ticket endpoint is called. Enter sample information only; state lasts for the open page.

## Brand and catalog

Uses the local CODEYEA logos, Josefin Sans, navy `#072448`, red `#ed0845`, cyan `#10aabc`, and sharp corners. Copy is English; Arabic is a later phase.

The 15 hosting plans and their limits/prices are extracted from the existing website previews by `build-catalog.cjs`:

- Website Hosting: TurboLaunch, PowerPulse, VelocityPlus, VelocityMax, InfiniteBoost.
- WordPress Hosting: QuickPress, TurboPress, InfinitePress, MaxPowerPress.
- Cloud Hosting: LiteSky, TurboSky, TurboTrade.
- Email Hosting: MailLaunch, MailConnect, MailScale.
- Standalone support: Technical Rescue, illustrative $75/hour, one-hour minimum then half-hour increments.
- Hosting support add-ons: Care Essential, illustrative $49/month; Care Plus, illustrative $129/month. Both cover one eligible WordPress website on CODEYEA hosting.
- Website migration to CODEYEA is a hosting add-on, included subject to scope, consistent with existing site copy. WordPress care is not offered on Email Hosting.

Prices are provisional website-review data, not final selling prices. Annual hosting discount follows the source catalog; care remains a separate monthly item. Existing-service add-on orders do not charge hosting again. Registry pricing and availability remain pending; no invented domain availability or live payment options appear.

## Review journeys

| Journey | Start |
| --- | --- |
| Four hosting catalogs, billing cycles and all plan features | `#store/website-hosting` |
| Domain search, registration and transfer design | `#domains` |
| Standalone support versus hosting care | `#support` |
| Hosting order: domain → configure/add-ons → account → review | Choose any hosting plan |
| Existing service: add care without repurchasing hosting | `#service` → Select care plan |
| Migration request for an existing service | `#service` → Select migration → Request |
| Sign-in, registration, password recovery | `#login`, `#register`, `#reset` |
| Dashboard, services and management | `#dashboard`, `#services`, `#service`, `#email-service` |
| Domain controls and nameservers | `#my-domains`, `#domain-detail` |
| Invoice listing and invoice design | `#invoices`, `#invoice` |
| Tickets, ticket thread and ticket form | `#tickets`, `#ticket`, `#new-ticket` |
| Contact details, security entry points and help | `#account`, `#knowledge` |

Sample records use reserved example domains. Buttons that need WHMCS explicitly explain their future action. They never claim a real payment, login, cancellation, DNS update or message submission.

## WHMCS implementation boundary

Owner-confirmed installation and screenshots:

- WHMCS: **8.13.1-release.1**, General Release (owner supplied; not independently inspected).
- Selected system theme: **Kohost-8.8.0**, already modified by the owner toward CODEYEA branding. The theme name is not evidence of compatibility with the installed WHMCS release.
- Selected default order form: **Hostlar Standard**. Its actual directory name has not been supplied.
- No current `.tpl` or theme configuration files were found in this workspace. Obtain the modified theme and order-form directories, including their assets and any theme-specific dependencies, before integration. Preserve the owner's original customizations in a separate source copy. No credentials, WHMCS configuration.php, database dump or customer records are needed for the design review.

WHMCS separates its client-area **system theme** from its **order form template**. Both will need branded integration; one theme alone does not replace checkout. Target the confirmed 8.13.1 installation and inspect the owner's actual modified files before producing compatible Smarty overrides. Prefer version-matched child-theme inheritance where supported; retain WHMCS-generated forms, tokens, validation, currency/tax calculations, gateway modules, registrar responses, language strings and hooks. Never replace them with the preview's sample state. No runtime compatibility has been verified yet.

Required live mapping: product groups/IDs; plan billing cycles and renewal prices; product add-ons and eligibility; free migration scope; domain TLD register/transfer/renewal pricing; gateway configuration; support departments; cPanel service links; invoice identity/tax; account security flows and password recovery. These are not configured by this preview.

References checked:
- [WHMCS themes and templates](https://docs.whmcs.com/9-0/customization/themes-and-templates/)
- [Theme getting started](https://developers.whmcs.com/themes/getting-started)
- [Theme configuration](https://developers.whmcs.com/themes/theme-parameters)
- [Custom order form templates](https://docs.whmcs.com/8-11/customization/custom-order-form-templates/)

## Verification

Run `node --test docs/whmcs-review/preview.test.cjs`. Covers catalog parity, billing calculations, existing-service add-on pricing, domain validation, rendered route coverage, escaping and absence of network submission/storage.

Responsive CSS covers desktop, tablet and mobile and respects reduced motion. Keyboard focus, native form validation and collapsible navigation are included. **Visual/browser testing remains blocked:** automatic approval review rejected opening this local preview due to an earlier local-browser restriction. No screenshot, visual match or browser interaction pass is claimed. Owner visual review and browser testing are required before approval, followed by actual WHMCS integration and version-specific validation. Nothing is deployed.
