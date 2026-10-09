import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';
import {randomUUID,randomBytes} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {db} from '../src/server/db';

const id='catalog-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
test('CMS page catalog is searchable and opens the existing page editor',async({page,request})=>{
 await db.user.create({data:{id,name:'Catalog reviewer',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}});
 try{
  expect((await request.get('/api/site-routes')).status()).toBe(401);
  await page.goto('/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password',{exact:true}).fill(password);
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Shape your homepage.'})).toBeVisible();
  const catalog=page.getByText('Pages, routes & publication status',{exact:true});
  await catalog.click();
  const table=page.getByRole('table');
  await expect(table).toContainText('Homepage');
  await expect(table).toContainText('/');
  await expect(table).toContainText('Published');
  const search=page.getByRole('textbox',{name:'Search page catalog'});
  await search.fill('healthcare');
  await expect(table).toContainText('/industries/healthcare/');
  await expect(table).not.toContainText('Homepage');
  await search.fill('homepage');
  await page.getByRole('link',{name:'Edit ↗'}).click();
  await expect(page).toHaveURL(/\/admin\/editor\?page=homepage/);
  await expect(page.getByLabel('Page',{exact:true})).toHaveValue('homepage');
 }finally{
  await db.auditLog.deleteMany({where:{actorId:id}});
  await db.user.deleteMany({where:{id}});
  await db.$disconnect();
 }
});
