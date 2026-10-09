import { assertTestEnvironment } from '../scripts/test-environment';
import { test, expect, type Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
assertTestEnvironment();
const evidence='docs/final-homepage-review';
mkdirSync(evidence,{recursive:true});
async function reveal(page:Page) {
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const selector of ['#top','#positioning','#services','#about','.hp-experience','#service-flow','#hosting','#work','#industries','#contact']) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
  }
  await page.locator('img').evaluateAll(images=>Promise.all(images.map(async img=>{if(img instanceof HTMLImageElement){img.loading='eager';await img.decode().catch(()=>{});}})));
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.waitForTimeout(150);
}
test('final desktop composition and motion recording',async({browser,baseURL})=>{
  test.setTimeout(120000);
  const context=await browser.newContext({baseURL,viewport:{width:1440,height:960},recordVideo:{dir:evidence+'/raw',size:{width:1440,height:960}}});
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');const published=await (await page.request.get('/api/public-page')).json();
  const services=page.locator('.hp-desktop-nav .hp-nav-item').filter({has:page.locator('a[href="#services"]')});
  await services.locator('a').first().hover();
  await expect(services.locator('details')).toHaveAttribute('open','');
  await expect(services.locator('.hp-mega-panel')).toBeVisible();
  await services.locator('.hp-mega-panel a').last().hover();await page.waitForTimeout(450);
  await expect(services.locator('details')).toHaveAttribute('open','');
  await page.mouse.move(5,400);await expect(services.locator('details')).not.toHaveAttribute('open','');
  await services.locator('summary').focus();await page.keyboard.press('ArrowDown');
  await expect(services.locator('.hp-mega-panel a').first()).toBeFocused();
  await page.keyboard.press('Escape');await expect(services.locator('details')).not.toHaveAttribute('open','');
  const card=page.locator('#services article').first();await card.scrollIntoViewIfNeeded();await page.mouse.move(1,100);await page.waitForTimeout(600);
  const height=(await card.boundingBox())!.height;
  await card.hover();await expect(card.locator('.hp-service-word').first()).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, -7)');
  await expect(card.locator('.hp-service-link')).toHaveCSS('opacity','1');expect((await card.boundingBox())!.height).toBeCloseTo(height,1);
  await page.mouse.move(1,100);await expect(card.locator('.hp-service-word').first()).toHaveCSS('transform','none');
  await card.locator('a').focus();await expect(card.locator('.hp-service-link')).toHaveCSS('opacity','1');
  await page.locator('#about').scrollIntoViewIfNeeded();
  const about=await page.locator('.hp-about-media').boundingBox();expect(about!.width/about!.height).toBeGreaterThan(1.45);
  const summaries=page.locator('.hp-accordions summary');await summaries.nth(1).click();await expect(page.locator('.hp-accordions details[open]')).toHaveCount(1);
  await page.locator('.hp-experience').scrollIntoViewIfNeeded();await expect(page.locator('.hp-experience-panel')).toHaveCSS('border-top-width','0px');
  await page.locator('#service-flow').scrollIntoViewIfNeeded();await expect(page.locator('.hp-flow')).toHaveClass(/is-enhanced/);
  const flow=page.locator('.hp-flow');const origin=await flow.evaluate(e=>e.getBoundingClientRect().top+scrollY);
  await page.evaluate(y=>scrollTo({top:y+180,behavior:'instant'}),origin);await page.waitForTimeout(500);
  const pinned=await page.locator('.hp-flow-media').boundingBox();expect(pinned!.height).toBeGreaterThan(750);
  await page.evaluate(y=>scrollTo({top:y+400,behavior:'instant'}),origin);await page.waitForTimeout(600);
  expect((await page.locator('.hp-flow-media').boundingBox())!.y).toBeCloseTo(pinned!.y,0);
  await page.locator('.hp-flow-panel').nth(1).scrollIntoViewIfNeeded();await page.waitForTimeout(550);await expect(page.locator('.hp-flow-panel').nth(1)).toHaveClass(/is-active/);
  await expect(page.locator('.hp-flow-action').first()).toBeAttached();
  const projects=page.locator('.hp-carousel--project');await projects.scrollIntoViewIfNeeded();
  await page.getByRole('button',{name:'Next Project previews slide',exact:true}).click();await expect(projects).toHaveClass(/is-expanded/);await page.waitForTimeout(850);
  await page.getByRole('button',{name:'Previous Project previews slide',exact:true}).click();await expect(projects).not.toHaveClass(/is-expanded/);await page.waitForTimeout(850);
  const controls=await projects.locator('.hp-carousel-buttons').boundingBox();const media=await projects.locator('.hp-carousel-image').first().boundingBox();expect(controls!.y+controls!.height).toBeLessThanOrEqual(media!.y+media!.height+1);
  await page.getByRole('button',{name:'Branding',exact:true}).click();await expect(projects.locator('.hp-carousel-slide')).toHaveCount(1);await page.getByRole('button',{name:'All',exact:true}).click();
  const industries=page.locator('.hp-carousel--industry');await industries.scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Pause Industries autoplay'}).click();
  const count=industries.locator('.hp-carousel-count>span').first();await expect(count).toHaveText('01');
  await page.getByRole('button',{name:'Previous Industries slide',exact:true}).click();await expect(count).toHaveText('08');await page.waitForTimeout(800);
  await page.getByRole('button',{name:'Next Industries slide',exact:true}).click();await expect(count).toHaveText('01');await page.waitForTimeout(800);
  await industries.locator('.hp-carousel-viewport').focus();await page.keyboard.press('ArrowLeft');await expect(count).toHaveText('08');await page.keyboard.press('ArrowRight');await expect(count).toHaveText('01');
  await page.locator('#contact').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  await expect(page.getByRole('button',{name:/pause words|resume words/i})).toHaveCount(0);
  expect(await (await page.request.get('/api/public-page')).json()).toEqual(published);
  await reveal(page);await page.screenshot({path:evidence+'/homepage-1440.png',fullPage:true});
  expect(errors).toEqual([]);const video=page.video();await context.close();await video?.saveAs(evidence+'/desktop.webm');
});
test('final mobile interactions and responsive evidence',async({browser,baseURL})=>{
  test.setTimeout(120000);
  const context=await browser.newContext({baseURL,viewport:{width:390,height:844},hasTouch:true,isMobile:true,recordVideo:{dir:evidence+'/raw',size:{width:390,height:844}}});
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/');
  await page.getByRole('button',{name:/^Menu/}).click();const drawer=page.getByRole('dialog',{name:'CODEYEA navigation'});await expect(drawer).toBeVisible();
  await drawer.locator('summary').first().click();await expect(drawer.getByRole('link',{name:'Web & App Development',exact:true})).toBeVisible();await page.waitForTimeout(600);
  await page.keyboard.press('Escape');await expect(drawer).not.toBeVisible();
  await page.locator('#services').scrollIntoViewIfNeeded();await expect(page.locator('#services .hp-service-link').first()).toHaveCSS('opacity','1');await page.waitForTimeout(650);
  await page.locator('#hosting').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Annually',exact:true}).click();await expect(page.locator('.hp-mobile-price').first()).toContainText('$135');await page.getByRole('button',{name:'Monthly',exact:true}).click();
  await page.locator('#work').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Next Project previews slide',exact:true}).click();await expect(page.locator('.hp-carousel--project')).toHaveClass(/is-expanded/);
  await expect.poll(()=>page.locator('.hp-project-intro-shell').evaluate(e=>e.getBoundingClientRect().height)).toBeLessThan(2);
  await page.getByRole('button',{name:'Previous Project previews slide',exact:true}).click();await expect(page.locator('.hp-carousel--project')).not.toHaveClass(/is-expanded/);
  await page.locator('#industries').scrollIntoViewIfNeeded();await page.getByRole('button',{name:'Pause Industries autoplay'}).click();await page.getByRole('button',{name:'Previous Industries slide',exact:true}).click();await expect(page.locator('.hp-carousel--industry .hp-carousel-count>span').first()).toHaveText('08');await page.waitForTimeout(700);
  const cdp=await context.newCDPSession(page);const view=page.locator('.hp-carousel--industry .hp-carousel-viewport');await view.scrollIntoViewIfNeeded();const box=(await view.boundingBox())!;const y=Math.max(150,Math.min(550,box.y+180));
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:320,y}]});for(let i=1;i<=12;i++){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:320-i*20,y}]});await page.waitForTimeout(20);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await expect(page.locator('.hp-carousel--industry .hp-carousel-count>span').first()).toHaveText('01');
  await page.locator('#contact').scrollIntoViewIfNeeded();await page.waitForTimeout(700);
  await reveal(page);await page.screenshot({path:evidence+'/homepage-390.png',fullPage:true});
  for(const [width,height] of [[1440,960],[1280,900],[1024,900],[768,1024],[390,844],[375,844],[320,844],[812,375]]) {
    await page.setViewportSize({width,height});await page.waitForTimeout(180);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBeTruthy();
    if(width<1200) {expect(await page.locator('#services').evaluate(e=>getComputedStyle(e).gridTemplateColumns.split(' ').length)).toBe(2);await expect(page.locator('.hp-flow')).not.toHaveClass(/is-enhanced/);}
    if(width===768) {await reveal(page);await page.screenshot({path:evidence+'/homepage-768.png',fullPage:true});}
  }
  expect(errors).toEqual([]);const video=page.video();await context.close();await video?.saveAs(evidence+'/mobile.webm');
});
