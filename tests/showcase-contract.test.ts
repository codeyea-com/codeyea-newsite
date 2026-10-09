import {test} from 'node:test';
import assert from 'node:assert/strict';
import {aboutSectionSchema} from '../src/schemas/about';
import {defaultAbout} from '../src/content/about-defaults';

test('Showcase preserves old revisions and bounds new slides to four stable identities',()=>{
 const legacy={id:'about-showcase',type:'showcase',position:5,enabled:true,visibility:'all',label:'Reference',heading:'Showcase',body:'Copy',items:[]};
 assert.ok(aboutSectionSchema.safeParse(legacy).success);
 const current={...legacy,items:['social','mobile','ecommerce'].map((id,position)=>({id:'about-showcase-'+id,position,enabled:true,title:id,body:'Reference copy',label:'Reference kicker',ctaLabel:'Learn More',media:defaultAbout().sections[0].media}))};
 assert.ok(aboutSectionSchema.safeParse(current).success);
 for(const items of [current.items.slice(0,2),[...current.items,current.items[0]],[...current.items].reverse(),current.items.map((i,n)=>n===1?{...i,id:'replacement'}:i),current.items.map((i,n)=>n===1?{...i,media:undefined}:i)])
  assert.equal(aboutSectionSchema.safeParse({...current,items}).success,false);
 assert.equal(aboutSectionSchema.safeParse({...current,type:'principles',id:'about-principles'}).success,false);
 assert.deepEqual(aboutSectionSchema.parse(current).items,current.items);
 const four={...current,items:[...current.items,{...current.items[0],id:'about-showcase-ai',position:3,title:'AI & Workflow Automation'}]};
 assert.ok(aboutSectionSchema.safeParse(four).success);
 assert.deepEqual(aboutSectionSchema.parse(four).items.slice(0,3),current.items);
 assert.equal(aboutSectionSchema.safeParse({...four,items:[...four.items,{...four.items[3],id:'about-showcase-extra',position:4}]}).success,false);
 assert.equal(aboutSectionSchema.safeParse({...four,items:four.items.map((i,n)=>n===3?{...i,id:'arbitrary-fourth-slide'}:i)}).success,false);
});
