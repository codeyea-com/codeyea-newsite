import { AppError } from '../errors';

export async function providerJson(url: URL, headers: HeadersInit, fetcher: typeof fetch = fetch): Promise<unknown> {
  try {
    const response = await fetcher(url, { headers, signal: AbortSignal.timeout(10000), redirect: 'error', cache: 'no-store' });
    if (response.status === 429) throw new AppError(429, 'This provider is temporarily rate limited. Try again later.');
    if (!response.ok) throw new AppError(502, 'This provider is temporarily unavailable.');
    if (!response.headers.get('content-type')?.includes('application/json')) throw new AppError(502, 'This provider returned an invalid response.');
    const reader = response.body?.getReader();
    if (!reader) throw new AppError(502, 'This provider returned an empty response.');
    const chunks: Uint8Array[] = []; let size = 0;
    for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length;
      if (size > 2 * 1024 * 1024) { await reader.cancel(); throw new AppError(502, 'This provider returned an oversized response.'); }
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch (error) {
    // Never propagate fetch exceptions, response bodies or URLs: Pixabay authenticates in its query.
    if (error instanceof AppError) throw error;
    throw new AppError(502, 'This provider could not be reached. Try again later.');
  }
}

export function providerUrl(value: string, hosts: readonly string[]): string {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.port || !hosts.includes(url.hostname)) throw new Error('Invalid provider URL');
  return url.href;
}
