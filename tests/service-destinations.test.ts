import test from 'node:test';
import assert from 'node:assert/strict';
import { industryPageDestination, servicePageDestination, servicePageDestinationForText } from '../src/content/service-destinations';

test('known service cards link to their corresponding approved page templates', () => {
  assert.equal(servicePageDestination('sv-service-website'), '/website-design/');
  assert.equal(servicePageDestination('sv-service-ai'), '/ai-automation/');
  assert.equal(servicePageDestination('sv-priority-seo'), '/seo-geo/');
  assert.equal(servicePageDestination('sv-service-brand'), '/brand-design/');
});

test('services without a matching public page do not invent a destination', () => {
  assert.equal(servicePageDestination('sv-service-graphic'), undefined);
  assert.equal(servicePageDestination('unknown'), undefined);
});

test('industry service copy resolves to relevant service pages and related industries', () => {
  assert.equal(servicePageDestinationForText('roofing-service-web','Roofing websites and service pages','Explore Web & App Development'), '/web-mobile-apps/');
  assert.equal(servicePageDestinationForText('roofing-service-search','Local SEO and business profiles','Explore SEO & Digital Growth'), '/seo-geo/');
  assert.equal(servicePageDestinationForText('roofing-service-campaigns','Focused campaigns and landing pages','Explore Digital Strategy'), '/digital-marketing/');
  assert.equal(industryPageDestination('Construction'), '/industries/construction/');
  assert.equal(industryPageDestination('Real Estate'), '/industries/real-estate/');
});
