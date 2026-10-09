# CODEYEA AI Content Assistant Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Turn the CMS AI placeholder into a secure assistant that proposes validated page-content/SEO edits for human review without publishing automatically.

**Architecture:** Add a server-only provider adapter and bounded proposal API. The model receives only the selected draft and approved context; output is a schema-validated patch shown as a diff. Applying changes updates the local unsaved editor state; saving and publishing remain separate actions.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Zod, existing CMS roles/audit, Playwright.

**Spec:** [CMS/SEO design](../specs/2026-10-08-cms-seo-maintenance-arabic-design.md)

## Global Constraints

- No model secrets in browser code, logs, returned settings, or proposals.
- Fail closed and show “provider not configured” until a real provider is selected and configured.
- AI may propose only fields permitted by the selected page schema; no publish, route identity, permission, integration, or protected-design changes.
- Require a human apply action, then the existing save/publish permissions and audit trail.

## Review Focus

- Prompt injection in page text: test content is treated as data, not authority.
- Malformed model output: schema reject and no editor mutation.
- Unauthorized user or stale page version: block and require reload.
- Rate/size/time limit: return a safe error without persisting partial changes.
- Provider outage or missing key: clear unavailable state, no fake AI response.

---

### Task 1: AI provider configuration and proposal contract

**Files:** `src/schemas/ai-assistant.ts` (create), `src/server/ai/` (create), `src/server/env.ts`, `src/server/permissions.ts`, `src/app/api/ai/proposals/route.ts` (create), `tests/ai-assistant.test.ts` (create).

- [ ] Define input limits, allowed editable fields, typed patch output, and provider error states in Zod.
- [ ] Implement a provider-neutral server adapter that reads a server-side provider/key and reports unavailable when configuration is absent.
- [ ] Require the existing AI permission, exact Origin, authenticated actor, current document version, and bounded request rate.
- [ ] Test missing configuration, role denial, oversized prompts, injection-like content handling, malformed patch rejection, and version conflict.

### Task 2: Reviewable proposal UI

**Files:** `src/app/admin/page.tsx`, `src/components/cms/ai-assistant.tsx` (create), `src/components/cms/types.ts`, `src/app/api/site-operations/route.ts`, `e2e/ai-assistant.spec.ts` (create).

- [ ] Replace “future-agent instruction” wording with a page-scoped assistant that explains configuration state.
- [ ] Show proposal explanation and field-by-field before/after diff; provide explicit Apply and Discard actions.
- [ ] Apply only the validated patch to unsaved editor state; keep Save draft and Publish as separate controls.
- [ ] Record request, proposal, apply, and publication as distinct actor-attributed audit events without storing secrets.
- [ ] Test the full propose/review/apply/discard/save lifecycle, cancel behavior, stale revisions, and no automatic publication.
- [ ] Run `npm test`, `npm run typecheck`, and focused Playwright tests.
