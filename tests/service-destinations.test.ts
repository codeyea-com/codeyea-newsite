import test from 'node:test';
import assert from 'node:assert/strict';
import { homepageServiceDestination, industryPageDestination, servicePageDestination, servicePageDestinationForText } from '../src/content/service-destinations';
import { industryNames, industrySlugs } from '../src/content/industry-registry';
import { publicDestination } from '../src/content/public-destination';

test('homepage service cards and industry carousel cards resolve to live page routes', () => {
  assert.equal(homepageServiceDestination('service-1'), '/services/web-mobile-apps/');
  assert.equal(homepageServiceDestination('service-2'), '/services/ecommerce/');
  assert.equal(homepageServiceDestination('service-8'), '/services/');
  assert.equal(homepageServiceDestination('unknown'), undefined);
  assert.equal(industryPageDestination('Healthcare & Aesthetic Clinics'), '/industries/healthcare/');
  assert.equal(industryPageDestination('eCommerce'), '/industries/e-commerce/');
  assert.equal(industryPageDestination('Oil & Gas'), '/industries/oil-and-gas/');
});

test('known service cards link to their corresponding approved page templates', () => {
  assert.equal(servicePageDestination('sv-service-website'), '/services/website-design/');
  assert.equal(servicePageDestination('sv-service-ai'), '/services/ai-automation/');
  assert.equal(servicePageDestination('sv-priority-seo'), '/services/seo-geo/');
  assert.equal(servicePageDestination('sv-service-brand'), '/services/brand-design/');
});

test('graphic design uses its implemented brand page while unknown services have no destination', () => {
  assert.equal(servicePageDestination('sv-service-graphic'), '/services/brand-design/');
  assert.equal(servicePageDestination('unknown'), undefined);
});

test('industry service copy resolves to relevant service pages and related industries', () => {
  assert.equal(servicePageDestinationForText('roofing-service-web','Roofing websites and service pages','Explore Web & App Development'), '/services/web-mobile-apps/');
  assert.equal(servicePageDestinationForText('roofing-service-search','Local SEO and business profiles','Explore SEO & Digital Growth'), '/services/seo-geo/');
  assert.equal(servicePageDestinationForText('roofing-service-campaigns','Focused campaigns and landing pages','Explore Digital Strategy'), '/services/digital-marketing/');
  assert.equal(industryPageDestination('Construction'), '/industries/construction/');
  assert.equal(industryPageDestination('Real Estate'), '/industries/real-estate/');
});

test('every registered industry has a public route and contact links target the inquiry form', () => {
  for (const slug of industrySlugs) {
    assert.equal(industryPageDestination(industryNames[slug]), `/industries/${slug}/`);
  }
  assert.equal(publicDestination('#contact'), '/contact/#contact-form');
  assert.equal(publicDestination('https://codeyea.com/contact/'), '/contact/#contact-form');
  assert.equal(publicDestination('/services/'), '/services/');
});
