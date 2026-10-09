import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';
import {randomUUID,randomBytes} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {mkdirSync} from 'node:fs';
import {db} from '../src/server/db';
import {Prisma} from '../src/generated/prisma/client';
import {readFileSync} from 'node:fs';
const id='correction3-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
let original:Awaited<ReturnType<typeof db.page.findUniqueOrThrow>>;
let sections:{id:string;heading:string;body:string}[];
test.beforeAll(async()=>{
 mkdirSync('docs/homepage-correction-3',{recursive:true});
 original=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 sections=await db.pageSection.findMany({where:{pageId:'homepage'},select:{id:true,heading:true,body:true}});
 await db.user.create({data:{id,name:'Isolated correction reviewer',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}});
});
test.afterAll(async()=>{
 if(original)await db.$transaction(async tx=>{
  await tx.page.update({where:{id:'homepage'},data:{title:original.title,draftSnapshot:original.draftSnapshot??Prisma.DbNull,publishedSnapshot:original.publishedSnapshot??Prisma.DbNull,version:original.version,updatedBy:original.updatedBy,updatedAt:original.updatedAt}});
  for(const section of sections)await tx.pageSection.update({where:{id:section.id},data:{heading:section.heading,body:section.body}});
 });
 await db.auditLog.deleteMany({where:{actorId:id}});await db.pageRevision.deleteMany({where:{actorId:id}});await db.user.deleteMany({where:{id}});await db.$disconnect();
});
test('targeted Services correction, grid alignment, shared placeholder and configured CTA',async({page})=>{
 test.setTimeout(90000);
 await page.setViewportSize({width:1440,height:1000});
 expect((await page.request.post('/api/auth/sign-in/email',{headers:{Origin:process.env.BETTER_AUTH_URL!},data:{email,password}})).ok()).toBe(true);
 const {page:before}=await(await page.request.get('/api/cms')).json();
 const comparison=JSON.parse(readFileSync('docs/homepage-correction-3/draft-comparison.json','utf8'));
 const home=structuredClone(before.homepage);
 for(const item of home.services.items)item.body=comparison.changes.find((row:{field:string})=>row.field===`homepage.services.items[${item.id}].body`).after;
 const sections=before.sections.map((section:{id:string})=>({...section,body:comparison.changes.find((row:{field:string})=>row.field===`sections[${section.id}].body`).after}));
 home.flow.items[0].ctaHref='';home.flow.items[0].ctaLabel='';
 home.flow.items[1].ctaHref='#services';home.flow.items[1].ctaLabel='Explore Details';
 expect((await page.request.patch('/api/cms',{headers:{Origin:process.env.BETTER_AUTH_URL!},data:{pageId:before.id,expectedVersion:before.version,title:before.title,sections,homepage:home}})).ok()).toBe(true);
 const after=await(await page.request.get('/api/cms')).json();expect(after.page.publishedSnapshot).toEqual(before.publishedSnapshot);
 await page.goto('/preview');await page.emulateMedia({reducedMotion:'reduce'});
 for(const width of [1440,768,390]){
  await page.setViewportSize({width,height:1000});await page.locator('#services').scrollIntoViewIfNeeded();
  const position=await page.locator('#positioning h2').boundingBox(),card=await page.locator('#services article').first().boundingBox(),description=await page.locator('.hp-positioning-body').boundingBox();
  expect(position!.x).toBeCloseTo(card!.x,0);expect(description!.x).toBeCloseTo(card!.x,0);
  await expect(page.locator('#positioning h2')).toHaveCSS('color','rgb(7, 36, 72)');
  await expect(page.locator('.hp-positioning-body')).toHaveCSS('color','rgb(18, 18, 18)');
  for(const item of await page.locator('#services article').all()){expect((await item.locator('p > [aria-hidden="true"]').innerText()).trim().split(/\s+/).length).toBeLessThan(16);await expect(item).toHaveCSS('border-left-width','0px');await expect(item.locator('p')).toHaveCSS('color','rgb(18, 18, 18)');}
  expect(await page.locator('main').evaluate(el=>getComputedStyle(el).backgroundImage)).toContain('0.09');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 }
 await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
 const placeholder=page.locator('#technical-support .hp-flow-action'),anchor=page.locator('#branding .hp-flow-action');
 await expect(placeholder).toHaveAttribute('type','button');await expect(placeholder).not.toHaveAttribute('href');
 await expect(page.getByText('Service destination awaiting configuration',{exact:true})).toHaveCount(0);
 for(const action of [placeholder,anchor]){
  await action.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.locator('body').evaluate(()=> (document.activeElement as HTMLElement)?.blur());
  const circle=action.locator('.hp-flow-action-circle'),plus=circle.locator('span');
  await expect(circle).toHaveCSS('background-color','rgba(0, 0, 0, 0)');await expect(action.locator('.hp-flow-action-label')).toHaveCSS('color','rgb(25, 30, 50)');
  const box=(await circle.boundingBox())!;await page.mouse.move(box.x+box.width-5,box.y+box.height-5);await page.waitForTimeout(450);
  await expect(circle).toHaveCSS('background-color','rgb(25, 30, 50)');await expect(plus).toHaveCSS('color','rgb(255, 255, 255)');
  const offset=await circle.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--plus-x')));expect(offset).toBeGreaterThan(1);expect(offset).toBeLessThanOrEqual(4);
  await page.mouse.move(box.x+5,box.y+5);await page.waitForTimeout(500);expect(await circle.evaluate(el=>parseFloat((el as HTMLElement).style.getPropertyValue('--plus-x')))).toBeLessThan(-1);
  await page.mouse.move(0,0);await expect(circle).toHaveCSS('background-color','rgba(0, 0, 0, 0)');await page.waitForTimeout(900);expect(await circle.evaluate(el=>(el as HTMLElement).style.getPropertyValue('--plus-x'))).toBe('0px');
  await page.keyboard.press('Tab');await action.focus();await expect(circle).toHaveCSS('background-color','rgb(25, 30, 50)');await expect(action).toHaveCSS('outline-style','solid');
  await page.keyboard.press('Tab');await expect(circle).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
  await page.emulateMedia({reducedMotion:'reduce'});await action.hover();await expect(plus).toHaveCSS('transform','none');await page.emulateMedia({reducedMotion:'no-preference'});
 }
 await placeholder.click();expect(page.url()).toMatch(/\/preview$/);await anchor.click();expect(page.url()).toMatch(/#services$/);await expect(page.locator('#services')).toBeInViewport();
});

test('coarse-pointer CTA responds to touch and keyboard without pointer following',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:390,height:844},isMobile:true,hasTouch:true});const page=await context.newPage();
 expect((await page.request.post('/api/auth/sign-in/email',{headers:{Origin:process.env.BETTER_AUTH_URL!},data:{email,password}})).ok()).toBe(true);
 await page.goto('/preview');const action=page.locator('#technical-support .hp-flow-action'),circle=action.locator('.hp-flow-action-circle');await action.scrollIntoViewIfNeeded();
 await expect(circle).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 const box=(await circle.boundingBox())!,touch=await context.newCDPSession(page);
 await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:box.x+box.width/2,y:box.y+box.height/2}]});
 await expect(circle).toHaveCSS('background-color','rgb(25, 30, 50)');await expect(circle.locator('span')).toHaveCSS('transform','none');
 await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(circle).toHaveCSS('background-color','rgba(0, 0, 0, 0)');
 await page.keyboard.press('Tab');await action.focus();await expect(circle).toHaveCSS('background-color','rgb(25, 30, 50)');await expect(action).toHaveCSS('outline-style','solid');
 await context.close();
});

