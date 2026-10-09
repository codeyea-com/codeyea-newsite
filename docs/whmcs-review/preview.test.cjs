const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const events={};
const nodes=new Map();
function node(){return {innerHTML:'',textContent:'',focus(){},classList:{add(){},remove(){}}}}
const context=vm.createContext({window:{addEventListener(){},scrollTo(){}},document:{querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)},querySelectorAll(){return []},addEventListener(type,fn){(events[type]??=[]).push(fn)},title:''},location:{hash:''},Intl,setTimeout(){},clearTimeout(){},FormData:class{constructor(form){return new Map(Object.entries(form.values||{}))}},matchMedia:()=>({matches:true})});
vm.runInContext(fs.readFileSync(path.join(__dirname,'catalog.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(__dirname,'app.js'),'utf8'),context);
const run=s=>vm.runInContext(s,context);
test('all 15 hosting plans retain source names, prices and limits',()=>{
 for(const g of run('catalog')){const file=g.id==='email-hosting'?'email-hosting-review':'hosting-visual-review';const html=fs.readFileSync(path.join(__dirname,'..',file,g.id+'-interactive.html'),'utf8');const raw=JSON.parse(html.match(/"slider":(\{[^]*?\}),"/)[1]);assert.deepEqual(Array.from(g.plans,p=>p.name),raw.names);assert.deepEqual(Array.from(g.plans,p=>p.price),raw.prices);for(const [i,p] of g.plans.entries())assert.equal(JSON.stringify(p.features),JSON.stringify(raw.rows.map(r=>[r[0],r[i+1]])))}
 assert.equal(run('catalog.reduce((n,g)=>n+g.plans.length,0)'),15);
});
test('annual discount, care monthly charge and existing-service add-ons are calculated separately',()=>{
 run("Object.assign(state,{kind:'hosting',group:'website-hosting',plan:1,cycle:'annual',care:'plus',existingService:false})");
 assert.equal(run('hostingTotal()'),115.2);
 assert.equal(run('subtotal()'),244.2);
 run('state.existingService=true');assert.equal(run('subtotal()'),129);
 assert.match(run('summary()'),/Already active · not charged again/);
 assert.doesNotMatch(run('configureStep()'),/name="cycle"/);
 run("Object.assign(state,{existingService:false,kind:'rescue',hours:1.5,care:'none'})");assert.equal(run('subtotal()'),112.5);
 run("Object.assign(state,{kind:'domain'})");assert.equal(run('subtotal()'),0);
});
test('domain form pattern accepts normal domains and rejects URLs',()=>{
 run("Object.assign(state,{kind:'hosting',existingService:false})");
 const html=run('domainStep()');const pattern=html.match(/pattern="([^"]+)"/)[1];const re=new RegExp('^(?:'+pattern+')$');assert.ok(re.test('mybrand.com'));assert.equal(re.test('https://mybrand.com'),false);
});
test('all review screens render and internal destinations are covered',()=>{
 const routes=['store/website-hosting','store/wordpress-hosting','store/cloud-hosting','store/email-hosting','support','domains','order/1','order/2','order/3','order/4','complete','dashboard','services','service','email-service','my-domains','domain-detail','invoices','invoice','tickets','ticket','new-ticket','account','login','register','reset','knowledge'];
 const heads=new Set(routes.map(r=>r.split('/')[0]).concat('plans'));
 run("Object.assign(state,{kind:'hosting',group:'website-hosting',plan:1,care:'none',order:true,step:4,domain:'mybrand.com',contact:{},existingService:false})");
 for(const r of routes){context.location.hash='#'+r;run('render()');const html=nodes.get('#main').innerHTML;assert.ok(html.length>300,r);assert.ok(!html.includes('undefined'),r);for(const match of html.matchAll(/href="#([^"/]+)[^"]*"/g))assert.ok(heads.has(match[1]),r+' links to '+match[1]);}
 for(const kind of ['rescue','domain']){run(`state.kind='${kind}'`);for(let i=1;i<=4;i++)assert.ok(run(`order(${i})`).length>300)}
});
test('email plans do not offer WordPress care; inputs are escaped',()=>{
 run("Object.assign(state,{kind:'hosting',group:'email-hosting',existingService:false,domain:'<script>alert(1)</script>'})");
 assert.doesNotMatch(run('configureStep()'),/name="care"/);
 assert.ok(run('summary()').includes('&lt;script&gt;'));
 assert.doesNotMatch(run('summary()'),/<script>/);
});
test('preview never sends orders, account details or credentials over a network',()=>{
 const js=fs.readFileSync(path.join(__dirname,'app.js'),'utf8');assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|localStorage|sessionStorage/);
 const html=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g))assert.ok(fs.existsSync(path.join(__dirname,m[1])),m[1]);
});
