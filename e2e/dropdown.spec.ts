import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';

test.use({viewport:{width:1440,height:1000}});

test('desktop dropdown supports label hover, gap crossing and dismissal',async({page})=>{
 await page.goto('/');
 const item=page.locator('.hp-desktop-nav .hp-nav-item').filter({has:page.locator('details')}).first();
 const label=item.locator(':scope > a');
 const details=item.locator('details');
 const summary=item.locator('summary');
 const panel=item.locator('.hp-dropdown');
 await label.hover();
 await expect(details).toHaveAttribute('open','');
 await expect(summary).toHaveAttribute('aria-expanded','true');
 const a=(await item.boundingBox())!;
 const b=(await panel.boundingBox())!;
 await page.mouse.move(a.x+a.width/2,a.y+a.height+10);
 await page.waitForTimeout(250);
 await expect(details).toHaveAttribute('open','');
 await page.mouse.move(b.x+b.width/2,b.y+20,{steps:8});
 await expect(panel.locator('a').first()).toBeVisible();
 await panel.locator('a').first().hover();await panel.locator('a').nth(1).hover();await expect(details).toHaveAttribute('open','');
 await page.mouse.move(1400,800);
 await expect(details).not.toHaveAttribute('open','');
 await label.hover();
 await page.locator('.hp-logo').click();
 await expect(summary).toHaveAttribute('aria-expanded','false');
});

test('desktop dropdown retains keyboard focus and native summary activation',async({page})=>{
 await page.goto('/');
 const item=page.locator('.hp-desktop-nav .hp-nav-item').filter({has:page.locator('details')}).first();
 const summary=item.locator('summary');
 const details=item.locator('details');
 // Establish keyboard modality before focusing the parent link.
 await page.keyboard.press('Tab');
 await item.locator(':scope > a').focus();
 await expect(details).toHaveAttribute('open','');
 await page.keyboard.press('Tab');
 await expect(summary).toBeFocused();
 await page.keyboard.press('Tab');
 await expect(item.locator('.hp-dropdown a').first()).toBeFocused();
 await expect(details).toHaveAttribute('open','');
 await page.keyboard.press('Escape');
 await expect(summary).toBeFocused();
 await expect(summary).toHaveAttribute('aria-expanded','false');
 await page.keyboard.press('Enter');
 await expect(summary).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Space');
 await expect(summary).toHaveAttribute('aria-expanded','false');
 await page.keyboard.press('Enter');
 await page.locator('.hp-header-quote').focus();
 await expect(details).not.toHaveAttribute('open','');
});

test('touch click toggles desktop summary and mobile drawer remains usable',async({browser,baseURL})=>{
 const context=await browser.newContext({baseURL,viewport:{width:1440,height:1000},hasTouch:true});
 const page=await context.newPage();
 await page.goto('/');
 const summary=page.locator('.hp-desktop-nav summary').first();
 await summary.tap();
 await expect(summary).toHaveAttribute('aria-expanded','true');
 await summary.tap();
 await expect(summary).toHaveAttribute('aria-expanded','false');
 await page.setViewportSize({width:390,height:844});
 await page.locator('.hp-mobile-trigger').tap();
 const dialog=page.getByRole('dialog',{name:'CODEYEA navigation'});
 await expect(dialog).toBeVisible();
 await dialog.locator('summary').first().tap();
 await expect(dialog.locator('.hp-mobile-submenu').first()).toBeVisible();
 await dialog.getByRole('button',{name:'Close navigation'}).tap();
 await expect(dialog).not.toBeVisible();
 await context.close();
});
