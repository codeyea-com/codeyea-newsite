'use client';

import { useEffect, useMemo, useState } from 'react';
import { applyAiTextChanges } from '@/content/ai-text-patch';
import type { Page } from './types';

type Change = { path: string; before: string; value: string };
type Proposal = { id: string; summary: string; changes: Change[]; baseVersion: number };
function pageSnapshot(page: Page): Record<string, unknown> {
  return {
    title: page.title,
    sections: page.sections,
    ...(page.homepage ? { homepage: page.homepage } : {}),
    ...(page.about ? { about: page.about } : {}),
    ...(page.industriesPage ? { industriesPage: page.industriesPage } : {}),
    ...(page.industryDetail ? { industryDetail: page.industryDetail } : {}),
    ...(page.servicesPage ? { servicesPage: page.servicesPage } : {}),
  };
}

export function AiAssistant({ page, onApply }: { page: Page; onApply: (page: Page) => void }) {
  const snapshot = useMemo(() => pageSnapshot(page), [page]);
  const fingerprint = JSON.stringify(snapshot);
  const [instruction, setInstruction] = useState('');
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposalFingerprint, setProposalFingerprint] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/ai/proposals', { cache: 'no-store' }).then(async response => {
      if (response.status === 401) throw new Error('Sign in again to use the assistant.');
      if (response.status === 403) throw new Error('Your account does not have permission to use the assistant.');
      if (!response.ok) throw new Error('Assistant status is unavailable.');
      const data = await response.json() as { configured: boolean };
      if (active) setConfigured(data.configured);
    }).catch(e => { if (active) setError(e instanceof Error ? e.message : 'Assistant status is unavailable.'); });
    return () => { active = false; };
  }, []);

  const stale = Boolean(proposal && proposalFingerprint !== fingerprint);
  async function requestProposal() {
    setBusy(true); setError(''); setProposal(null);
    try {
      const response = await fetch('/api/ai/proposals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: page.id, expectedVersion: page.version, instruction, snapshot }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not prepare a proposal.');
      setProposal(data as Proposal); setProposalFingerprint(fingerprint);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not prepare a proposal.'); }
    finally { setBusy(false); }
  }
  async function handle(action: 'applied' | 'discarded') {
    if (!proposal || stale) return;
    setBusy(true); setError('');
    try {
      const response = await fetch('/api/ai/proposals', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ proposalId: proposal.id, action }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not update proposal status.');
      if (action === 'applied') onApply({ ...page, ...applyAiTextChanges(snapshot, proposal.changes) });
      setProposal(null);
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not update proposal status.'); }
    finally { setBusy(false); }
  }

  return <section className="cms-ai-assistant" aria-label="AI content assistant">
    <div><p className="seo-eyebrow">Draft assistant</p><h2>AI content suggestions</h2><p>Ask for a page-copy or SEO improvement. Suggestions are reviewed here first and never save or publish automatically.</p></div>
    {configured === false && <p className="cms-ai-note">AI provider is not connected yet. Add server-only AI_API_URL, AI_MODEL and AI_API_KEY settings to enable it.</p>}
    <label className="field-label">What should change?
      <textarea dir={page.homepage?.localeId === 'ar' ? 'rtl' : undefined} maxLength={1200} minLength={10} rows={3} value={instruction} onChange={e => setInstruction(e.target.value)} placeholder="For example: make the SEO description clearer for business owners without adding unsupported claims." />
      <small>{instruction.length}/1200 · page text is sent to the configured AI provider for this request.</small>
    </label>
    <button type="button" disabled={busy || configured !== true || instruction.trim().length < 10} onClick={requestProposal}>{busy ? 'Preparing…' : 'Suggest edits'}</button>
    {error && <p role="alert">{error}</p>}
    {proposal && <article className="cms-ai-proposal"><h3>Proposed changes</h3><p>{proposal.summary}</p>{stale&&<p role="alert">The draft changed after this suggestion. Generate a new proposal before applying it.</p>}<div className="cms-ai-diff">{proposal.changes.map((change,index)=><section key={index}><code>{change.path}</code><del>{change.before || 'Empty'}</del><ins>{change.value || 'Empty'}</ins></section>)}</div><div className="cms-actions"><button type="button" disabled={busy||stale} onClick={()=>void handle('applied')}>Apply to unsaved draft</button><button type="button" disabled={busy} onClick={()=>void handle('discarded')}>Discard</button></div></article>}
  </section>;
}
