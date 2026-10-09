import { snapshotSchema, type Snapshot } from "../schemas/content";

const slug = "beauty-skincare-med-spa" as const;
const name = "Beauty, Skincare & Med Spa";
const media = (mediaId: string, alt: string, width: number, height: number, focalX = 50, focalY = 50) => ({
  mediaId, alt, decorative: false, width, height, focalX, focalY,
  tabletFocalX: focalX, tabletFocalY: focalY, mobileFocalX: focalX, mobileFocalY: focalY,
});
const consultation = media("media_5df97550-86f5-475f-82e0-414ae5bbcb60", "A skincare professional consulting with a client in a calm treatment setting", 1880, 1253, 60, 40);
const treatmentRoom = media("media_092f5cd0-1303-4b3e-87d7-3e7c38c00772", "A clean and welcoming skincare treatment room", 1880, 1253);
const professional = media("media_5be789d8-8384-40f3-a0b1-c0b701ff00d4", "A skincare professional reviewing information on a tablet", 1280, 853, 45, 35);
const clinicInterior = media("media_798fa542-3fc6-4f2b-8a08-8189572e0b01", "A calm modern treatment room with clean neutral finishes", 1880, 1253, 50, 55);

export function beautyIndustrySnapshot(roofingSnapshot: Snapshot): Snapshot {
  const source = snapshotSchema.parse(roofingSnapshot);
  if (!source.industryDetail || source.industryDetail.slug !== "roofing") throw new Error("Beauty initialization requires the approved Roofing template.");
  const detail = structuredClone(source.industryDetail);
  detail.slug = slug;
  detail.hero = { title: name, media: consultation, temporaryMedia: true };
  detail.seo = {
    title: "Beauty, Skincare & Med Spa Digital Services | CODEYEA",
    description: "Website design, local search, branding, content structure and booking journeys for beauty, skincare and med spa businesses.",
  };
  for (const value of detail.sections) {
    value.id = `${slug}-${value.type}`;
    value.items.forEach((item, index) => { item.id = `${slug}-${value.type}-${index + 1}`; });
  }
  const section = (type: (typeof detail.sections)[number]["type"]) => {
    const value = detail.sections.find((candidate) => candidate.type === type);
    if (!value) throw new Error(`Roofing template is missing ${type}.`);
    return value;
  };
  Object.assign(section("overview"), {
    label: "The beauty, skincare and med spa industry",
    heading: "The beauty, skincare and med spa industry",
    body: "Clients often discover beauty providers through local search, social content, referrals and online reviews. Before contacting a business, they want to understand its services, professional credentials, approach and available booking options.\n\nA clear digital presence should make approved service information easy to navigate, support informed inquiries and present visual work with appropriate consent and context.\n\nCODEYEA connects website design, content organization, local search visibility and brand consistency around each business’s approved services, policies and customer journey.",
    temporaryMedia: true,
  });
  Object.assign(section("strip"), { label: "BEAUTY, SKINCARE & MED SPA IMAGES", heading: "Beauty, skincare and med spa environments", temporaryMedia: true });
  [consultation, treatmentRoom, professional, clinicInterior].forEach((image, index) => Object.assign(section("strip").items[index], { title: `Beauty, skincare and med spa environment ${index + 1}`, body: "", actionLabel: "", destination: "", media: image }));
  Object.assign(section("needs"), {
    label: "— OUR APPROACH", heading: "What beauty and med spa businesses need",
    body: "Beauty brands, skincare businesses and med spas need a polished digital presence that feels welcoming without oversimplifying treatments or services. Visitors should be able to distinguish service categories, understand who provides them and find the appropriate consultation or booking path.\n\nWe organize approved service information, provider details, locations, FAQs, policies and supported booking tools into a clear and manageable website structure.",
    actionLabel: "Approved services, clearly presented.", media: consultation, temporaryMedia: true,
  });
  [
    ["Clear service information", "Organize approved services, providers and relevant preparation or aftercare information without making unsupported medical or treatment claims."],
    ["Trustworthy brand presentation", "Use consistent branding, verified credentials, consent-based imagery and clear business policies to support informed decisions."],
    ["Practical booking journeys", "Connect inquiries, consultations or appointments to the systems supported by the business without creating confusing or misleading steps."],
  ].forEach(([title, body], index) => Object.assign(section("needs").items[index], { title, body, actionLabel: "", destination: "" }));
  Object.assign(section("imageBreak"), { label: "BEAUTY, SKINCARE & MED SPA", heading: "Beauty and skincare environments", media: treatmentRoom, temporaryMedia: true });
  Object.assign(section("services"), {
    label: "BEAUTY & AESTHETICS", heading: "Digital services for beauty and med spa businesses.",
    body: "People comparing beauty, skincare and med spa businesses want clear service information, credible presentation and simple next steps. We design websites and supporting digital materials around approved content and the systems the business actually uses.\n\nCODEYEA does not create or approve clinical claims. Treatment outcomes, safety claims, professional credentials, disclosures, prices and before-and-after materials remain subject to client approval and appropriate professional review.",
    actionLabel: "Digital services", listLabel: "OUR SERVICES", temporaryMedia: false,
  });
  ["Beauty and Med Spa Website Design", "Service Page Structure", "Local Search Foundations", "Consultation and Booking Journeys", "Brand Identity", "Before-and-After Gallery Design", "Social and Campaign Creative", "Website Maintenance and Support"].forEach((title, index) => Object.assign(section("services").items[index], { title, body: "", actionLabel: "", destination: "" }));
  Object.assign(section("growth"), { label: "The beauty and med spa growth path", heading: "The beauty and med spa growth path", temporaryMedia: false });
  [
    ["Attract", "Help relevant audiences discover approved services through clear landing pages and local search foundations."],
    ["Build Trust", "Present consistent branding, verified credentials, service information and business policies."],
    ["Convert", "Create clear consultation, inquiry or booking paths using the systems supported by the business."],
    ["Grow", "Review website performance and refine approved content and campaigns as business needs change."],
  ].forEach(([title, body], index) => Object.assign(section("growth").items[index], { title, body, actionLabel: "", destination: "" }));
  Object.assign(section("faq"), {
    label: "BEAUTY, SKINCARE & MED SPA FAQ", heading: "Questions about beauty, skincare and med spas",
    body: "Practical answers about digital services for beauty, skincare and med spa businesses.", actionLabel: "Get in touch", destination: "https://codeyea.com/contact/", temporaryMedia: false,
  });
  [
    ["Can you connect our booking or consultation system?", "We can evaluate supported third-party platforms and connect appropriate booking, consultation or inquiry journeys. Available functionality depends on the selected platform, account access and project scope."],
    ["Can you build a before-and-after gallery?", "Yes. We can create structured galleries using client-approved images and accurate context. The business remains responsible for obtaining appropriate consent and approving every image and statement before publication."],
    ["Do you write treatment or skincare claims?", "We can organize and edit information approved by the client and its qualified reviewers. We do not invent clinical claims, guarantee outcomes or present unsupported safety or effectiveness statements."],
    ["Can you improve our local search visibility?", "We can establish local search foundations around verified locations, services and business information. Search visibility depends on competition, website condition and ongoing work, so rankings are not guaranteed."],
    ["How do you approach privacy and customer information?", "We use privacy-conscious design and appropriate technical safeguards for the agreed website scope. Exact legal, consent and data-handling requirements depend on the business, jurisdiction and connected systems and require the owner’s review."],
  ].forEach(([title, body], index) => Object.assign(section("faq").items[index], { title, body, actionLabel: "", destination: "" }));
  Object.assign(section("related"), { label: "EXPLORE INDUSTRIES", heading: "EXPLORE INDUSTRIES", body: "", items: [], actionLabel: "", destination: "", temporaryMedia: false });
  Object.assign(section("cta"), { label: "LET’S TALK", heading: "Let’s talk beauty and aesthetics.", body: "", media: clinicInterior, temporaryMedia: true, actionLabel: "Start a Conversation", destination: "https://codeyea.com/contact/" });
  return snapshotSchema.parse({ title: name, sections: [], industryDetail: detail });
}
