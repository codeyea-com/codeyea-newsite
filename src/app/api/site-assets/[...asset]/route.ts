import fs from 'node:fs/promises';
import path from 'node:path';
import { isPublicTemplateAsset, rewriteTemplateAssetCode } from '@/server/site-documents';
import { failure, noStore } from '@/server/http';

export async function GET(req: Request, { params }: { params: Promise<{ asset: string[] }> }) {
  try {
    const { asset } = await params;
    const relative = asset.join('/');
    if (!/^(quote-review|shared-navigation|[a-z-]+-review|digital-service-template-preview)\/[a-zA-Z0-9_./-]+\.(css|js|png|jpg|jpeg|webp|svg|woff2)$/.test(relative) || asset.some(part => part === '..' || part === '.' || part.includes('\\'))) return new Response('Not found', { status: 404 });
    const root = path.resolve('site-templates');
    const file = path.resolve(root, ...asset);
    if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });

    if (!isPublicTemplateAsset(relative)) return new Response('Not found', { status: 404 });

    let body = await fs.readFile(file);
    const ext = path.extname(file);
    if (ext === '.css' || ext === '.js') {
      const url = new URL(req.url);
      const surface = url.searchParams.get('surface') === 'public' ? 'public' : 'preview';
      const locale = url.searchParams.get('locale') === 'ar' ? 'ar' : 'en';
      body = Buffer.from(rewriteTemplateAssetCode(relative, body.toString(), surface, locale));
    }
    const types: Record<string, string> = { '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
    return new Response(body, { headers: { ...noStore, 'Content-Type': types[ext], 'X-Content-Type-Options': 'nosniff' } });
  } catch (error) { return failure(error); }
}
