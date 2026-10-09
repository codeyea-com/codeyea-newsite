'use client';
import { useEffect, useRef, useState } from 'react';
type Photo = { token: string; provider: string; providerId: string; sourcePageUrl: string; contributor: string; contributorUrl: string | null; width: number; height: number; alt: string; preview: string; licenseLabel: string };
type Result = { provider: string; photos: Photo[]; hasMore: boolean; error: string | null };
export function StockSearch({ onImported, close }: { onImported: () => void; close: () => void }) {
  const [query, setQuery] = useState(''); const [provider, setProvider] = useState('all'); const [orientation, setOrientation] = useState('landscape');
  const [results, setResults] = useState<Result[]>([]); const [page, setPage] = useState(0); const [busy, setBusy] = useState(false); const [error, setError] = useState('');
  const [selected, setSelected] = useState<Photo | null>(null); const [alt, setAlt] = useState(''); const [confirmed, setConfirmed] = useState(false); const [message, setMessage] = useState('');
  const request = useRef<AbortController | null>(null); const searched = useRef({ query: '', provider: 'all', orientation: 'landscape' });
  useEffect(() => () => request.current?.abort(), []);
  async function search(more = false) {
    request.current?.abort(); const controller = new AbortController(); request.current = controller; setBusy(true); setError(''); setMessage(''); setSelected(null); setConfirmed(false);
    const input = more ? searched.current : { query: query.trim(), provider, orientation }; const next = more ? page + 1 : 1;
    try { const response = await fetch('/api/media/stock?' + new URLSearchParams({ ...input, page: String(next) }), { signal: controller.signal }); const data = await response.json(); if (!response.ok) throw new Error(data.error);
      searched.current = input; setPage(next); setResults(previous => more ? data.results.map((r: Result) => ({ ...r, photos: [...(previous.find(p => p.provider === r.provider)?.photos ?? []), ...r.photos].filter((p, i, all) => all.findIndex(v => v.token === p.token) === i) })) : data.results);
    } catch (e) { if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Search failed.'); } finally { if (!controller.signal.aborted) setBusy(false); }
  }
  async function importSelected() {
    if (!selected || !confirmed || !alt.trim()) return; setBusy(true); setError('');
    try { const response = await fetch('/api/media/stock', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: selected.token, alt, query: searched.current.query, confirmed: true }) }); const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setMessage(data.duplicate ? 'This image already exists in the library. No duplicate was created.' : 'Imported privately as temporary stock. Choose it from the media library when ready.'); setSelected(null); setConfirmed(false); onImported();
    } catch (e) { setError(e instanceof Error ? e.message : 'Import failed.'); } finally { setBusy(false); }
  }
  return <section aria-label="Search free stock" className="cms-stock-search">
    <div className="section-heading"><h3>Search free stock</h3><button type="button" disabled={busy} onClick={close}>Back to media library</button></div>
    <p>Photos provided by <a href="https://www.pexels.com" target="_blank" rel="noopener noreferrer">Pexels</a> and <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer">Pixabay</a>. Review the source and confirm each import. Stock remains temporary until owner approval.</p>
    <label className="field-label">Search keywords<input value={query} minLength={2} maxLength={100} onChange={e => setQuery(e.target.value)} /></label>
    <label className="field-label">Source<select value={provider} onChange={e => setProvider(e.target.value)}><option value="all">All</option><option value="pexels">Pexels</option><option value="pixabay">Pixabay</option></select></label>
    <label className="field-label">Orientation<select value={orientation} onChange={e => setOrientation(e.target.value)}><option value="landscape">Landscape</option><option value="portrait">Portrait</option><option value="square">Square</option></select></label>
    <p className="small">Pixabay square results are filtered to near-square proportions. Some pages may contain no matches.</p>
    <button type="button" disabled={busy || query.trim().length < 2} onClick={() => search()}>Search stock images</button>
    <p role="status">{busy ? 'Working…' : message}</p><p role="alert">{error}</p>
    {selected && <section className="cms-media-details" aria-label="Stock image preview"><h4>Review selected {selected.provider} image</h4><img src={selected.preview} alt={selected.alt || 'Selected stock photograph'} /><p>{selected.width} × {selected.height} · {selected.contributor}</p><a href={selected.sourcePageUrl} target="_blank" rel="noopener noreferrer">View original source page</a><p>{selected.licenseLabel}</p><label className="field-label">Alt text<input maxLength={300} value={alt} onChange={e => setAlt(e.target.value)} /></label><label><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} /> I confirm this selected image for import as temporary stock.</label><div className="cms-actions"><button type="button" disabled={busy || !confirmed || !alt.trim()} onClick={importSelected}>Confirm and import selected image</button><button type="button" disabled={busy} onClick={() => setSelected(null)}>Cancel selection</button></div></section>}
    {results.map(result => <section key={result.provider} aria-label={`${result.provider} search results`}><h4>{result.provider === 'pexels' ? 'Pexels' : 'Pixabay'}</h4>{result.error && <p role="status">{result.error}</p>}{!result.photos.length && !result.error && <p>No matching images on this page. Try other keywords or load the next page.</p>}<div className="cms-media-grid">{result.photos.map(photo => <article key={photo.token}><button type="button" disabled={busy} onClick={() => { setSelected(photo); setAlt(photo.alt); setConfirmed(false); }} aria-label={`Preview ${photo.provider} image ${photo.providerId}`}><img src={photo.preview} alt={photo.alt} loading="lazy" /><span>Preview image</span></button><p>{photo.contributor} · {photo.width} × {photo.height}</p><a href={photo.sourcePageUrl} target="_blank" rel="noopener noreferrer">Original {photo.provider} page</a></article>)}</div></section>)}
    {results.some(r => r.hasMore) && <button type="button" disabled={busy} onClick={() => search(true)}>Load more stock images</button>}
  </section>;
}
