import { actor, failure, noStore } from '@/server/http';
import { selectedStock } from '@/server/stock/service';
import { downloadStock } from '@/server/stock/download';
import sharp from 'sharp';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { const user = await actor(request); const photo = await selectedStock(user?.id ?? null, new URL(request.url).searchParams.get('token') ?? '');
    const { bytes } = await downloadStock(photo, true);
    const preview = await sharp(bytes, { limitInputPixels: 24000000 }).rotate().resize({ width: 800, height: 800, fit: 'inside', withoutEnlargement: true }).webp({ quality: 80 }).toBuffer();
    return new Response(new Uint8Array(preview), { headers: { ...noStore, 'Content-Type': 'image/webp', 'X-Content-Type-Options': 'nosniff', 'Content-Security-Policy': "default-src 'none'" } });
  } catch (error) { return failure(error); }
}
