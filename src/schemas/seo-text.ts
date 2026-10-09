import {z} from 'zod';
import {mediaRef} from './contract-primitives';
import {homepageAssets} from '../content/homepage-assets';

const registeredSeoImage=mediaRef.refine(v=>homepageAssets.some(a=>a.id===v.mediaId)||/^media_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(v.mediaId),'Choose a registered image');

export const seoTextSchema=z.object({
 title:z.string().trim().min(1).max(120),
 description:z.string().trim().min(1).max(320),
 focusPhrase:z.string().trim().max(120).optional(),
 canonicalPath:z.string().trim().max(240).refine(v=>v===''||/^\/(?!\/)[a-zA-Z0-9/_-]*$/.test(v),'Use a same-site path without query strings or fragments').optional(),
 index:z.boolean().optional(),
 follow:z.boolean().optional(),
 socialTitle:z.string().trim().max(120).optional(),
 socialDescription:z.string().trim().max(320).optional(),
 socialImage:registeredSeoImage.optional(),
}).strict();

export type SeoText=z.infer<typeof seoTextSchema>;
