/** Values extracted from the approved Industries draft 5 entrance. */
export const editorialEntrance = {distance:35,duration:1.8,delay:.18,stagger:.18,ease:'power4.out'} as const;
export const imageMotion = {travel:120,scale:1.075,duration:1.5,ease:'cubic-bezier(.19,1,.22,1)'} as const;
export const motionQueries = {reduced:'(prefers-reduced-motion: reduce)',image:'(min-width:1024px) and (min-height:700px) and (hover:hover) and (pointer:fine)'} as const;
export const scrollImageOffset=(top:number,height:number,viewport:number,travel=120)=>travel-2*travel*Math.max(0,Math.min(1,(viewport-top)/(viewport+height)));
