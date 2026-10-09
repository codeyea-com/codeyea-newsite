import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';
for(const width of [1440,390]) test('five area refinement recording '+width,async({browser})=>{
 test.setTimeout(90000);
 const context=await browser.newContext({viewport:{width,height:900},isMobile:width===390,hasTouch:width===390,recordVideo:{dir:'docs/recordings/raw',size:{width,height:900}},baseURL:process.env.BETTER_AUTH_URL});
 const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');await page.waitForTimeout(650);
 if(width>1000){const menu=page.getByLabel('Open Services menu');await menu.hover();await expect(page.locator('.hp-dropdown').first()).toBeVisible();await page.waitForTimeout(650);await menu.press('Escape');}
 else{await page.locator('.hp-mobile-trigger').click();await page.waitForTimeout(650);await page.locator('.hp-mobile-panel').press('Escape');}
 async function travel(id:string){await page.locator(id).scrollIntoViewIfNeeded();await page.waitForTimeout(700);}
 await travel('#services');const service=page.locator('#services article').first();const learn=service.locator('.hp-service-link');
 if(width>1000){await page.mouse.move(0,0);await expect(learn).toHaveCSS('opacity','0');await service.hover();await expect(learn).toHaveCSS('opacity','1');await page.waitForTimeout(650);await page.mouse.move(0,0);await expect(learn).toHaveCSS('opacity','0');await learn.focus();await expect(learn).toHaveCSS('opacity','1');}
 else await expect(learn).toHaveCSS('opacity','1');
 await travel('#hosting');await page.getByRole('button',{name:'Annually',exact:true}).click();await page.waitForTimeout(700);await page.getByRole('button',{name:'Monthly',exact:true}).click();await page.waitForTimeout(500);
 await page.locator('#hosting').screenshot({path:'docs/screenshots/five-area-hosting-'+width+'.png'});
 await travel('#work');const projects=page.locator('.hp-carousel--project');await expect(projects).not.toHaveClass(/is-expanded/);
 await page.getByRole('button',{name:'Next Project previews slide',exact:true}).click();await expect(projects).toHaveClass(/is-expanded/);await page.waitForTimeout(850);
 await page.getByRole('button',{name:'Previous Project previews slide',exact:true}).click();await expect(projects).not.toHaveClass(/is-expanded/);await page.waitForTimeout(850);
 const viewport=projects.locator('.hp-carousel-viewport');await viewport.focus();await viewport.press('ArrowRight');await expect(projects).toHaveClass(/is-expanded/);await page.waitForTimeout(650);await viewport.press('ArrowLeft');await expect(projects).not.toHaveClass(/is-expanded/);
 await page.getByRole('button',{name:'Branding',exact:true}).click();await page.waitForTimeout(450);await page.getByRole('button',{name:'All',exact:true}).click();
 await expect(projects.locator('.hp-carousel-buttons button').first()).toHaveCSS('border-radius','0px');
 await travel('#industries');const industries=page.locator('.hp-carousel--industry');await page.getByRole('button',{name:'Pause Industries autoplay',exact:true}).click();
 if(width>1000){await industries.locator('.hp-carousel-card').first().hover();await page.waitForTimeout(750);}
 else await expect(industries.locator('.hp-media-cursor')).toHaveCSS('display','none');
 await page.getByRole('button',{name:'Next Industries slide',exact:true}).click();await page.waitForTimeout(850);await industries.locator('.hp-carousel-viewport').press('ArrowRight');await page.waitForTimeout(650);
 await page.emulateMedia({reducedMotion:'reduce'});await travel('#work');await page.getByRole('button',{name:'Next Project previews slide',exact:true}).click();await page.waitForTimeout(450);await expect(projects.locator('.hp-media-cursor')).toHaveCSS('display','none');
 expect(errors).toEqual([]);const video=page.video();await context.close();await video?.saveAs('docs/recordings/homepage-five-area-'+width+'.webm');
});

