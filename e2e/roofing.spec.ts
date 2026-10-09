import {assertTestEnvironment} from '../scripts/test-environment';assertTestEnvironment();
import {test,expect} from '@playwright/test';import {randomUUID,randomBytes} from 'node:crypto';import {hashPassword} from 'better-auth/crypto';import {db} from '../src/server/db';
import {roofingHubFixture} from '../tests/fixtures/roofing-hub';
const id='roofing-ui-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
test.beforeAll(async()=>{expect(await db.page.findUnique({where:{id:'roofing'}})).toBeNull();await db.user.create({data:{id,name:'Roofing test editor',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}})});
test.afterAll(async()=>{await db.auditLog.deleteMany({where:{actorId:id}});await db.page.deleteMany({where:{id:'roofing'}});await db.user.deleteMany({where:{id}});await db.$disconnect()});
test('Roofing editable static draft preserves private publication and saved preview',async({page})=>{
 await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.getByLabel('Page',{exact:true}).selectOption('roofing');await page.getByRole('button',{name:'Initialize Roofing draft'}).click();await expect(page.getByRole('heading',{name:'Roofing Hero'})).toBeVisible();
 await page.getByRole('navigation',{name:'Roofing sections'}).getByRole('button',{name:'1. ROOFING INDUSTRY OVERVIEW',exact:true}).click();await page.getByLabel('Section heading',{exact:true}).fill('Roofing overview under review');await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Draft saved with unpublished changes.'})).toBeVisible();
 await page.getByRole('button',{name:'Preview',exact:true}).click();await expect(page.getByTitle('Saved Roofing preview')).toBeVisible();await page.goto('/preview/industries/roofing');await expect(page.locator('h1')).toHaveText('Roofing');await expect(page.locator('.detail-section')).toHaveCount(9);await expect(page.locator('#roofing-faq h3')).toHaveCount(6);await expect(page.locator('#roofing-overview h2')).toHaveText('Roofing overview under review');
 for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);expect(await page.locator('.detail-section').evaluateAll(es=>es.every(e=>getComputedStyle(e).opacity==='1'&&getComputedStyle(e).transform==='none'))).toBe(true)}
 await page.locator('#roofing-services button').first().focus();const url=page.url();await page.keyboard.press('Enter');expect(page.url()).toBe(url);await expect(page.locator('#roofing-services button').first()).toBeFocused();
 await page.goto('/admin');await page.getByLabel('Page',{exact:true}).selectOption('roofing');await page.getByRole('button',{name:'Revisions',exact:true}).click();await page.getByRole('button',{name:'Preview version 1'}).click();await expect(page.getByRole('table')).toContainText('Roofing overview under review');const saved=await db.page.findUniqueOrThrow({where:{id:'roofing'}});expect(saved.publishedSnapshot).toBeNull();expect(saved.version).toBe(2);expect((await page.request.get('/industries/roofing/')).status()).toBe(404);
});
test('Roofing Hub composition: accordion, gallery, responsive fallback and isolation',async({page})=>{
 test.setTimeout(60000);
 await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/admin');
 const {page:saved}=await(await page.request.get('/api/cms?pageId=roofing')).json();
 const homeBefore=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 const response=await page.request.patch('/api/cms',{headers:{Origin:new URL(page.url()).origin},data:{...saved.draftSnapshot,pageId:'roofing',expectedVersion:saved.version,industryDetail:roofingHubFixture(saved.localeId,saved.marketId)}});expect(response.ok()).toBeTruthy();
 await page.goto('/preview/industries/roofing');await expect(page.locator('h1')).toHaveText('Roofing');await expect(page.locator('.rf-body>section')).toHaveCount(9);
 const faq=page.locator('.rf-accordion');await faq.locator('summary').nth(1).focus();await page.keyboard.press('Enter');await expect(faq.locator('details').nth(1)).toHaveAttribute('open','');await page.waitForTimeout(400);await expect(faq.locator('details[open]')).toHaveCount(1);
 await page.getByRole('button',{name:'Next roofing image'}).click();await expect(page.locator('.rf-strip-pagination')).toContainText('Image 2 of 4');
 for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:1000});await page.waitForTimeout(100);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);expect(await page.locator('main img').evaluateAll(es=>es.every(e=>(e as HTMLImageElement).complete))).toBeTruthy()}
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.motion-inner-scroll')).toHaveCount(0);await expect(page.locator('.rf-strip.is-enhanced')).toHaveCount(0);await faq.locator('summary').nth(2).click();await expect(faq.locator('details').nth(2)).toHaveAttribute('open','');
 const homeAfter=await db.page.findUniqueOrThrow({where:{id:'homepage'}});expect(homeAfter.draftSnapshot).toEqual(homeBefore.draftSnapshot);expect(homeAfter.publishedSnapshot).toEqual(homeBefore.publishedSnapshot);expect((await db.page.findUniqueOrThrow({where:{id:'roofing'}})).publishedSnapshot).toBeNull();
});

test('shared Roofing motion keeps frames fixed, sequence ordered and reduced content readable',async({page})=>{
 test.setTimeout(60000);
 await page.setViewportSize({width:1440,height:1000});
 await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/admin');
 await page.goto('/preview/industries/roofing');
 const frame=page.locator('.rf-image-break'),image=frame.locator('img');await frame.scrollIntoViewIfNeeded();await expect(frame).toHaveClass(/motion-inner-scroll/);
 const sample=()=>frame.evaluate(el=>{const r=el.getBoundingClientRect(),i=el.querySelector('img')!.getBoundingClientRect();return {top:r.top+scrollY,height:r.height,transform:getComputedStyle(el).transform,y:parseFloat((el.querySelector('img') as HTMLElement).style.getPropertyValue('--inner-y')),covered:i.top<=r.top+.5&&i.bottom>=r.bottom-.5}});
 await page.waitForTimeout(100);const first=await sample();await page.mouse.wheel(0,140);await page.waitForTimeout(100);const second=await sample();expect(second.top).toBeCloseTo(first.top);expect(second.height).toBe(first.height);expect(second.transform).toBe('none');expect(second.y).toBeLessThan(first.y);expect(second.covered).toBe(true);
 await page.mouse.wheel(0,-140);await page.waitForTimeout(100);expect((await sample()).y).toBeCloseTo(first.y,0);
 await page.locator('.rf-growth').scrollIntoViewIfNeeded();await expect(page.locator('.rf-growth')).toHaveAttribute('data-sequence-complete','true');await expect(page.locator('.motion-step-active')).toHaveCount(4);
 const cta=page.locator('.rf-cta'),ctaImage=cta.locator('img');await cta.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(1600);expect(await ctaImage.evaluate(e=>Number(getComputedStyle(e).scale))).toBeCloseTo(1.075);await cta.hover();await page.waitForTimeout(1600);expect(await ctaImage.evaluate(e=>Number(getComputedStyle(e).scale))).toBeCloseTo(1);
 await page.emulateMedia({reducedMotion:'reduce'});await expect(page.locator('.motion-inner-scroll')).toHaveCount(0);expect(await image.evaluate(e=>getComputedStyle(e).transform)).toBe('none');
 for(const width of [1440,1024,768,390,320]){await page.setViewportSize({width,height:1000});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);await expect(page.locator('.motion-step-active')).toHaveCount(4);}
 await page.locator('.rf-accordion summary').last().focus();await page.keyboard.press('Enter');await expect(page.locator('.rf-accordion details').last()).toHaveAttribute('open','');
});
