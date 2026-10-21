import fs from 'node:fs';
const html=fs.readFileSync('public/hosting-plans-preview.html','utf8');
const existingStyle=fs.readFileSync('public/site/hosting-plan-cards.css','utf8');
const responsiveStyle=existingStyle.includes('/* Fit complete cards')?'\n'+existingStyle.slice(existingStyle.indexOf('/* Fit complete cards')):'';
const source=html.match(/<style>([\s\S]*?)<\/style>/)[1];
function scope(css){let result='',pos=0;while(pos<css.length){const open=css.indexOf('{',pos);if(open<0){result+=css.slice(pos);break}let depth=1,end=open+1;while(depth&&end<css.length){if(css[end]==='{')depth++;if(css[end]==='}')depth--;end++}const head=css.slice(pos,open).trim(),body=css.slice(open+1,end-1);if(head.startsWith('@media'))result+=head+'{'+scope(body)+'}';else if(head.startsWith('@keyframes'))result+=head+'{'+body+'}';else{const clean=head.replace(/\/\*[\s\S]*?\*\//g,'').trim();result+=clean.split(',').map(s=>{s=s.trim();if(s===':root'||s==='body'||s==='main')return '.hp .cy-host-plans';return '.hp .cy-host-plans '+s.replace(/^h1\b/,'h2')}).join(',')+'{'+body+'}'}pos=end}return result}
fs.writeFileSync('public/site/hosting-plan-cards.css',scope(source)+`
.hp .cy-host-plans{width:calc(100% - 48px);max-width:1380px;padding:64px 24px;margin:0 auto;background:#f4f7f9;color:var(--ink)}
.hp .cy-host-plans .plans{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scroll-padding-inline:4px;padding:32px 4px 24px;scrollbar-width:thin;gap:22px}
.hp .cy-host-plans .card{flex:0 0 calc((100% - 44px)/3);scroll-snap-align:start}
.hp .cy-host-plans .slider-controls{display:flex}
.hp .cy-host-plans .intro>h2{font-size:clamp(30px,3.2vw,46px);line-height:1.5;margin:0 0 14px}
.hp .cy-host-plans .choose{font-size:14px}
.hp .cy-host-plans .features li{font-size:13px}
.hp .cy-host-plans [hidden]{display:none!important}
html:not([dir=rtl]) .cy-host-plans .billing:before{left:5px;right:auto}
html:not([dir=rtl]) .cy-host-plans .billing.annual:before{transform:translateX(100%)}
html:not([dir=rtl]) .cy-host-plans .plan-mark h2{text-align:left}
@media(max-width:1000px){.hp .cy-host-plans .card{flex-basis:calc((100% - 22px)/2)}}
@media(max-width:760px){.hp .cy-host-plans{width:100%;padding:42px 20px}.hp .cy-host-plans .card{flex-basis:min(86vw,390px)}.hp .cy-host-plans .plans{padding-inline:20px;gap:16px}}
`+responsiveStyle);
console.log('Approved prototype CSS scoped to integrated hosting plans.');
