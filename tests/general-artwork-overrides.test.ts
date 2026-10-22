import test from 'node:test';
import assert from 'node:assert/strict';
import registry from '../src/content/generated-general-artwork.json';
import {generalArtwork,type GeneralArtwork} from '../src/content/generated-general-artwork';
import type {AboutMedia} from '../src/schemas/about';

test('bilingual reviewed replacements preserve future custom CMS uploads',()=>{
 for(const [key,art]of Object.entries(registry) as [string,GeneralArtwork][]){
  if(!art.expectedMediaIds)continue;
  for(const mediaId of art.expectedMediaIds)assert.equal(generalArtwork(key,{mediaId} as AboutMedia)?.src,art.src);
  assert.equal(generalArtwork(key,{mediaId:'media_00000000-0000-4000-8000-000000000000'} as AboutMedia),undefined);
 }
});
