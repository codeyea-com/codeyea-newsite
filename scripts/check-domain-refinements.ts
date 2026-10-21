import {refineDomains} from '../src/server/domain-refinements';
import assert from 'node:assert/strict';
const sample='<head></head><main><button id="country-tab">Countries</button><div id="more-extensions"></div><span class="d-faq-label">الأسئلة الشائعة</span></main></body>';
for(const locale of ['ar','en'])for(const country of ['IQ','US',undefined]){const h=refineDomains(sample,locale,country);assert.equal(h.includes('id="iraq-tab"'),country==='IQ');assert.equal(h.includes('id="iraq-panel"'),country==='IQ');assert.ok(h.includes('>FAQ</span>'));assert.ok(h.includes('domain-cta-title'));assert.ok(h.includes('/site/domain-refinements.js'));}
console.log('Domain locale and country visibility checks passed.');
