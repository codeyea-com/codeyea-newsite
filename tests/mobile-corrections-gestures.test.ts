import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('public/site/mobile-corrections.js','utf8');
function fixture(){
 let scroll=924,time=0;const events=new Map<string,Function>(),timers=new Map<number,{at:number;fn:Function}>();let timerId=0;
 const moves:number[]=[];
 const film={scrollLeft:300,events:new Map<string,Function>(),addEventListener(name:string,fn:Function){this.events.set(name,fn)},scrollBy({left}:{left:number}){this.scrollLeft+=left}};
 const cards=Array.from({length:4},(_,i)=>({before(anchor:any){anchor.getBoundingClientRect=()=>({top:1000+i*700-scroll})}}));
 const root={isConnected:true,querySelectorAll:()=>cards,getBoundingClientRect:()=>({top:1000-scroll,bottom:3800-scroll}),events:new Map<string,Function>(),addEventListener(name:string,fn:Function){this.events.set(name,fn)}};
 const context=vm.createContext({window:{},document:{body:{},querySelector:()=>null,querySelectorAll:(s:string)=>s==='.b-filmstrip'?[film]:s==='.v-showcases'?[root]:[],createElement:()=>({dataset:{},style:{},setAttribute(){}})},matchMedia:(q:string)=>({matches:q.includes('max-width'),addEventListener(){}}),MutationObserver:class{observe(){}},getComputedStyle:()=>({top:'76px'}),performance:{now:()=>time},innerHeight:900,scrollTo:({top}:{top:number})=>{scroll=top;moves.push(top)},addEventListener:(name:string,fn:Function)=>events.set(name,fn),requestAnimationFrame:()=>0,cancelAnimationFrame(){},setTimeout:(fn:Function,delay:number)=>{const id=++timerId;timers.set(id,{fn,at:time+delay});return id},clearTimeout:(id:number)=>timers.delete(id)});
 Object.defineProperty(context,'scrollY',{get:()=>scroll});
 new vm.Script(source).runInContext(context);
 function advance(ms:number){time+=ms;for(let n=0;n<20;n++){const next=[...timers].find(([,t])=>t.at<=time);if(!next)break;timers.delete(next[0]);next[1].fn()}}
 function event(x:number,y:number){let prevented=false;return {touches:[{clientX:x,clientY:y}],changedTouches:[{clientX:x,clientY:y}],target:{closest:()=>null},preventDefault(){prevented=true},get prevented(){return prevented}}}
 function wheel(deltaY:number){const e={deltaY,deltaX:0,deltaMode:0,ctrlKey:false,target:{closest:()=>null},prevented:false,preventDefault(){this.prevented=true}};events.get('wheel')!(e);return e;}
 return {film,root,moves,advance,event,wheel,get scroll(){return scroll}};
}
test('one vertical wheel burst advances one card, with an independent next gesture and free exit',()=>{
 const f=fixture();f.wheel(90);for(const n of [3,20,90,180]){f.advance(n);f.wheel(80)}
 assert.deepEqual(f.moves,[1624]);f.advance(800);f.wheel(150);assert.deepEqual(f.moves,[1624,2324]);
 f.advance(800);f.wheel(120);f.advance(800);assert.equal(f.scroll,3024);assert.equal(f.wheel(150).prevented,false);
});
test('vertical touch advances one card, while horizontal motion is left alone',()=>{
 const f=fixture();f.root.events.get('touchstart')!(f.event(150,600));const move=f.event(155,80);f.root.events.get('touchmove')!(move);assert.equal(move.prevented,true);f.root.events.get('touchend')!(move);assert.deepEqual(f.moves,[1624]);
 f.root.events.get('touchstart')!(f.event(150,600));const horizontal=f.event(10,580);f.root.events.get('touchmove')!(horizontal);f.root.events.get('touchend')!(horizontal);assert.equal(horizontal.prevented,false);assert.equal(f.moves.length,1);
});
test('horizontal filmstrip touch scrolls and vertical touch remains native',()=>{
 const f=fixture();f.film.events.get('touchstart')!(f.event(200,100));const move=f.event(60,105);f.film.events.get('touchmove')!(move);assert.equal(move.prevented,true);assert.equal(f.film.scrollLeft,440);f.film.events.get('touchend')!(move);assert.ok(f.film.scrollLeft<=680);
 const before=f.film.scrollLeft;f.film.events.get('touchstart')!(f.event(200,100));const vertical=f.event(195,350);f.film.events.get('touchmove')!(vertical);assert.equal(vertical.prevented,false);assert.equal(f.film.scrollLeft,before);
});

const planSource=fs.readFileSync('public/site/hosting-plan-cards.js','utf8');
const touchBlock=planSource.slice(planSource.indexOf('// A touch gesture'),planSource.indexOf('// Match the homepage'));
for(const ar of [false,true])test(`large hosting-plan swipes move only one adjacent card (${ar?'RTL':'LTR'})`,()=>{
 const events=new Map<string,Function>(),moves:number[]=[];let index=2;
 const context=vm.createContext({ar,track:{scrollLeft:0,clientWidth:300,addEventListener:(name:string,fn:Function)=>events.set(name,fn)},cards:[{offsetLeft:0},{offsetLeft:ar?-300:300}],nearest:()=>index,goTo:(i:number)=>{index=Math.max(0,Math.min(4,i));moves.push(index)},matchMedia:()=>({matches:true}),setTimeout(){},suppressClick:false});
 new vm.Script(touchBlock).runInContext(context);
 const e=(x:number,y:number)=>({touches:[{clientX:x,clientY:y}],changedTouches:[{clientX:x,clientY:y}],target:{closest:()=>null},preventDefault(){}});
 events.get('touchstart')!(e(250,100));events.get('touchmove')!(e(-1800,105));events.get('touchend')!(e(-1800,105));assert.deepEqual(moves,[ar?1:3]);
 events.get('touchstart')!(e(250,100));events.get('touchmove')!(e(245,600));events.get('touchend')!(e(245,600));assert.equal(moves.length,1);
});
