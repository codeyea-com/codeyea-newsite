import type { AboutContent, AboutSection, AboutMedia } from "../schemas/about";
import { homepageAssets } from "./homepage-assets";

export const aboutMetadata = {
  title: "About CODEYEA | Digital Innovation Agency",
  description: "Learn how CODEYEA connects strategy, design, development and ongoing support to help businesses build useful digital experiences.",
};
const local = new Set(homepageAssets.map((asset) => asset.id));
function media(id: string, alt: string, width=1200, height=800): AboutMedia {
  return {mediaId:local.has(id)?id:"about",alt,decorative:false,width,height,focalX:50,focalY:50,tabletFocalX:50,tabletFocalY:50,mobileFocalX:50,mobileFocalY:50};
}
function section(type:AboutSection["type"],position:number,heading:string,body="",extra:Partial<AboutSection>={}):AboutSection {
  return {id:"about-"+type,type,position,enabled:true,visibility:"all",label:"",heading,body,items:[],...extra};
}
function item(id:string,position:number,title:string,body:string,image?:AboutMedia,label?:string,ctaLabel?:string) {
  return {id,position,enabled:true,title,body,...(image?{media:image}:{}),...(label?{label}:{}),...(ctaLabel?{ctaLabel}:{})};
}
export function defaultAbout(localeId="en",marketId="global"):AboutContent {
 return {
  schemaVersion:2,localeId,marketId,sharedSourcePageId:"homepage",seo:{...aboutMetadata},sections:[
   section("hero",0,"About Us","",{media:media("team","A shared CODEYEA workspace",1200,801)}),
    section("who",1,"Digital thinking, made practical.",["CODEYEA brings design, development and digital operations together to help businesses solve real problems. We work across websites, eCommerce, applications, search, automation, hosting and technical support.","We begin with the goals, the people who need the solution and the systems already in place. Then we shape a clear next step around what the business needs."].join("\n\n"),{positioning:"Digital innovation with a practical purpose.",label:"WHO WE ARE",media:media("about","A team planning a digital project",1200,801)}),
   section("experience",2,"Experience focused on useful outcomes.","We bring creative and technical work into the same conversation. That helps keep the plan connected from the first decisions through launch and ongoing improvement.",{label:"HOW WE WORK",media:media("office","A bright collaborative workspace",1200,801),ctaLabel:"Creative and technical work, brought together",items:[item("about-experience-item-1",0,"Understand before recommending","We take time to understand the business, audience, priorities and constraints before recommending a design or technology.",media("team","A team discussing project requirements")),item("about-experience-item-2",1,"Stay involved after launch","A website or system needs care after release. We can help maintain, refine and extend the work as the business changes.")]}),
   section("projectReference",3,"Clear thinking. Connected work.","",{label:"THE WORK BEHIND THE EXPERIENCE",media:media("project-web","A website design and development project",1975,1067),items:[item("about-reference-category-1",0,"Strategy" ,""),item("about-reference-category-2",1,"Design",""),item("about-reference-category-3",2,"Development",""),item("about-reference-category-4",3,"Growth","",media("project-mobile","A mobile digital experience",1200,800))]}),
   section("principles",4,"Good digital work should make things clearer.","",{label:"OUR APPROACH",items:[item("about-principle-think",0,"Start with the real need","We understand the goal and the people involved before choosing a solution."),item("about-principle-create",1,"Make every part useful","Each design and feature should help someone understand, decide or act."),item("about-principle-build",2,"Keep improving","We build for maintainability and stay ready to refine the experience over time.")]}),
   section("showcase",5,"Connected digital experiences.","",{label:"WHAT WE DO",ctaLabel:"Explore our services",items:[item("about-showcase-social",0,"Websites built around your business","Clear structure, thoughtful design and practical development help visitors understand your offer and take the next step.",media("project-web","A responsive business website"),"WEB DESIGN & DEVELOPMENT","Explore services"),item("about-showcase-mobile",1,"Digital products for customers and teams","Applications and connected platforms can make everyday tasks easier for the people who rely on them.",media("project-mobile","A mobile application experience"),"WEB & MOBILE APPS","Explore services"),item("about-showcase-ecommerce",2,"Online stores made to work smoothly","Bring product discovery, checkout and store operations into a consistent customer experience.",media("commerce","A digital commerce experience"),"E-COMMERCE","Explore services"),item("about-showcase-ai",3,"Automation that supports real workflows","Connect tools and reduce repetitive steps with automation planned around how the business works.",media("support","A digital operations workspace"),"AI & AUTOMATION","Explore services")]}),
   section("awards",6,"A connected team for the whole digital journey.","",{label:"OUR CAPABILITIES",items:[item("about-awards-1",0,"Plan & design","Strategy, content structure, user experience and brand design."),item("about-awards-2",1,"Build & connect","Websites, applications, commerce and practical integrations."),item("about-awards-3",2,"Run & improve","Hosting, technical support, search foundations and ongoing care.")]})
  ]
 };
}
