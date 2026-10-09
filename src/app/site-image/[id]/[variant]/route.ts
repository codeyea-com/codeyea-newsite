import { GET as serveMedia } from '@/app/api/media/[id]/[variant]/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string; variant: string }> },
) {
  return serveMedia(request, context);
}
