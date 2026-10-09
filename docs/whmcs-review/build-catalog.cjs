const fs=require('node:fs'),path=require('node:path');
const base=path.resolve(__dirname,'..');
const files=['hosting-visual-review/website-hosting-interactive.html','hosting-visual-review/wordpress-hosting-interactive.html','hosting-visual-review/cloud-hosting-interactive.html','email-hosting-review/email-hosting-interactive.html'];
const catalog=files.map(file=>{const html=fs.readFileSync(path.join(base,file),'utf8');const match=html.match(/"slider":(\{[^]*?\}),"/);if(!match)throw Error('Missing plan data '+file);const data=JSON.parse(match[1]);return {id:path.basename(file).replace('-interactive.html',''),title:data.title,discount:data.annualDiscount||0,plans:data.names.map((name,i)=>({name,price:data.prices[i],features:data.rows.map(row=>[row[0],row[i+1]])}))}});
fs.writeFileSync(path.join(__dirname,'catalog.js'),'window.CODEYEA_CATALOG = '+JSON.stringify(catalog,null,2)+';\n');
const fonts=path.join(__dirname,'assets');fs.mkdirSync(fonts,{recursive:true});
for(const weight of [300,400,500,600,700])fs.copyFileSync(path.join(base,'../node_modules/@fontsource/josefin-sans/files',`josefin-sans-latin-${weight}-normal.woff2`),path.join(fonts,`josefin-${weight}.woff2`));
for(const tone of ['dark','light'])fs.copyFileSync(path.join(base,'../public/brand',`logo-${tone}.png`),path.join(fonts,`logo-${tone}.png`));
console.log(catalog.map(c=>`${c.title}: ${c.plans.map(p=>p.name).join(', ')}`).join('\n'));
