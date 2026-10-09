'use client';
import {useState} from 'react';
import {assetUrl} from '@/content/homepage-assets';
import type {TemplateImage} from '@/server/site-documents';
import {MediaPicker} from './media-picker';

export function TemplateImageEditor({value,onChange}:{value:TemplateImage[];onChange:(images:TemplateImage[])=>void}){
 const [selected,setSelected]=useState<number|null>(null);
 return <details className="site-report template-image-editor">
  <summary>Template images · {value.length} replaceable images</summary>
  <p className="small">Select a library image for any original design image. Changes stay in the private draft until you save and publish the page.</p>
  <div className="template-image-grid">{value.map((image,index)=><article key={image.key}>
   {image.mediaId?<img src={assetUrl(image.mediaId)} alt={image.decorative?'':image.alt} loading="lazy"/>:<div className="template-image-placeholder" aria-hidden="true">Image {index+1}</div>}
   <strong>Design image {index+1}</strong>
   <button type="button" onClick={()=>setSelected(index)}>{image.mediaId?'Replace image':'Choose image'}</button>
   <label className="field-label">Alt text<input maxLength={300} value={image.alt} disabled={image.decorative} onChange={e=>onChange(value.map((entry,n)=>n===index?{...entry,alt:e.target.value}:entry))}/></label>
   <label><input type="checkbox" checked={image.decorative} onChange={e=>onChange(value.map((entry,n)=>n===index?{...entry,decorative:e.target.checked}:entry))}/> Decorative image</label>
  </article>)}</div>
  {selected!==null&&<MediaPicker selected={value[selected]?.mediaId??''} close={()=>setSelected(null)} choose={(mediaId,defaults)=>{onChange(value.map((entry,index)=>index===selected?{...entry,mediaId,alt:defaults?.alt??entry.alt,decorative:defaults?.decorative??entry.decorative}:entry));setSelected(null)}}/>}
 </details>
}
