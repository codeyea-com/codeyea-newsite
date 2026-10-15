import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
const original='C:/Users/grdez/.codex/generated_images/01a12351-1c7e-7bf1-9ece-2faeb47b9aac/exec-9002e43d-f913-459d-81c2-0710795f5d25.png';
const archive='C:/Users/grdez/Documents/codex-projects/codeyea/Generated images/Small Business/cover-candle-workshop-v3';
await fs.mkdir(archive,{recursive:true});
await fs.copyFile(original,path.join(archive,'original.png'));
const dest='public/site/generated/general/industries';
await fs.mkdir(dest,{recursive:true});
for(const [size,width] of [['desktop',1448],['tablet',1000],['mobile',760]]){
 await sharp(original).resize({width,withoutEnlargement:true}).webp({quality:88}).toFile(`${dest}/industry-small-business-v3-${size}.webp`);
}
const registry='src/content/generated-general-artwork.json';
const data=JSON.parse(await fs.readFile(registry,'utf8'));
const art=data['industries/industry-small-business'];
for(const [key,size] of [['src','desktop'],['tabletSrc','tablet'],['mobileSrc','mobile']])art[key]=`/site/generated/general/industries/industry-small-business-v3-${size}.webp`;
art.alt={en:'Small-business owner pouring scented candles in her workshop',ar:'صاحبة مشروع صغير تصنع شموعاً معطّرة داخل ورشتها'};
await fs.writeFile(registry,JSON.stringify(data,null,2)+'\n');
await fs.writeFile(path.join(archive,'manifest.json'),JSON.stringify({tool:'built-in image_gen',reference:'https://www.candlescience.com/how-to-make-large-batches-of-candles/',frame:{desktop:[750,674],tablet:[894,671],mobile:[416,312]},concept:'Female artisan making scented candles in a small workshop. Natural white daylight, close meaningful action, face, hands and jars within centered crops. No devices, panels, text, logos or embedded margins.',output:art},null,2));
console.log('Archived original and integrated three responsive candle-workshop cover sizes.');
