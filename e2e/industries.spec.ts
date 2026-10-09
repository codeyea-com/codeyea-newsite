import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';
import {randomUUID,randomBytes} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {db} from '../src/server/db';
const id='industries-ui-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
test.beforeAll(async()=>{expect(await db.page.findUnique({where:{id:'industries'}})).toBeNull();await db.user.create({data:{id,name:'Isolated Industries editor',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}})});
test.afterAll(async()=>{await db.auditLog.deleteMany({where:{actorId:id}});await db.page.deleteMany({where:{id:'industries'}});await db.user.deleteMany({where:{id}});await db.$disconnect()});
test('Industries editor saves ordered enabled content and previews without publication',async({page})=>{
 await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await page.getByLabel('Page',{exact:true}).selectOption('industries');await page.getByRole('button',{name:'Initialize Industries draft',exact:true}).click();
 await page.getByRole('navigation',{name:'Industries sections'}).getByRole('button',{name:'1. Roofing',exact:true}).click();
 await page.getByLabel('body',{exact:true}).fill('Roofing review copy for the isolated preview.');await page.getByLabel('Enabled',{exact:true}).uncheck();
 await page.getByRole('button',{name:'Save draft',exact:true}).click();await expect(page.getByRole('status').filter({hasText:'Draft saved with unpublished changes.'})).toBeVisible();
 await page.goto('/preview/industries');await expect(page.locator('.industry-section')).toHaveCount(10);await expect(page.locator('.industry-section').first()).toHaveAttribute('data-layout','1');await expect(page.locator('.industry-section .industry-name').first()).toHaveText('Healthcare');
 await page.locator('.industry-highlights summary').first().focus();await page.keyboard.press('Enter');await expect(page.locator('.industry-highlights details').first()).toHaveAttribute('open','');
 for(const width of [1440,768,390,320]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width)}
 const saved=await db.page.findUniqueOrThrow({where:{id:'industries'}});expect(saved.publishedSnapshot).toBeNull();expect(saved.version).toBe(2);
 await page.goto('/admin');await page.getByLabel('Page',{exact:true}).selectOption('industries');await page.getByRole('button',{name:'Revisions',exact:true}).click();await page.getByRole('button',{name:'Preview version 1'}).click();await expect(page.getByRole('table')).toContainText('Roofing review copy');
});
