import test from 'node:test';
import assert from 'node:assert/strict';
import {scrollImageOffset,editorialEntrance} from '../src/components/motion/approved-patterns';
test('approved image travel is bounded, directly scroll driven and reverses without catch-up',()=>{
 assert.equal(scrollImageOffset(1000,551,1000),120);
 assert.equal(scrollImageOffset(-551,551,1000),-120);
 assert.equal(scrollImageOffset(5000,551,1000),120);
 assert.equal(scrollImageOffset(-5000,551,1000),-120);
 assert.ok(scrollImageOffset(200,551,1000)<scrollImageOffset(400,551,1000));
 assert.deepEqual(editorialEntrance,{distance:35,duration:1.8,delay:.18,stagger:.18,ease:'power4.out'});
});
