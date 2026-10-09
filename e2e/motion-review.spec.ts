import {assertTestEnvironment} from "../scripts/test-environment";
assertTestEnvironment();
import {test,expect} from "@playwright/test";
for(const width of [1440,390])test("motion review recording "+width,async({browser})=>{
 test.setTimeout(100000);
 const context=await browser.newContext({viewport:{width,height:900},recordVideo:{dir:"docs/recordings/raw",size:{width,height:900}},baseURL:process.env.BETTER_AUTH_URL});
 const page=await context.newPage();const errors:string[]=[];page.on("pageerror",e=>errors.push(e.message));
 await page.goto("/");await page.waitForTimeout(800);
 const button=page.locator(".hp-hero .hp-button");await button.hover();await page.waitForTimeout(450);await button.screenshot({path:"docs/screenshots/button-hover-after-"+width+".png"});await button.focus();await button.screenshot({path:"docs/screenshots/button-focus-after-"+width+".png"});await page.mouse.move(0,0);
 if(width===1440){const menu=page.getByLabel("Open Services menu");await menu.hover();await expect(page.locator(".hp-dropdown").first()).toBeVisible();await menu.press("Escape");await expect(page.locator(".hp-dropdown").first()).not.toBeVisible();}
 async function travel(id:string,steps=10){const end=await page.locator(id).evaluate(e=>e.getBoundingClientRect().top+scrollY-120);const start=await page.evaluate(()=>scrollY);for(let i=1;i<=steps;i++){await page.evaluate(y=>scrollTo({top:y,behavior:"instant"}),start+(end-start)*i/steps);await page.waitForTimeout(85);}await page.waitForTimeout(350);}
 await travel("#services");await page.locator("#services article").first().hover();await page.waitForTimeout(400);const link=page.locator(".hp-service-link").first();await link.focus();await link.screenshot({path:"docs/screenshots/link-focus-after-"+width+".png"});
 await travel("#about");await page.locator(".hp-accordions summary").nth(1).click();await page.waitForTimeout(450);
 await travel(".hp-experience",16);await page.waitForTimeout(1300);await expect(page.locator("[data-count-to]")).toHaveText("18");
 await travel("#service-flow",16);
 const panels=page.locator(".hp-flow-panel");for(let i=0;i<3;i++){const panelId=await panels.nth(i).getAttribute("id");await travel("#"+panelId,i===1?20:8);if(width===1440){await expect(panels.nth(i)).toHaveClass(/is-active/);}await page.waitForTimeout(600);}
 await travel("#hosting");await page.getByRole("button",{name:"Annually",exact:true}).click();await page.waitForTimeout(500);await page.getByRole("button",{name:"Monthly",exact:true}).click();
 await travel("#work");await page.getByRole("button",{name:"Branding",exact:true}).click();await page.waitForTimeout(500);await page.getByRole("button",{name:"All",exact:true}).click();await page.getByRole("button",{name:"Next Project previews slide",exact:true}).click();await page.waitForTimeout(500);
 await travel("#industries");await page.getByRole("button",{name:"Pause Industries autoplay",exact:true}).click();await page.getByRole("button",{name:"Next Industries slide",exact:true}).click();await page.waitForTimeout(500);
 await travel("#contact",16);await page.waitForTimeout(1000);
 await page.emulateMedia({reducedMotion:"reduce"});await travel("#service-flow",1);await expect(page.locator(".hp-flow")).not.toHaveClass(/is-enhanced/);await expect(page.locator("[data-count-to]")).toHaveText("18");expect(errors).toEqual([]);
 const video=page.video();await context.close();await video?.saveAs("docs/recordings/homepage-motion-"+width+".webm");
});
