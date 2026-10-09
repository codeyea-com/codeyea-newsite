import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';
import {randomUUID,randomBytes} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {db} from '../src/server/db';
import {Prisma} from '../src/generated/prisma/client';

const id='seo-editor-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
test('SEO editor saves draft metadata and previews it without changing published content',async({page})=>{
 const original=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 await db.user.create({data:{id,name:'SEO editor',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}});
 try{
  await page.goto('/login');await page.getByLabel('Email address').fill(email);await page.getByLabel('Password',{exact:true}).fill(password);await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await page.goto('/admin/editor?page=homepage');
  await page.getByRole('button',{name:'SEO',exact:true}).click();
  await page.getByLabel('SEO title').fill('Worldwide web design services | CODEYEA');
  await page.getByLabel('Meta description').fill('Web design, SEO and digital services for businesses worldwide.');
  await page.getByLabel('Focus phrase').fill('web design services');
  await page.getByLabel('Canonical path').fill('/');
  await page.getByLabel('Social title').fill('A better digital foundation');
  await expect(page.getByText('Google result preview',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Save SEO draft'}).click();
  await expect(page.getByRole('status').filter({hasText:'Draft saved'})).toBeVisible();
  const updated=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
  expect((updated.draftSnapshot as {homepage:{seo:{title:string;focusPhrase:string}}}).homepage.seo).toMatchObject({title:'Worldwide web design services | CODEYEA',focusPhrase:'web design services'});
  expect(updated.publishedSnapshot).toEqual(original.publishedSnapshot);
 }finally{
  await db.page.update({where:{id:'homepage'},data:{draftSnapshot:original.draftSnapshot as Prisma.InputJsonValue,version:original.version,updatedAt:original.updatedAt,updatedBy:original.updatedBy}});
  await db.pageRevision.deleteMany({where:{pageId:'homepage',actorId:id}});
  await db.auditLog.deleteMany({where:{entityId:'homepage',actorId:id}});
  await db.user.deleteMany({where:{id}});
  await db.$disconnect();
 }
});
