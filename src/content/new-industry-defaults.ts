import { snapshotSchema, type Snapshot } from '../schemas/content';
import { industryNames } from './industry-registry';

export const newIndustryContracts = {
  'restaurants-cafes-bakeries': {
    label: 'The restaurants, cafés and bakeries industry',
    seo: { title: 'Restaurants, Cafés & Bakeries Digital Services | CODEYEA', description: 'Website design, local search, digital menus, branding and ordering journeys for restaurants, cafés and bakeries.' },
    introduction: [
      'Customers often choose where to eat or order through local search, maps, menus, reviews and social content. They expect accurate hours, locations, menu information and a clear way to reserve, order or contact the business.',
      'A useful digital presence should make this information easy to find on any device while reflecting the atmosphere and identity of the business.',
      'CODEYEA connects website design, content organization, local search visibility and brand consistency around each business’s approved menu, locations and customer journey.',
    ],
    needsHeading: 'What food and hospitality businesses need',
    needs: [
      'Restaurants, cafés and bakeries need a digital presence that presents their menu and brand clearly while helping customers move quickly from discovery to a useful next step.',
      'We organize approved menus, locations, opening hours, galleries, contact details and supported ordering or reservation tools into a manageable website structure.',
    ],
    pillars: [
      ['Clear menus and locations', 'Present current menus, hours, addresses and service options in a format customers can scan easily.'],
      ['A recognizable brand', 'Use consistent visuals, photography and messaging across the website and supporting digital materials.'],
      ['Practical customer journeys', 'Connect reservations, ordering, catering inquiries or contact actions to the systems supported by the business.'],
    ],
    servicesHeading: 'Digital services for restaurants, cafés and bakeries.',
    services: ['Restaurant, Café and Bakery Website Design', 'Digital Menu Structure', 'Local Search Foundations', 'Ordering and Reservation Connections', 'Brand Identity', 'Food and Location Content Design', 'Campaign and Social Creative', 'Website Maintenance and Support'],
    growthHeading: 'The restaurants, cafés and bakeries growth path',
    growth: [
      ['Attract', 'Help local customers discover verified locations, menus and services.'],
      ['Build Trust', 'Present consistent branding, current information and approved photography.'],
      ['Convert', 'Create clear ordering, reservation, catering or inquiry paths.'],
      ['Grow', 'Review performance and refine approved menus, content and campaigns as the business changes.'],
    ],
    faqHeading: 'Questions about restaurants, cafés and bakeries',
    faq: [
      ['Can we update menus and prices ourselves?', 'The website can provide CMS-managed menu fields when included in the project scope. Authorized editors can update approved items, descriptions and prices without rebuilding the page.'],
      ['Can you connect our ordering or reservation platform?', 'We can evaluate and connect supported third-party systems. Available functionality depends on the selected provider, account access and project scope.'],
      ['Can one website support multiple locations?', 'Yes. The site can organize separate locations, hours, contact information and approved menus when the business supplies and maintains the required information.'],
      ['Can you improve our local search visibility?', 'We can establish local search foundations around verified locations, categories and business details. Rankings and customer traffic are not guaranteed.'],
      ['How should dietary and allergen information be handled?', 'We can provide structured fields for information approved by the business. The owner remains responsible for the accuracy, maintenance and required disclosures for menus and food information.'],
    ],
    cta: 'Let’s talk food and hospitality.',
  },
  'solar-energy': {
    label: 'The solar energy industry',
    seo: { title: 'Solar Energy Digital Services | CODEYEA', description: 'Website design, search visibility, project content and qualified inquiry journeys for solar energy businesses.' },
    introduction: [
      'Customers researching solar energy often compare providers, system types, project experience, service areas, warranties and available financing information before making an inquiry.',
      'A clear website should explain the company’s approved capabilities, distinguish residential and commercial services and make the next step easy to understand.',
      'CODEYEA connects website design, technical content organization, search visibility and brand consistency around each solar business’s verified services and project information.',
    ],
    needsHeading: 'What solar energy businesses need',
    needs: [
      'Solar companies need a professional digital presence that explains their capabilities without relying on unsupported savings, performance or payback claims.',
      'We organize approved services, service areas, project examples, technical information, FAQs and inquiry workflows into a clear structure for customers and business partners.',
    ],
    pillars: [
      ['Clear capabilities', 'Separate residential, commercial and other approved solar services with useful supporting information.'],
      ['Credible project evidence', 'Present client-approved projects, system details and company credentials with accurate context.'],
      ['Qualified inquiries', 'Use structured forms that collect the information required for an appropriate follow-up without promising an instant result.'],
    ],
    servicesHeading: 'Digital services for solar energy businesses.',
    services: ['Solar Energy Website Design', 'Residential and Commercial Service Pages', 'Project Gallery Structure', 'Local and Regional Search Foundations', 'Technical Content Organization', 'Corporate Brand Identity', 'Lead Qualification Forms', 'Website Maintenance and Support'],
    growthHeading: 'The solar energy growth path',
    growth: [
      ['Attract', 'Help relevant audiences discover verified solar services and service areas.'],
      ['Build Trust', 'Present approved capabilities, credentials and project evidence clearly.'],
      ['Convert', 'Create focused inquiry paths for residential, commercial or partner needs.'],
      ['Grow', 'Review website performance and refine approved content as services and markets change.'],
    ],
    faqHeading: 'Questions about solar energy',
    faq: [
      ['Can the website separate residential and commercial solar services?', 'Yes. We can organize distinct service journeys using the company’s approved capabilities and target audiences.'],
      ['Can you create quote or project inquiry forms?', 'Yes. Forms can collect relevant project and contact information for follow-up. They must not present an automatic quote as final unless an approved system supports it.'],
      ['Can we add completed solar projects?', 'The CMS can support project entries with approved images, locations, system information and results supplied by the business.'],
      ['Can you publish financing, incentive or tax-credit information?', 'We can structure information supplied and approved by the business. Time-sensitive programs, eligibility rules and financial information must be reviewed and maintained by the owner.'],
      ['Do you guarantee search rankings or solar leads?', 'No. We can implement search and conversion foundations, but rankings, inquiries, sales, energy production and financial outcomes cannot be guaranteed.'],
    ],
    cta: 'Let’s talk solar.',
  },
} as const;

