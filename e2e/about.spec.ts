import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect,type Page} from '@playwright/test';
import {randomUUID,randomBytes} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {db} from '../src/server/db';
import type {Snapshot} from '../src/schemas/content';
import {defaultAbout} from '../src/content/about-defaults';

const id='about-browser-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
const origin=process.env.BETTER_AUTH_URL!;
let home:Awaited<ReturnType<typeof db.page.findUniqueOrThrow>>;
let ownsFixture=false;
test.describe.configure({mode:'serial'});
test.beforeAll(async()=>{
 expect(await db.page.findUnique({where:{id:'about'}}),'About browser tests require an unused isolated About fixture').toBeNull();
 home=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 await db.user.create({data:{id,name:'Isolated About reviewer',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}});
 ownsFixture=true;
});
test.afterAll(async()=>{
 if(ownsFixture){
  try{expect(await db.page.findUniqueOrThrow({where:{id:'homepage'}})).toEqual(home);}
  finally{await db.auditLog.deleteMany({where:{actorId:id}});await db.page.deleteMany({where:{id:'about'}});await db.user.deleteMany({where:{id}});}
 }
 await db.$disconnect();
});
async function login(page:Page){
 await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Homepage sections'})).toBeVisible();
}
async function save(page:Page,snapshot:Snapshot){
 const current=await(await page.request.get('/api/cms?pageId=about')).json();
 const response=await page.request.patch('/api/cms',{headers:{origin},data:{...snapshot,pageId:'about',expectedVersion:current.page.version}});
 expect(response.status(),await response.text()).toBe(200);
 return response.json();
}
const baseline=():Snapshot=>({title:'About',sections:[],about:defaultAbout('en','global')});
test('About authenticated initialization and private save preserve public boundaries',async({page,request})=>{
 await login(page);
 expect((await page.request.get('/api/cms?pageId=about')).status()).toBe(404);
 expect((await request.get('/api/cms?pageId=about')).status()).toBe(401);
 expect((await request.post('/api/cms',{headers:{origin},data:{pageId:'about'}})).status()).toBe(401);
 expect([302,303,307]).toContain((await request.get('/preview/about',{maxRedirects:0})).status());
 expect((await request.get('/about/')).status()).toBe(404);
 expect((await page.request.post('/api/cms',{headers:{origin:'https://invalid.example'},data:{pageId:'about'}})).status()).toBe(403);
 const initialized=await page.request.post('/api/cms',{headers:{origin},data:{pageId:'about'}});expect(initialized.status()).toBe(200);
 const first=await initialized.json();expect(first.publishedSnapshot).toBeNull();
 const repeated=await(await page.request.post('/api/cms',{headers:{origin},data:{pageId:'about'}})).json();expect(repeated.version).toBe(first.version);
 const snapshot=baseline();snapshot.about!.sections.find(s=>s.type==='who')!.heading='Private About browser revision';
 await save(page,snapshot);
 const stale=await page.request.patch('/api/cms',{headers:{origin},data:{...snapshot,pageId:'about',expectedVersion:first.version}});expect(stale.status()).toBe(409);
 const row=await db.page.findUniqueOrThrow({where:{id:'about'}});expect(row.publishedSnapshot).toBeNull();expect(row.publishedAt).toBeNull();expect(row.status).toBe('DRAFT');
 expect((await request.get('/about/')).status()).toBe(404);
 await page.goto('/preview/about');await expect(page.getByRole('heading',{name:'Private About browser revision'})).toBeVisible();
 await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
 await save(page,baseline());
});

test('About responsive preview, process keyboard, shared navigation and motion fallbacks',async({page,browser})=>{
 test.setTimeout(120000);const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
 await login(page);await page.goto('/preview/about');
 for(const [width,height] of [[1440,1000],[1280,900],[1024,900],[768,900],[390,844],[375,812],[320,740],[812,375]]){
  await page.setViewportSize({width,height});
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${width}x${height}`).toBe(true);
  await expect(page.locator('#about-selectedWork')).toHaveCount(0);
 }
 await page.setViewportSize({width:1440,height:1000});
 const steps=page.locator('.about-process-step');expect(await steps.count()).toBeGreaterThan(1);
 await steps.first().focus();await page.keyboard.press('ArrowRight');await expect(steps.nth(1)).toBeFocused();await expect(steps.nth(1)).toHaveAttribute('aria-current','step');
 await page.keyboard.press('End');await expect(steps.last()).toBeFocused();await page.keyboard.press('Home');await expect(steps.first()).toBeFocused();
 for(const body of await page.locator('.about-process-item p').all())await expect(body).toBeVisible();
 await expect(page.locator('.hp-header a[aria-current="page"]').first()).toHaveAttribute('href','/preview/about');
 await expect(page.locator('.hp-footer')).toBeVisible();
 for(const link of await page.locator('.hp-header a[href^="#"],.hp-footer a[href^="#"]').all()){
  const href=await link.getAttribute('href');if(href&&href.length>1)await expect(page.locator(href)).toHaveCount(1);
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await expect(page.locator('.about-capability-layout')).not.toHaveClass(/is-enhanced/);
 await expect(page.locator('.about-capability-stage')).toBeHidden();
 for(const inline of await page.locator('.about-capability-inline').all())expect((await inline.boundingBox())!.width).toBeGreaterThan(100);
 const context=await browser.newContext({baseURL:origin,viewport:{width:1280,height:900},hasTouch:true,storageState:await page.context().storageState()});
 try{const touch=await context.newPage();await touch.goto('/preview/about');await expect(touch.locator('.about-capability-layout')).not.toHaveClass(/is-enhanced/);await expect(touch.locator('.about-capability-stage')).toBeHidden();for(const inline of await touch.locator('.about-capability-inline').all())expect((await inline.boundingBox())!.width).toBeGreaterThan(100);}finally{await context.close();}
 expect(errors).toEqual([]);
});

test('About section device visibility and disabled states retain exactly one heading',async({page})=>{
 test.setTimeout(180000);await login(page);
 try{
  for(const visibility of ['all','desktop','tablet','mobile'] as const){
   const snapshot=baseline();for(const section of snapshot.about!.sections)if(section.type!=='selectedWork')section.visibility=visibility;
   await save(page,snapshot);await page.goto('/preview/about');
   for(const [device,width] of [['desktop',1440],['tablet',1024],['mobile',390]] as const){
    await page.setViewportSize({width,height:900});await expect(page.locator('h1')).toHaveCount(1);
    const visible=visibility==='all'||visibility===device;
    for(const section of snapshot.about!.sections.filter(s=>s.type!=='selectedWork')){
     const locator=page.locator('#'+(section.type==='process'?'how-we-work':section.id));
     if(visible)await expect(locator).toBeVisible();else await expect(locator).toBeHidden();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
   }
  }
  const disabled=baseline();for(const section of disabled.about!.sections)section.enabled=false;
  await save(page,disabled);await page.goto('/preview/about');
  await expect(page.locator('h1')).toHaveCount(1);await expect(page.locator('main .about-section')).toHaveCount(0);
 }finally{await save(page,baseline());}
});
