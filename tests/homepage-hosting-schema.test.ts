import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultHomepage} from '../src/content/homepage-defaults';
import {homepageEditorSchema,type EditorObject} from '../src/schemas/homepage-editor';

const fixture=()=>defaultHomepage() as unknown as Record<string,EditorObject>;
test('legacy homepage hosting snapshots remain readable without email fields',()=>{
 const home=fixture();delete home.hosting.emailPlans;delete home.hosting.emailFeatures;
 const parsed=homepageEditorSchema.parse(home) as unknown as Record<string,EditorObject>;
 assert.deepEqual(parsed.hosting.emailPlans,[]);assert.deepEqual(parsed.hosting.emailFeatures,[]);
});
test('email plans must reference their own features and valid prices',()=>{
 const home=fixture();home.hosting.emailPlans=structuredClone(home.hosting.plans);home.hosting.emailFeatures=structuredClone(home.hosting.features);
 assert.equal(homepageEditorSchema.safeParse(home).success,true);
 const plans=home.hosting.emailPlans as EditorObject[];
 plans[0].monthlyPrice='-1';assert.equal(homepageEditorSchema.safeParse(home).success,false);
 plans[0].monthlyPrice='$5';(plans[0].values as EditorObject[])[0].featureId='unrelated-web-feature';
 assert.equal(homepageEditorSchema.safeParse(home).success,false);
});
test('hosting supports four plans but rejects an oversized collection',()=>{
 const home=fixture(),plans=home.hosting.plans as EditorObject[];
 plans.push({...structuredClone(plans[0]),id:'plan-four',position:3});
 assert.equal(homepageEditorSchema.safeParse(home).success,true);
 plans.push({...structuredClone(plans[0]),id:'plan-five',position:4});
 assert.equal(homepageEditorSchema.safeParse(home).success,false);
});
