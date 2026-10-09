import {test} from 'node:test';
import assert from 'node:assert/strict';
import {defaultHomepage} from '../src/content/homepage-defaults';
import {homepageEditorSchema} from '../src/schemas/homepage-editor';
import {snapshotSchema} from '../src/schemas/content';

test('homepage sections default to visible and support private visibility drafts',()=>{
 const homepage=defaultHomepage() as unknown as Record<string,Record<string,unknown>>;
 for(const name of ['hero','logos','services','about','experience','flow','hosting','projects','industries'] as const)
  assert.equal(homepage[name].enabled,true,`${name} should remain visible by default`);
 const hidden=homepageEditorSchema.parse({...homepage,projects:{...homepage.projects,enabled:false}}) as unknown as typeof homepage;
 assert.equal(hidden.projects.enabled,false);
});

test('legacy positioning snapshots remain valid while the CMS can hide the section',()=>{
 const legacy={title:'Home',sections:[{id:'positioning',type:'positioning',heading:'Heading',body:'Body'}]};
 assert.equal(snapshotSchema.parse(legacy).sections[0].enabled,undefined);
 assert.equal(snapshotSchema.parse({...legacy,sections:[{...legacy.sections[0],enabled:false}]}).sections[0].enabled,false);
});
