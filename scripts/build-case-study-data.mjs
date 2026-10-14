import fs from "node:fs/promises";

// English counterparts of the owner's existing Arabic concept documents.
const translations = [
  {
    slug: "velora-skin-clinic",
    name: "Velora Skin Clinic",
    nameAr: "فيلورا للعناية بالبشرة",
    title: "From an unclear identity to a connected clinic experience",
    intro:
      "A skincare clinic needs an identity, printed materials and website that reflect the care taken inside the clinic. The project connects brand discovery with a clearer path to requesting a consultation.",
    requirements: [
      "A consistent identity across signage, stationery, uniforms, social media and the website.",
      "Clear service and consultation information, without treatment promises or misleading imagery.",
      "A short consultation request journey that explains what happens next.",
      "Measure consultation requests, completeness and recurring questions about services.",
    ],
    services:
      "Brand identity, graphic design, website design, content strategy and user experience.",
    timeline:
      "10 weeks of implementation, followed by two simulated 30-day periods of 4,000 sessions each.",
    stages: [
      [
        "Understand the clinic and its audience",
        "Review customer questions and how services are explained. Define the brand voice and what visitors need to know before a consultation.",
      ],
      [
        "Draw the logo and visual system",
        "Develop the mark, balance typography and colour, then test its clarity on signage and small appointment cards.",
      ],
      [
        "Apply the identity throughout the experience",
        "Extend the identity to consultation folders, brochures, appointment cards, signage, uniforms and promotional materials.",
      ],
      [
        "Build the website and consultation journey",
        "Design service, team and FAQ pages, then test the consultation request on mobile.",
      ],
      [
        "Launch and measure message clarity",
        "Review consultation requests, completeness and recurring questions. Improve content that causes uncertainty.",
      ],
    ],
    metrics: [
      [
        "Website consultation requests",
        "72",
        "128",
        "4,000 sessions in each simulated period; conversion changes from 1.8% to 3.2%.",
      ],
      [
        "Requests with complete information",
        "54%",
        "86%",
        "Requested service, contact method and suitable time; no sensitive medical details required.",
      ],
      [
        "Service questions per 100 enquiries",
        "30",
        "16",
        "Questions about how consultations work and what they include, after reorganising the content.",
      ],
    ],
    outcome:
      "A more consistent brand and clearer introduction to the clinic support better-informed consultation requests. This scenario concerns communication and operations, not treatment outcomes.",
    scenes: [
      "Top-down physical brand identity flat lay for fictional VELORA Skin Clinic. Consultation folder, appointment card, service brochure, elegant pen, a small clinic sign and tactile material samples. Focus on typography and actual printed identity. No devices or people. Consistent refined V monogram, ivory paper, muted botanical green and warm grey. Readable short VELORA wordmark, no location.",
      "Brand discovery workshop for fictional VELORA Skin Clinic. Close overhead view of a physical moodboard with paper textures, botanical green and warm grey colour swatches, serif and sans-serif type samples and small clinic interior detail photographs. Two collaborators hands entering from different edges select materials. No screens. Materials dominate; anatomically natural hands.",
      "Close slightly overhead photograph of a landscape drawing tablet on a designer desk. A LEFT hand holds a stylus naturally at the lower left screen edge, drawing a refined V monogram for VELORA Skin Clinic. Screen shows three clear logo construction studies, vector anchor points, and the short VELORA name. Fingers never cover the drawing. Printed type and colour samples nearby. Device screen occupies most of frame. Ivory, botanical green, warm grey identity.",
      "Side-overhead product photography of the fictional VELORA clinic brand applied to a consultation folder, folded services brochure, appointment cards and a folded cream uniform with a small embroidered V monogram. Real paper fibres, ink and embroidery. Consistent VELORA typography in botanical green, ivory and warm grey. Objects are the focus. No devices, no people.",
      "Open silver laptop at a quiet skincare consultation table. Its large prominent screen shows a polished VELORA Skin Clinic service webpage, short heading Skin consultation, restrained botanical green and ivory identity, realistic service information and a clear Request consultation button. Include a small appointment card and clinic materials at the side. Device fills most of composition, subtle clinic context behind, no person holding it.",
      "Nearly front-facing desktop monitor in the administration corner of VELORA Skin Clinic. Screen prominently shows a clean consultation enquiry dashboard labelled DEMO DATA, with 128 Requests, 86% Complete, a small source breakdown and anonymised enquiry IDs. No health information or patient names. One notebook and a clinic folder support the context. Real monitor bezel and stand fully visible, screen sharp and dominant.",
    ],
  },
  {
    slug: "madar-solar",
    name: "Madar Solar",
    nameAr: "مدار للطاقة",
    title: "From solar search to a qualified site survey",
    intro:
      "A solar installer needs to reach suitable homeowners and businesses, then turn broad enquiries into survey requests that give engineers useful information.",
    requirements: [
      "Reach homeowners and businesses within the actual service coverage.",
      "Explain residential and commercial systems and the requirements of each.",
      "Collect property type, approximate consumption, service coverage and contact details.",
      "Route survey requests to sales and track their status.",
    ],
    services:
      "Website design and development, SEO and GEO, qualification forms and enquiry integration.",
    timeline:
      "8 weeks of implementation, with a simulated comparison after 4 months of content and website improvements.",
    stages: [
      [
        "Define the service and customer",
        "Connect the installer’s services with property-owner questions and the limits of service coverage.",
      ],
      [
        "Plan search and content",
        "Separate research, solution comparison and survey intent, then plan pages that answer each need.",
      ],
      [
        "Build the website and request journey",
        "Create service and coverage pages, develop the survey form and connect it to enquiry tracking.",
      ],
      [
        "Create content grounded in installation work",
        "Prepare materials that explain installation stages and practical questions through the company’s work.",
      ],
      [
        "Measure visibility and qualified requests",
        "Review organic visits, complete enquiries and confirmed site surveys.",
      ],
    ],
    metrics: [
      [
        "Monthly organic visits",
        "1,500",
        "2,700",
        "Equal simulated monthly periods; an increase of 80%.",
      ],
      [
        "Qualified survey requests per month",
        "20",
        "46",
        "Requests include service coverage, property type, consumption information and valid contact details.",
      ],
      [
        "Confirmed site surveys",
        "6",
        "18",
        "Confirmed bookings in each simulated month, not page visits or clicks.",
      ],
    ],
    outcome:
      "Clearer requests from suitable service areas reduce the time spent collecting initial information. The scenario does not claim a guaranteed search position or an actual AI citation.",
    scenes: [
      "Architectural editorial photograph of a completed modern solar array on a FLAT CONCRETE rooftop with parapet walls. Low-rise contemporary flat-roof buildings form an anonymous background. Panels and steel mounting frames are the focus, warm natural daylight and realistic wiring. No tiled roofs, no pitched roofs, no flags or identifiable location, no people.",
      "A solar engineer measures a FLAT CONCRETE rooftop beside the edge of an installed panel array. Close composition prioritises the roof, measuring tool and printed installation plan on a portable work surface. Engineer seen at side from waist down with natural hands using a tape measure; person subordinate. Practical mounting geometry. No roof tiles or location markers.",
      "Laptop on a solar engineering worktable, screen dominating the landscape photo. It displays a professional MADAR SOLAR content-planning workspace with three clear groups Learn, Compare systems, Request survey and page cards Home solar, Business solar, Service coverage. Printed electrical schematic and a small cable connector beside it. No geographical map names. No hand covers the screen.",
      "Landscape tablet firmly supported on a stand on a solar survey workbench, near a clamp meter and cable samples. Large crisp screen shows MADAR SOLAR survey request form, Property type with Home selected, Monthly consumption field and Continue button. Clear progress Step 2 of 4. The device and screen are dominant. No hands holding it, no background text or location.",
      "Documentary solar installation photograph on a flat concrete roof. Two technicians, small within the composition, align a photovoltaic panel onto a secure metal support frame. Panels, mounting brackets and installation work dominate. Natural safety equipment and plausible anatomy. Anonymous low-rise flat-roof context, no tiled roofs, no decorative unrelated objects.",
      "Desktop monitor at a solar company office desk, screen taking most of the frame. A recognisable Google-style search results page for solar installation, with the familiar multicolour Google wordmark, search box, blue results and grey snippets. Top visible fictional result MADAR SOLAR, Flat-roof solar systems, madar.example. Clearly visible label DEMO SEARCH RESULTS within screen. No location names or flags. Small solar component near the monitor. No floating UI outside screen.",
    ],
  },
  {
    slug: "tradebridge-expo",
    name: "TradeBridge Expo",
    nameAr: "جسور التجارة",
    title: "Turning trade-show visits into business meetings",
    intro:
      "An international industrial exhibition brings together equipment, energy and logistics businesses. Registration scattered across emails and spreadsheets is replaced by a coordinated participant journey.",
    requirements: [
      "Separate registration for exhibitors, trade visitors and buyers.",
      "Clear company, product and sector profiles.",
      "B2B meetings booked in advance with agreement from both parties.",
      "Fast badge entry and reports covering completed meetings and actual attendance.",
      "Multilingual registration and directories for international participants.",
    ],
    services:
      "Exhibition website, exhibitor portals, appointment web app and registration automation.",
    timeline:
      "12 weeks of implementation; two simulated editions, each with 120 exhibitors and 1,200 registered trade visitors.",
    stages: [
      [
        "Design participant journeys",
        "Define the information required from each participant type, registration rules and organiser workflows.",
      ],
      [
        "Build exhibitor and visitor portals",
        "Develop company and product profiles, participation approval and badge issuance.",
      ],
      [
        "Test business matching",
        "Test sector search, meeting selection, mutual approval and reminders.",
      ],
      [
        "Run entry and appointments",
        "Connect QR badges to attendance, then test entry and appointment schedules without duplicate registration.",
      ],
      [
        "Analyse commercial value",
        "Compare booked and completed meetings, then prepare reports for organisers and exhibitors.",
      ],
    ],
    metrics: [
      [
        "Average registration time",
        "6 min",
        "2 min",
        "Simulated measurement of the same registration journey.",
      ],
      [
        "Completed B2B meetings",
        "84",
        "156",
        "Attendance from both parties confirmed; cancelled appointments excluded.",
      ],
      [
        "Average peak entry wait",
        "9 min",
        "3 min",
        "Simulated peak-period samples from two editions of equal size.",
      ],
    ],
    outcome:
      "Success means completed business meetings and a more organised participation experience. A completed meeting is not represented as a closed sale.",
    scenes: [
      "International INDUSTRIAL trade exhibition, elevated aisle perspective. Credible equipment, energy and logistics company stands with real technical product displays and steel booth structures. Diverse business visitors smaller in scene. Main sign TRADEBRIDGE EXPO, short sector signs ENERGY, EQUIPMENT, LOGISTICS. Commercial B2B atmosphere, not weddings, decor, concerts or a conference auditorium. No flags, city names or actual companies.",
      "Close overhead exhibition planning table. Printed hall floorplan, separate EXHIBITOR, BUYER and VISITOR badges, company profile sheets and entrance route markers. Two hands arrange the badges and draw a route on the plan, entering from different sides. TRADEBRIDGE name subtly on the printed plan. No screens, no city or country names. Clear physical process.",
      "A laptop on an event organiser workstation, with an exhibition guide and printed badge beside it. Dominant screen shows TRADEBRIDGE Exhibitor Portal and a fictional NORDEX EQUIPMENT company profile with industrial pump thumbnail, Products, Team, Badge tabs and Profile approved status. Readable short headings, realistic purposeful interface. Venue hinted in soft background, no isolated screenshot.",
      "Candid B2B meeting inside an industrial exhibition stand. Two business representatives of different backgrounds discuss a real small precision mechanical assembly and its technical catalogue across a table. The sample and open catalogue dominate the foreground; people support the business interaction. Natural gestures, no disconnected handshake, no device required. Generic trade-show backdrop without locations.",
      "Portrait smartphone upright in a sturdy reception desk cradle at exhibition entry, photographed closely in a landscape scene. Crisp screen shows TRADEBRIDGE, DEMO PASS, Entry confirmed with a green check and two appointment times. A printed exhibitor badge sits beside a real QR scanner. No hand covers the screen. Device dominates; booth entry background is subtle.",
      "Desktop monitor in the exhibition management office with a softly blurred hall visible beyond a window. Dominant screen shows TRADEBRIDGE, DEMO REPORT, 156 Completed meetings and an attendance report with clear Booked and Attended rows. Purposeful chart and short labels, no random code. The actual screen bezel, stand and desk are visible. No UI outside device.",
    ],
  },
  {
    slug: "atlas-supply",
    name: "Atlas Supply",
    nameAr: "أطلس للتوريد",
    title: "From scattered quote requests to a reviewable workflow",
    intro:
      "An industrial supplier receives quote requests in different formats and languages. RelayOps brings documents, extracted fields and catalogue suggestions into one reviewable workflow, with staff retaining approval.",
    requirements: [
      "Collect quotation requests and attachments in one place.",
      "Extract items and quantities with a source reference for every field, then suggest catalogue matches.",
      "Route missing or uncertain information to human review.",
      "Send quotations only after staff approval and record each change.",
      "Support multilingual requests while standardising item names and units for review.",
    ],
    services:
      "AI and automation, an internal SaaS platform and system integrations.",
    timeline:
      "10-week pilot; simulated comparison using 200 representative requests per month.",
    stages: [
      [
        "Map the existing workflow",
        "Trace requests from email through classification, matching and pricing. Measure hands-on processing time.",
      ],
      [
        "Plan automation and its boundaries",
        "Map extraction, confidence checks and catalogue matching, followed by a human approval gate.",
      ],
      [
        "Build the review screen",
        "Display the source attachment beside the extracted fields and highlight missing or conflicting values.",
      ],
      [
        "Test exceptions and decisions",
        "Test duplicate attachments, ambiguous quantities and unmatched products, with a visible staff decision.",
      ],
      [
        "Pilot and review the return",
        "Start with a small team and compare preparation time and corrections before expanding use.",
      ],
    ],
    metrics: [
      [
        "Hands-on work per request",
        "38 min",
        "12 min",
        "Includes human review; this is not the supplier’s total response time.",
      ],
      [
        "Requests needing data-entry correction",
        "10 / 200",
        "3 / 200",
        "Simulated groups with the same request distribution and complexity.",
      ],
      [
        "Monthly administrative capacity released",
        "0 h",
        "≈87 h",
        "(38 − 12) × 200 ÷ 60 = 86.7 hours. Available work capacity, not proven cash savings.",
      ],
    ],
    outcome:
      "Staff review the important exceptions instead of manually copying every field. Final quotation approval and sending remain with the employee.",
    scenes: [
      "Wide desktop monitor at a real industrial purchasing workstation, close landscape photograph. Main screen shows RelayOps for ATLAS SUPPLY, a source quotation document on the left and extracted Item, Quantity, Unit fields on the right, plus Review required. Clear DEMO label. A metal parts catalogue, small industrial coupling and supplier cards beside monitor. Screen fills most frame. No personal data or locations.",
      "Top-down physical industrial purchasing workflow scene. Printed quote request, open metal-parts catalogue, numbered component labels and pencil notes showing repeated entry, with small mechanical samples at the table edge. Short printed headings Request, Catalogue, Pricing. Documents are the subject, no device, no full people, no addresses or location names.",
      "Small diverse operations team at either edge of a large physical whiteboard, faces secondary. Whiteboard dominates and clearly shows a simple process Request → Extract → Match → Human approval, with a separate Review uncertain fields branch. An industrial component and catalogue on foreground table. Realistic marker handwriting, practical SaaS automation planning, no sci-fi effects.",
      "Close three-quarter view of a desktop monitor showing the RelayOps source review screen. Left panel source quotation with Item P-204 and Qty 12; right panel extracted matching fields with source highlights and one amber Unit needs review field. A source-linked review interface, no decorative tables. Small metal coupling and document tray nearby. Screen sharp and dominant, DEMO DATA visible.",
      "Open dark laptop on a real operations workstation, screen dominant and unobstructed. RelayOps exception review interface with the heading Quantity needs review, an original document crop, an editable quantity 12, short audit history and a clear Approve draft button. Label DEMO. A pen and numbered parts catalogue beside the device. No hands over screen, no floating panels.",
      "Industrial purchasing employee and purchasing manager review a completed paper supply file at a workbench. Close crop prioritises open approved item checklist and numbered metal samples, two people seated at opposite sides with natural small gestures. Diverse team, faces secondary, realistic business context, no handshake pose, no monitor, no addresses.",
    ],
  },
  {
    slug: "safa-clinics",
    name: "Safa Clinics",
    nameAr: "عيادات صفا",
    title: "From fragmented booking calls to a clear appointment journey",
    intro:
      "A multi-specialty clinic group needs clearer branch and service information, a short appointment request flow and tools that help reception confirm and reschedule visits.",
    requirements: [
      "Find the specialty, branch and doctor without confusing navigation.",
      "Request an appointment in a few steps with a clear reception confirmation.",
      "A shared availability calendar with reminders and rescheduling.",
      "Keep booking separate from diagnosis and unnecessary health information.",
    ],
    services:
      "Website design, mobile experience, appointment systems and automated reminders.",
    timeline:
      "8 weeks of implementation, then two simulated 30-day periods of 2,000 website sessions each.",
    stages: [
      [
        "Understand booking questions",
        "Review reception questions and organise specialties, branches and visit information.",
      ],
      [
        "Design the mobile journey",
        "Arrange specialty, branch and time selection before asking for necessary contact information.",
      ],
      [
        "Prepare branch content",
        "Clarify opening hours, arrival guidance and what visitors need before their appointment.",
      ],
      [
        "Connect booking to reception",
        "Add confirmation, reminders and rescheduling with understandable request statuses.",
      ],
      [
        "Test the journey and measure attendance",
        "Test booking, confirmation and arrival, then measure completion and no-shows.",
      ],
    ],
    metrics: [
      [
        "Completed-booking conversion",
        "4.5%",
        "7.8%",
        "90 then 156 bookings from 2,000 sessions in each simulated period.",
      ],
      [
        "No-show rate",
        "18%",
        "11%",
        "Confirmed appointments due to take place; a 7-percentage-point improvement.",
      ],
      [
        "Administrative follow-up calls per booking",
        "2.0",
        "0.8",
        "Administrative information only; medical calls are excluded.",
      ],
    ],
    outcome:
      "A clearer journey for visitors and more organised reception work. The results concern booking and administration, not clinical outcomes.",
    scenes: [
      "Close photographic scene at a contemporary SAFA CLINICS reception counter. Desktop monitor displays a clean weekly appointment calendar, DEMO DATA, and appointment IDs instead of patient names. A branch card reading Clinic A, a small reception bell and tiny plant provide context. Screen is the focus, no patient photographs or medical records. Calm modern environment, no geographic location.",
      "Close overhead clinic planning table with physical cards Speciality, Clinic A, Clinic B, Choose time, Confirm and printed visitor journey notes. Quiet clinic workspace, simple reception materials. One hand sorts a card at the edge without obscuring the sequence. No device, no health records, no patient information or map locations.",
      "Smartphone standing on a clear acrylic cradle at SAFA CLINICS reception. Screen is large and clear in the composition, shows Book appointment, Choose a time, a simple calendar and 10:30 selected, Continue button. Synthetic demo booking, no patient names. Reception card and bell at side, background subtle. Nobody holds the phone, no floating UI.",
      "Architectural detail photograph of an accessible modern clinic entrance. Clear SAFA CLINICS wordmark, Reception arrow, Clinic A and a printed Before your visit instruction card on a nearby display stand. Focus on physical wayfinding, welcoming easy entry, no people dominating, no addresses, city names or country markers.",
      "Desktop screen at clinic reception viewed closely from a slight right angle. SAFA CLINICS calendar interface, DEMO DATA, selected booking A-014, status Confirmed and Reminder scheduled panel. Meaningful time slots and short labels, no medical details or patient names. Keyboard and reception notebook subtly visible, screen occupies most frame.",
      "Side-angle candid clinic arrival scene. Reception colleague welcomes an adult visitor beside a clear reception direction sign; framing focuses on a simple appointment card and check-in process, faces secondary. Natural anatomy, understated contemporary clinic, calm inclusive atmosphere. No treatment scene, no diagnosis, no personal information or geography.",
    ],
  },
  {
    slug: "mada-developments",
    name: "Mada Developments",
    nameAr: "مدى للتطوير العقاري",
    title: "Connecting projects, sales and buyer updates",
    intro:
      "A residential property developer needs one platform for its own phased projects, unit availability, internal sales and approved construction updates for buyers.",
    requirements: [
      "Present the developer’s identity, own projects and launch phases consistently.",
      "Explore masterplans, buildings, unit types, floor plans and current availability.",
      "Connect project enquiries to internal sales and manage changes to unit status.",
      "A buyer portal with approved construction updates and account-specific documents, without unapproved delivery promises.",
    ],
    services:
      "Corporate and project websites, buyer portal development, sales integrations and digital campaigns.",
    timeline:
      "12 weeks of phased implementation, then two equal simulated 30-day periods for enquiries and updates.",
    stages: [
      [
        "Organise project and phase data",
        "Map the relationship between project, phase, building and unit, and define who approves information across development, sales and buyer service.",
      ],
      [
        "Design project exploration",
        "Build developer and project pages with an interactive masterplan connecting buildings and units to specifications, availability and enquiries.",
      ],
      [
        "Prepare project launch materials",
        "Align campaign pages, brochures, site signage and sales materials around the same identity and message.",
      ],
      [
        "Connect sales and the buyer portal",
        "Connect unit-availability changes to internal approval and prepare approved construction updates for buyer accounts.",
      ],
      [
        "Operate updates and measure service",
        "Test enquiry routing and correct publication of updates, then review update time and manual follow-up requests.",
      ],
    ],
    metrics: [
      [
        "Qualified project enquiries per month",
        "35",
        "63",
        "Project, unit type, budget and contact details provided; simulated comparison with the same campaign budget.",
      ],
      [
        "Average unit-availability update time",
        "24 h",
        "2 h",
        "From internal approval of a status change to publication, not time to sell a unit.",
      ],
      [
        "Manual progress enquiries per 100 buyers",
        "46",
        "19",
        "Construction-status follow-up messages after approved portal updates become available.",
      ],
    ],
    outcome:
      "The platform connects the developer’s identity, projects, sales and buyer service. It clarifies availability and construction progress for the developer’s own projects, rather than acting as a multi-agency property catalogue.",
    scenes: [
      "Large landscape tablet supported on a presentation stand in a property developer showroom, beside a precise architectural model and project brochure. Dominant screen shows MADA DEVELOPMENTS and a coherent residential masterplan with Phase 1, Phase 2 and Explore units. Device is fully credible, screen occupies most frame; architectural model supports context. No location names, no brokerage listings.",
      "Close property development coordination meeting around a physical masterplan and architectural scale model of mid-rise residential buildings. Facade material samples at front, two team members only partially visible at opposite edges. Project and materials dominate. Natural hands pointing to model without blocking it. No tablets or location markers.",
      "Large desktop monitor in a real developer showroom with architectural models at the edge. Screen shows MADA DEVELOPMENTS interactive masterplan, one building selected and unit A-204, 2 bedrooms, Available, View floor plan. DEMO label. Screen sharp, real device dominant. Only one coherent development, no unrelated estate listings, no maps naming locations.",
      "Physical launch collateral for MADA DEVELOPMENTS on a worktable: premium project brochure, detailed unit floor plans, a small site-sign mockup and a scale building model. An unfinished residential facade softly visible beyond the table. Architecture and printed project materials are the subject, no devices, no location, no delivery-date claims.",
      "Laptop in a developer project office, close dominant screen displaying Development Hub. Clear unit A-204 status Available, Construction update Approved and a simple approval history, Publish update button, DEMO DATA. Architectural plan and material sample beside the device. Practical information hierarchy, no decorative random tables, no hands covering screen.",
      "Construction progress documentation at a mid-rise residential site. Engineer and project coordinator wearing proper hardhats, small to side, review a printed building plan and take a progress photograph with a compact camera. The concrete structure, facade works and visible progress dominate. Realistic proportions and safe worksite, no location signs or brand logos.",
    ],
  },
];

