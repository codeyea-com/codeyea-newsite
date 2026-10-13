import registry from './generated-artwork.json';
export type GeneratedArtwork = {src:string;mobileSrc?:string;width:number;height:number;alt:string;expectedSource?:string;overlay?:{title:string;rows:string[];label:string;accent:string}};
export function generatedArtwork(id:string):GeneratedArtwork|undefined {
  return (registry as Record<string,GeneratedArtwork>)[id];
}
