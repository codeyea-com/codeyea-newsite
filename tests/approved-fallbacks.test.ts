import {test} from 'node:test';
import assert from 'node:assert/strict';
import services from '../src/content/approved-services-fallback.json';
import about from '../src/content/approved-about-fallback.json';
import {servicesPageSchema} from '../src/schemas/services-page';
import {aboutSchema} from '../src/schemas/about';
import {publicDestination} from '../src/content/public-destination';

test('public Services fallback is the reviewed draft 6 with its approved composition and media',()=>{
 const page=servicesPageSchema.parse(services.servicesPage);
 assert.equal(page.sections.length,8);
 assert.deepEqual(page.sections.map(section=>section.items.length),[4,4,3,8,3,4,8,0]);
 assert.equal(page.sections[2].items[2].title,'Your Digital Growth Partner');
 assert.ok(page.hero.media.mediaId);
 assert.ok(page.sections[2].media?.mediaId);
 assert.equal(page.imageStatus,'available');
});
test('public About fallback contains the final reviewed draft 10 and preserves its three-column ending',()=>{
 const page=aboutSchema.parse(about.about);
 const project=page.sections.find(section=>section.type==='projectReference')!;
 const final=page.sections.find(section=>section.type==='awards')!;
 assert.equal(project.heading,'Connected Digital Capabilities');
 assert.equal(final.heading,'What We Bring to Every Project');
 assert.deepEqual(final.items.map(item=>item.title),['Clarity Before Complexity','Craft That Supports Use','Reliable Beyond Launch']);
 assert.equal(final.items.length,3);
});
test('approved contact destinations stay on the local request form',()=>{
 assert.equal(publicDestination('https://codeyea.com/contact/'),'/contact/#contact-form');
 assert.equal(publicDestination('/contact/'),'/contact/#contact-form');
 assert.equal(publicDestination('#contact'),'/contact/#contact-form');
});