export function newIndustrySnapshot(template: Snapshot, slug: keyof typeof newIndustryContracts): Snapshot {
  const source = snapshotSchema.parse(template);
  if (source.industryDetail?.slug !== 'roofing') throw new Error('Use the approved Roofing template.');
  const detail = structuredClone(source.industryDetail), copy = newIndustryContracts[slug];
  detail.slug = slug;
  detail.hero.title = industryNames[slug];
  detail.hero.temporaryMedia = true;
  detail.seo = { ...copy.seo };
  for (const s of detail.sections) {
    s.id = `${slug}-${s.type}`;
    s.items.forEach((item, n) => { item.id = `${slug}-${s.type}-${n + 1}`; });
    s.temporaryMedia = !!s.media || s.items.some(item => !!item.media);
  }
  const section = (type: typeof detail.sections[number]['type']) => detail.sections.find(s => s.type === type)!;
  const items = (type: typeof detail.sections[number]['type'], entries: readonly (readonly string[])[]) => {
    section(type).items = entries.map(([title, body = ''], n) => ({ id: `${slug}-${type}-${n + 1}`, title, body, actionLabel: '', destination: '' }));
  };
  Object.assign(section('overview'), { label: copy.label, heading: copy.label, body: copy.introduction.join('\n\n') });
  Object.assign(section('strip'), { label: industryNames[slug], heading: 'Temporary images — image selection pending' });
  section('strip').items.forEach((item, n) => { item.title = `Temporary image ${n + 1} — image selection pending`; item.body = ''; item.destination = ''; item.actionLabel = ''; });
  Object.assign(section('needs'), { label: '— OUR APPROACH', heading: copy.needsHeading, body: copy.needs.join('\n\n'), actionLabel: 'Approved services, clearly presented.' });
  items('needs', copy.pillars);
  Object.assign(section('imageBreak'), { label: industryNames[slug], heading: 'Temporary image — image selection pending' });
  // Reuse supplied introduction paragraphs in the two existing service-copy positions.
  Object.assign(section('services'), { label: industryNames[slug], heading: copy.servicesHeading, body: [copy.introduction[1], copy.introduction[2]].join('\n\n'), actionLabel: 'Digital services', listLabel: 'OUR SERVICES' });
  items('services', copy.services.map(title => [title]));
  Object.assign(section('growth'), { label: copy.growthHeading, heading: copy.growthHeading, body: '' });
  items('growth', copy.growth);
  Object.assign(section('faq'), { label: industryNames[slug] + ' FAQ', heading: copy.faqHeading, body: `Practical answers about digital services for ${industryNames[slug].toLocaleLowerCase('en')}.`, actionLabel: 'Get in touch', destination: 'https://codeyea.com/contact/' });
  items('faq', copy.faq);
  Object.assign(section('related'), { label: 'EXPLORE INDUSTRIES', heading: 'EXPLORE INDUSTRIES', body: '', items: [], actionLabel: '', destination: '' });
  Object.assign(section('cta'), { label: 'LET’S TALK', heading: copy.cta, body: '', actionLabel: 'Start a Conversation', destination: 'https://codeyea.com/contact/' });
  return snapshotSchema.parse({ title: industryNames[slug], sections: [], industryDetail: detail });
}
