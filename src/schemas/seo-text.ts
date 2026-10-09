import {z} from 'zod';

export const seoTextSchema=z.object({
 title:z.string().trim().min(1).max(120),
 description:z.string().trim().min(1).max(320),
}).strict();

export type SeoText=z.infer<typeof seoTextSchema>;
