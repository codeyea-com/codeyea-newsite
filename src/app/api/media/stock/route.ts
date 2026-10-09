import { z } from 'zod';
import { actor, failure, jsonInput, noStore, sameOrigin } from '@/server/http';
import { searchStock, importStock } from '@/server/stock/service';
import { requirePermission } from '@/server/permissions';
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  try { const user = await actor(request); return Response.json(await searchStock(user?.id ?? null, Object.fromEntries(new URL(request.url).searchParams)), { headers: noStore }); } catch (error) { return failure(error); }
}
const selection = z.object({ token: z.string().max(100), alt: z.string().trim().min(1).max(300), query: z.string().trim().min(2).max(100), confirmed: z.literal(true) }).strict();
export async function POST(request: Request) {
  try { sameOrigin(request); const user = await actor(request); await requirePermission(user?.id ?? null, 'manage_media'); const input = selection.parse(await jsonInput(request));
    return Response.json(await importStock(user!.id, input.token, input.alt, input.query), { status: 201, headers: noStore });
  } catch (error) { return failure(error); }
}
