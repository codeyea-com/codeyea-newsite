import sharp from "sharp";
import { AppError } from "./errors";

const MAX_BYTES = 8 * 1024 * 1024;
const MAX_PIXELS = 24_000_000;
function invalid(): never { throw new AppError(415, "Upload a valid, non-animated JPEG, PNG, or WebP image"); }
function inspectMetadata(bytes: Buffer) {
  const text = bytes.toString("latin1");
  if (/<\s*(?:script|svg|html|iframe|!doctype)|<\?php|javascript\s*:|#!|powershell|cmd\.exe/i.test(text)
    || bytes.includes(Buffer.from([0x4d, 0x5a, 0x90, 0])) || bytes.includes(Buffer.from([0x7f, 0x45, 0x4c, 0x46]))
    || bytes.includes(Buffer.from("PK\x03\x04", "latin1"))) invalid();
}
function validateContainer(bytes: Buffer, stockMetadata=false): "jpeg" | "png" | "webp" {
  if (bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]))) {
    let position = 8, sawHeader = false, sawData = false;
    while (position + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(position);
      const end = position + 12 + length;
      if (end > bytes.length) invalid();
      const type = bytes.toString("ascii", position + 4, position + 8);
      if (!sawHeader && type !== "IHDR") invalid();
      if (type === "IHDR") { if (sawHeader || length !== 13) invalid(); sawHeader = true; }
      else if (type === "IDAT") sawData = true;
      else if (type === "IEND") { if (length || !sawData || end !== bytes.length) invalid(); return "png"; }
      else if (["acTL", "fcTL", "fdAT"].includes(type)) invalid();
      else if (!["PLTE", "tRNS", "gAMA", "cHRM", "sRGB", "pHYs", "sBIT", "bKGD", "hIST"].includes(type)) {
        // Unknown chunks and text/profile metadata are not accepted at the upload boundary.
        invalid();
      }
      position = end;
    }
    invalid();
  }
  if (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP") {
    if (bytes.length < 20 || bytes.readUInt32LE(4) + 8 !== bytes.length) invalid();
    let position = 12, image = false;
    while (position + 8 <= bytes.length) {
      const type = bytes.toString("ascii", position, position + 4);
      const length = bytes.readUInt32LE(position + 4);
      const end = position + 8 + length;
      if (end + (length % 2) > bytes.length) invalid();
      if (["ANIM", "ANMF"].includes(type)) invalid();
      if (!["VP8 ", "VP8L", "VP8X", "ALPH", "EXIF"].includes(type)) invalid();
      if (type === "EXIF") inspectMetadata(bytes.subarray(position + 8, end));
      if (type === "VP8X" && (length !== 10 || (bytes[position + 8] & 2))) invalid();
      if (type === "VP8 " || type === "VP8L") { if (image) invalid(); image = true; }
      if (length % 2 && bytes[end] !== 0) invalid();
      position = end + (length % 2);
    }
    if (position !== bytes.length || !image) invalid();
    return "webp";
  }
  if (bytes[0] === 0xff && bytes[1] === 0xd8) {
    let position = 2, scan = false;
    while (position < bytes.length) {
      if (bytes[position++] !== 0xff) invalid();
      while (bytes[position] === 0xff) position++;
      const marker = bytes[position++];
      if (marker === 0xd9) { if (!scan || position !== bytes.length) invalid(); return "jpeg"; }
      if (marker === 0xd8 || marker === 0 || marker === undefined || (marker >= 0xd0 && marker <= 0xd7)) invalid();
      if (position + 2 > bytes.length) invalid();
      const length = bytes.readUInt16BE(position);
      if (length < 2 || position + length > bytes.length) invalid();
      if (marker >= 0xe0 && marker <= 0xef || marker === 0xfe) {
        const metadata = bytes.subarray(position + 2, position + length);
        inspectMetadata(metadata);
        if (marker !== 0xe0 && marker !== 0xe1 && marker !== 0xe2 && marker !== 0xee && !(stockMetadata && marker === 0xed && metadata.subarray(0,14).equals(Buffer.from("Photoshop 3.0\0")))) invalid();
        if (marker === 0xe0 && !metadata.subarray(0, 5).equals(Buffer.from("JFIF\0"))) invalid();
        if (marker === 0xe2 && !metadata.subarray(0, 12).equals(Buffer.from("ICC_PROFILE\0"))) invalid();
        if (marker === 0xe1 && !metadata.subarray(0, 6).equals(Buffer.from("Exif\0\0")) && !(stockMetadata && metadata.subarray(0,29).equals(Buffer.from("http://ns.adobe.com/xap/1.0/\0")))) invalid();
      }
      position += length;
      if (marker === 0xda) {
        scan = true;
        while (position < bytes.length) {
          if (bytes[position] !== 0xff) { position++; continue; }
          const next = bytes[position + 1];
          if (next === 0 || next >= 0xd0 && next <= 0xd7) { position += 2; continue; }
          break;
        }
      }
    }
    invalid();
  }
  invalid();
}
let processing=0;
export async function processImage(input:Buffer,filename:string,stockMetadata=false){if(processing>=2)throw new AppError(429,"Image processing is busy. Try again shortly.");processing++;try{return await processRaster(input,filename,stockMetadata);}finally{processing--;}}
async function processRaster(input: Buffer, filename: string, stockMetadata=false) {
  if (input.length > MAX_BYTES) throw new AppError(413, "Images must be 8 MiB or smaller");
  const format = validateContainer(input, stockMetadata);
  try {
    const options = { limitInputPixels: MAX_PIXELS, failOn: "warning" as const };
    const metadata = await sharp(input, options).metadata();
    if (metadata.format !== format || (metadata.pages ?? 1) !== 1) invalid();
    const width = metadata.width ?? 0, height = metadata.height ?? 0;
    if (width < 16 || height < 16 || width > 8192 || height > 8192 || width * height > MAX_PIXELS)
      throw new AppError(400, "Image dimensions must be 16–8192 pixels and at most 24 megapixels");
    const rotated = (metadata.orientation ?? 1) >= 5;
    const variants:{name:'thumb'|'small'|'medium'|'large';data:Buffer;width:number;height:number}[]=[];
    for(const [name,size] of [['thumb',320],['small',640],['medium',1280],['large',1920]] as const){
      const { data, info } = await sharp(input, options).rotate().resize({ width: size, height: size, fit: "inside", withoutEnlargement: true }).webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
      variants.push({ name, data, width: info.width, height: info.height });
    }
    const stem=filename.split(/[\\/]/).pop()!.normalize("NFKC").replace(/\.[^.]*$/,"").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").slice(0,120)||"image";
    const safeName=stem+'.'+(format==='jpeg'?'jpg':format);
    return { filename: safeName, mimeType: `image/${format}`, width: rotated ? height : width, height: rotated ? width : height, size: input.length, variants };
  } catch (error) {
    if (error instanceof AppError) throw error;
    invalid();
  }
}

