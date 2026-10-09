import { GET as serveMedia } from '@/app/api/media/[id]/[variant]/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const variant = new URL(request.url).searchParams.get('variant') ?? 'large';
  return serveMedia(request, { params: Promise.resolve({ id, variant }) });
}