const out = [];
const jobs = [];
for (let i = 0; i < translations.length; i++) {
  const en = translations[i];
  const source = `docs/case-study-concepts/0${i + 1}-${en.slug}.md`;
  const md = await fs.readFile(source, "utf8");
  const req = md
    .split("## متطلبات العميل الافتراضي")[1]
    .split("## صورة الغلاف المقترحة")[0];
  const stages = [
    ...md.matchAll(/### (\d) ([^\n]+)\n+العمل: ([^\n]+)\n+الصورة: ([^\n]+)/g),
  ];
  const resultBlock = md
    .split("## نتائج السيناريو الافتراضي")[1]
    .split("## توجيه تنفيذ الصور")[0];
  const metrics = resultBlock
    .split("\n")
    .filter(
      (l) =>
        l.startsWith("| ") &&
        !l.startsWith("| المؤشر") &&
        !l.startsWith("| ---"),
    )
    .map((l) =>
      l
        .split("|")
        .slice(1, -1)
        .map((x) => x.trim()),
    );
  const ar = {
    name: en.nameAr,
    title: md.split("\n")[0].replace("# " + en.nameAr + " ", ""),
    intro: md.split("\n\n")[2],
    requirements: [...req.matchAll(/^- (.+)$/gm)].map((m) => m[1]),
    services: req.match(/الخدمات المرتبطة: (.+)/)[1],
    timeline: req.match(/الإطار الزمني داخل السيناريو: (.+)/)[1],
    stages: stages.map((m) => [m[2], m[3]]),
    metrics,
    outcome: resultBlock.trim().split("\n\n").at(-1),
  };
  const { scenes, nameAr, ...english } = en;
  delete english.slug;
  out.push({
    slug: en.slug,
    source,
    en: english,
    ar,
    images: scenes.map((_, j) => ({
      src: `/site/generated/case-studies/${en.slug}/${j ? "stage-" + j : "cover"}-v1.webp`,
      width: 1440,
      height: 1080,
    })),
  });
  scenes.forEach((scene, j) =>
    jobs.push({
      id: `${en.slug}/${j ? "stage-" + j : "cover"}`,
      slug: en.slug,
      slot: j ? "stage-" + j : "cover",
      prompt: `Create one finished editorial website photograph, landscape 4:3 aspect ratio, high resolution. ${scene} Art direction: photorealistic, carefully composed and visually polished; screens remain inside actual physical devices and are readable. Important objects fully in frame with 8% safe margins for responsive 4:3 placement. This is a fictional illustrative case study, not a real client. Preserve specified short names and interface labels. Do not add external overlay panels, bubbles, floating charts, captions, watermark, framing, shadows outside the photograph, city/country/address/flags, or CODEYEA branding. No collage of multiple scenes. Vary human poses naturally, exact plausible hands if present. This image occupies a closed 4:3 frame on both desktop and mobile; no popup elements.`,
      alt: {
        en: j ? en.stages[j - 1][0] : en.name + " concept cover",
        ar: j ? ar.stages[j - 1][0] : "غلاف " + en.nameAr,
      },
    }),
  );
}
await fs.writeFile(
  "src/content/concept-case-studies.json",
  JSON.stringify(out, null, 2) + "\n",
);
await fs.writeFile(
  "docs/CASE_STUDY_IMAGE_PLAN_20261014.json",
  JSON.stringify(
    {
      reference: "application-concepts/website-design-en.html#custom-cms",
      measuredFrames: {
        desktop: { viewport: 1563, width: 591.92, height: 443.94 },
        tablet: { viewport: 926, width: 415.33, height: 311.5 },
        mobile: { viewport: 433, width: 393.33, height: 295 },
      },
      aspectRatio:
        "4:3 at every breakpoint; dedicated responsive composition not required",
      mode: "built-in image_gen",
      jobs,
    },
    null,
    2,
  ) + "\n",
);
console.log({
  cases: out.length,
  images: jobs.length,
  stages: out.map((c) => c.ar.stages.length),
});