for(const width of [1440,390])test(`finite Industries rewind and pause rules at ${width}`,async({browser,baseURL})=>{
 test.setTimeout(120000);
 const context=await browser.newContext({baseURL,viewport:{width,height:1000},isMobile:width===390,hasTouch:width===390});const page=await context.newPage();
 await page.goto('/');await page.locator('#industries').scrollIntoViewIfNeeded();await page.waitForTimeout(500);await page.clock.install();
 const root=page.locator('.hp-carousel--industry'),count=root.locator('.hp-carousel-count > span').first(),next=root.getByRole('button',{name:'Next Industries slide'}),prev=root.getByRole('button',{name:'Previous Industries slide'});
 const advance=async(n:number)=>{for(let i=0;i<n;i++){await next.evaluate(el=>(el as HTMLButtonElement).click());await page.clock.runFor(900);}};
 await root.locator('.hp-carousel-viewport').focus();await advance(6);await expect(count).toHaveText('07');await advance(1);await expect(count).toHaveText('08');await expect(next).toBeDisabled();await expect(prev).toBeEnabled();
 await page.clock.runFor(900);await expect(root.locator('.hp-carousel-slide')).toHaveCount(8);
 const geometry=await root.locator('.hp-carousel-slide').evaluateAll(slides=>slides.map(el=>{const box=el.getBoundingClientRect();return{x:box.x,right:box.right,width:box.width}}));
 for(let i=1;i<geometry.length;i++)expect(geometry[i].x-geometry[i-1].right).toBeCloseTo(16,0);
 expect(geometry[0].right).toBeLessThan(0);expect(geometry[7].right).toBeLessThanOrEqual(width);
 // Focus pauses the terminal rewind.
 await page.clock.runFor(7200);await expect(count).toHaveText('08');
 await page.locator('body').evaluate(()=> (document.activeElement as HTMLElement)?.blur());await page.mouse.move(0,0);
 await page.clock.runFor(5500);await expect(count).toHaveText('08');await page.clock.runFor(1100);await expect(count).toHaveText('01');await expect(prev).toBeDisabled();
 await expect(root.locator('.hp-carousel-progress > span')).toHaveCSS('transform','matrix(0.125, 0, 0, 1, 0, 0)');await expect(root.locator('.hp-carousel-track')).toHaveCSS('opacity','1');
 if(width===1440){await root.hover();await page.clock.runFor(6000);await expect(count).toHaveText('01');await page.mouse.move(0,0);}
 // Exercise the visibility event used when a tab becomes hidden, without freezing its clock.
 await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>true});document.dispatchEvent(new Event('visibilitychange'));});
 await page.clock.runFor(7000);await expect(count).toHaveText('01');
 await page.evaluate(()=>{delete (document as unknown as {hidden?:boolean}).hidden;document.dispatchEvent(new Event('visibilitychange'));});
 await page.locator('#top').scrollIntoViewIfNeeded();await expect(root).not.toBeInViewport();await page.waitForTimeout(100);await page.clock.runFor(7000);await expect(count).toHaveText('01');
 await page.locator('#industries').scrollIntoViewIfNeeded();await page.emulateMedia({reducedMotion:'reduce'});await page.clock.runFor(7000);await expect(count).toHaveText('01');
 await root.locator('.hp-carousel-viewport').focus();await page.keyboard.press('ArrowRight');await page.clock.runFor(50);await expect(count).toHaveText('02');await page.keyboard.press('ArrowLeft');await page.clock.runFor(50);await expect(count).toHaveText('01');
 await page.emulateMedia({reducedMotion:'no-preference'});await page.locator('body').evaluate(()=> (document.activeElement as HTMLElement)?.blur());
 const view=(await root.locator('.hp-carousel-viewport').boundingBox())!;
 if(width===390){
  const touch=await context.newCDPSession(page),y=view.y+100;
  await touch.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:view.x+view.width*.8,y}]});
  await page.clock.runFor(7000);await expect(count).toHaveText('01');
  for(let step=1;step<=12;step++){await touch.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:view.x+view.width*(.8-.6*step/12),y}]});await page.clock.runFor(20);}
  await touch.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await page.clock.runFor(1500);await expect(count).not.toHaveText('01');
 }else{
  await page.mouse.move(view.x+view.width*.8,view.y+100);await page.mouse.down();await page.clock.runFor(7000);await expect(count).toHaveText('01');await page.mouse.move(view.x+view.width*.2,view.y+100,{steps:12});await page.mouse.up();await page.clock.runFor(1500);await expect(count).not.toHaveText('01');
 }
 await context.close();
});
