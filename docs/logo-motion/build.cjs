const fs=require('node:fs');
const path=require('node:path');
// The supplied artwork is reused without changing its colours or gradients.
const source=path.resolve(__dirname,'../../../service/Screenshot 2026-09-27 132433.png');
const png=fs.readFileSync(source);
if(png.readUInt32BE(16)!==610||png.readUInt32BE(20)!==449)throw Error('Reference dimensions changed; review triangle mapping.');
const shapes=[
 '146,27 257,27 201.5,123.2',
 '146,27 90.2,123.2 201.5,123.2',
 '90.2,123.2 201.5,123.2 145.8,219.5',
 '90.2,123.2 34.5,219.5 145.8,219.5',
 '34.5,219.5 145.8,219.5 90.2,315.5',
 '145.8,219.5 90.2,315.5 201.5,315.5',
 '90.2,315.5 201.5,315.5 145.8,411.5',
 '201.5,315.5 145.8,411.5 257.3,411.5',
 '257.3,27 368.7,27 313,123.2',
 '368.7,27 313,123.2 424.4,123.2',
 '480.1,27 424.4,123.2 535.8,123.2',
 '480.1,27 591.5,27 535.8,123.2',
 '424.4,123.2 535.8,123.2 480.1,219.5',
 '424.4,123.2 368.7,219.5 480.1,219.5',
 '313,315.5 257.3,411.5 368.7,411.5',
 '313,315.5 424.4,315.5 368.7,411.5',
];
const order=[8,1,12,5,15,3,10,7,0,14,4,11,6,13,2,9];
const moves=[[-44,-55],[-75,-28],[-54,4],[-85,12],[-60,48],[-25,65],[-45,75],[0,65],[14,-68],[45,-35],[64,-60],[86,-44],[70,12],[42,40],[18,72],[62,54]];
const defs=shapes.map((points,i)=>`<clipPath id="clip-${i}"><polygon points="${points}"/></clipPath><g id="piece-${i}" clip-path="url(#clip-${i})"><use href="#art"/></g>`).join('');
const pieces=shapes.map((_,i)=>{
 const delay=(order[i]*.045).toFixed(3),[x,y]=moves[i];
 return `<g class="triangle" opacity="0" transform="translate(${x} ${y})"><use href="#piece-${i}"/>
 <animate attributeName="opacity" begin="${delay}s" dur="3.5s" values="0;.84;.16;.92;.26;.9;1;1" keyTimes="0;.09;.19;.30;.41;.55;.86;1" fill="freeze"/>
 <animateTransform attributeName="transform" type="translate" begin="${delay}s" dur="3.5s" values="${x} ${y};${x} ${y};0 0;0 0" keyTimes="0;.48;.93;1" calcMode="spline" keySplines="0 0 1 1;.2 .75 .2 1;0 0 1 1" fill="freeze"/>
 </g>`;
}).join('');
const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-65 -65 760 580" role="img" aria-labelledby="title desc"><title id="title">CODEYEA — triangles assembling</title><desc id="desc">Sixteen coloured triangles flicker softly in a scattered arrangement, then assemble into the original CODEYEA icon and hold.</desc><style>.still{display:none}@media(prefers-reduced-motion:reduce){.motion{display:none}.still{display:inline}}</style><defs><image id="art" width="610" height="449" href="data:image/png;base64,${png.toString('base64')}"/>${defs}</defs><g class="motion">${pieces}</g><g class="still">${shapes.map((_,i)=>`<use href="#piece-${i}"/>`).join('')}</g></svg>`;
fs.writeFileSync(path.join(__dirname,'codeyea-animated.svg'),svg);
console.log('Created animated SVG: 16 original-art triangles, 4.175 seconds, transparent canvas, one play then hold.');
