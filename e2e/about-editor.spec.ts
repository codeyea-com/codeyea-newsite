import {assertTestEnvironment} from '../scripts/test-environment';
assertTestEnvironment();
import {test,expect} from '@playwright/test';
import {randomUUID,randomBytes} from 'node:crypto';
import {hashPassword} from 'better-auth/crypto';
import {db} from '../src/server/db';

const id='about-editor-'+randomUUID(),email=id+'@example.test',password=randomBytes(24).toString('base64url');
let home:Awaited<ReturnType<typeof db.page.findUniqueOrThrow>>;
let ownsFixture=false;

test.beforeAll(async()=>{
 expect(await db.page.findUnique({where:{id:'about'}}),'Editor test requires an unused isolated About fixture').toBeNull();
 home=await db.page.findUniqueOrThrow({where:{id:'homepage'}});
 await db.user.create({data:{id,name:'Isolated About editor',email,emailVerified:true,roles:{create:{roleId:'administrator'}},accounts:{create:{id:randomUUID(),providerId:'credential',accountId:id,password:await hashPassword(password)}}}});
 ownsFixture=true;
});
test.afterAll(async()=>{
 if(ownsFixture){
  try{expect(await db.page.findUniqueOrThrow({where:{id:'homepage'}})).toEqual(home);}
  finally{await db.auditLog.deleteMany({where:{actorId:id}});await db.page.deleteMany({where:{id:'about'}});await db.user.deleteMany({where:{id}});}
 }
 await db.$disconnect();
});

test('About editor initializes, saves media and copy, previews, and restores privately',async({page,request})=>{
 test.setTimeout(120000);
 await page.goto('/login');
 await page.getByLabel('Email address').fill(email);
 await page.getByLabel('Password',{exact:true}).fill(password);
 await page.getByRole('button',{name:'Sign in',exact:true}).click();
 await expect(page.getByRole('navigation',{name:'Homepage sections'})).toBeVisible();
 await page.getByLabel('Page',{exact:true}).selectOption('about');
 await expect(page.getByRole('heading',{name:'Start an About draft'})).toBeVisible();
 await page.getByRole('button',{name:'Initialize About draft',exact:true}).click();
 const sections=page.getByRole('navigation',{name:'About sections'});
 await expect(sections).toBeVisible();
 await expect(page.getByText('CODEYEA brand text is locked.',{exact:true})).toBeVisible();
 await expect(page.getByLabel('Supporting copy',{exact:true})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Add item',exact:true})).toHaveCount(0);
 await sections.getByRole('button',{name:/Who we are/}).click();
 await page.getByLabel('Heading',{exact:true}).fill('Private editor heading one');
 await page.getByLabel('Positioning statement',{exact:true}).fill('Private positioning from the About editor.');
 await page.getByLabel('Device visibility',{exact:true}).selectOption('desktop');
 await expect(page.getByText('A device-only choice hides this section on every other device size. Disabled sections stay hidden everywhere.',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Choose image',exact:true}).click();
 const library=page.getByRole('dialog',{name:'Media library'});
 await library.getByRole('button',{name:'about.webp',exact:true}).click();
 await expect(library).toHaveCount(0);
 await page.getByLabel('Image alt text',{exact:true}).fill('CODEYEA collaborative work space');
 await page.getByLabel('Decorative image',{exact:true}).uncheck();
 for(const [label,value] of [[/Desktop horizontal focal point:/,35],[/Tablet horizontal focal point:/,45],[/Mobile horizontal focal point:/,65]] as const){
  const slider=page.getByLabel(label);await slider.focus();await page.keyboard.press('Home');
  for(let step=0;step<value;step++)await page.keyboard.press('ArrowRight');
 }
 await expect(page.getByRole('button',{name:'Preview',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Draft saved with unpublished changes.'})).toBeVisible();
 const first=(await(await page.request.get('/api/cms?pageId=about')).json()).page;
 const who=first.about.sections.find((s:{type:string})=>s.type==='who');
 expect(who).toMatchObject({heading:'Private editor heading one',positioning:'Private positioning from the About editor.',visibility:'desktop',media:{mediaId:'about',alt:'CODEYEA collaborative work space',decorative:false,focalX:35,tabletFocalX:45,mobileFocalX:65}});
 await page.getByRole('button',{name:'Preview',exact:true}).click();
 const preview=page.frameLocator('iframe[title="Complete private About preview"]');
 await expect(preview.getByRole('heading',{name:'Private editor heading one',exact:true})).toBeVisible();
 await expect(preview.getByText('Private positioning from the About editor.',{exact:true})).toBeVisible();
 await expect(preview.getByAltText('CODEYEA collaborative work space',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Mobile',exact:true}).click();
 await expect(preview.getByRole('heading',{name:'Private editor heading one',exact:true})).toBeHidden();
 await page.getByRole('button',{name:'Close preview',exact:true}).click();
 await page.getByLabel('Heading',{exact:true}).fill('Private editor heading two');
 await page.getByRole('button',{name:'Save draft',exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:'Draft saved with unpublished changes.'})).toBeVisible();
 const second=(await(await page.request.get('/api/cms?pageId=about')).json()).page;
 expect(second.version).toBeGreaterThan(first.version);
 await page.getByRole('button',{name:'Revisions',exact:true}).click();
 await page.getByRole('button',{name:`Preview version ${first.version}`,exact:true}).click();
 const comparison=page.getByRole('table');
 await expect(comparison.getByRole('cell',{name:'Private editor heading two',exact:true})).toBeVisible();
 await expect(comparison.getByRole('cell',{name:'Private editor heading one',exact:true})).toBeVisible();
 await page.getByRole('button',{name:`Restore revision ${first.version}`,exact:true}).click();
 await expect(page.getByRole('status').filter({hasText:`Revision ${first.version} restored as a new draft.`})).toBeVisible();
 const restored=(await(await page.request.get('/api/cms?pageId=about')).json()).page;
 expect(restored.version).toBe(second.version+1);
 expect(restored.about.sections.find((s:{type:string})=>s.type==='who').heading).toBe('Private editor heading one');
 expect(restored.publishedSnapshot).toBeNull();expect(restored.publishedAt).toBeNull();
 expect((await request.get('/about/')).status()).toBe(404);
 await page.getByRole('button',{name:'Content',exact:true}).click();
 await page.getByRole('button',{name:'Preview',exact:true}).click();
 await expect(page.frameLocator('iframe[title="Complete private About preview"]').getByRole('heading',{name:'Private editor heading one',exact:true})).toBeVisible();
 expect((await db.page.findUniqueOrThrow({where:{id:'about'}})).status).toBe('DRAFT');
});
