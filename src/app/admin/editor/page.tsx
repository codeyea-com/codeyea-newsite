"use client";
import {
  cmsPageIds,
  industrySlugs,
  industryNames,
  isIndustrySlug,
} from "@/content/industry-registry";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PagePicker } from "@/components/cms/page-picker";

import type { Data, Page, Revision } from "@/components/cms/types";
import { DraftEditor } from "@/components/cms/draft-editor";
import { ServicesEditor } from "@/components/cms/services-editor";
import { IndustriesEditor } from "@/components/cms/industries-editor";
import { IndustryDetailEditor } from "@/components/cms/industry-detail-editor";
import { AboutEditor } from "@/components/cms/about-editor";
import { RevisionList } from "@/components/cms/revision-list";
import { Activity } from "@/components/cms/activity";
import { BrandReference } from "@/components/cms/brand-reference";
import { SeoEditor } from "@/components/cms/seo-editor";
import { AiAssistant } from "@/components/cms/ai-assistant";
import type { SeoText } from "@/schemas/seo-text";
import { pagePath } from "@/content/site-routes";

export default function Admin() {
  const router = useRouter();
  const loadSequence=useRef(0);
  const [data, setData] = useState<Data | null>(null);
  const [pageId, setPageId] = useState("homepage");
  useEffect(() => {
    const page = new URLSearchParams(window.location.search).get("page");
    if (page && (cmsPageIds as readonly string[]).includes(page))
      setPageId(page);
  }, []);
  const [missingAbout, setMissingAbout] = useState(false);
  const [switching, setSwitching] = useState(false);
  const [draft, setDraft] = useState<Page | null>(null);
  const [tab, setTab] = useState("Content");
  const [busy, setBusy] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const request=++loadSequence.current;
    const response = await fetch("/api/cms?pageId=" + pageId, {
      cache: "no-store",
    });
    if(request!==loadSequence.current)return;
    if (response.status === 401) {
      router.replace("/login");
      return;
    }
    if (response.status === 404 && pageId !== "homepage") {
      setMissingAbout(true);
      setSwitching(false);
      return;
    }
    if (!response.ok)
      throw new Error("Unable to load the content studio. Please retry.");
    const result: Data = await response.json();
    if(request!==loadSequence.current)return;
    setData(result);
    setDraft(structuredClone(result.page));
    setMissingAbout(false);
    setSwitching(false);
    return result;
  }, [router, pageId]);
  useEffect(() => {
    load().catch((e: Error) => {
      setError(e.message);
      setSwitching(false);
    });
    return()=>{loadSequence.current++};
  }, [load]);
  const dirty =
    !missingAbout &&
    !!draft &&
    !!data &&
    JSON.stringify(draft) !== JSON.stringify(data.page);
  async function initializeAbout() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pageId }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Could not initialize About.");
      }
      await load();
      setNotice(
        "Page draft initialized privately. Review and save before publishing.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not initialize About.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) {
        event.preventDefault();
      }
    };
    const protect = (event: MouseEvent) => {
      const link = (event.target as HTMLElement).closest("a");
      if (
        dirty &&
        link &&
        link.target !== "_blank" &&
        !window.confirm("Leave this editor and discard unsaved changes?")
      )
        event.preventDefault();
    };
    document.addEventListener("click", protect, true);
    window.addEventListener("beforeunload", warn);
    return () => {
      window.removeEventListener("beforeunload", warn);
      document.removeEventListener("click", protect, true);
    };
  }, [dirty]);
  async function loadMoreRevisions() {
    if (!data?.nextRevisionVersion || loadingMore) return;
    setLoadingMore(true);
    setError("");
    try {
      const response = await fetch(
        "/api/cms/revisions?pageId=" +
          pageId +
          "&beforeVersion=" +
          data.nextRevisionVersion,
        { cache: "no-store" },
      );
      if (!response.ok)
        throw new Error("Could not load older revisions. Please retry.");
      const result: {
        revisions: Revision[];
        nextRevisionVersion: number | null;
      } = await response.json();
      setData((current) =>
        current
          ? {
              ...current,
              revisions: [
                ...current.revisions,
                ...result.revisions.filter(
                  (item) =>
                    !current.revisions.some(
                      (existing) => existing.id === item.id,
                    ),
                ),
              ],
              nextRevisionVersion: result.nextRevisionVersion,
            }
          : current,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not load older revisions.",
      );
    } finally {
      setLoadingMore(false);
    }
  }
  async function save(event: FormEvent, pageToSave = draft) {
    event.preventDefault();
    if (!pageToSave) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: pageToSave.id,
          expectedVersion: pageToSave.version,
          title: pageToSave.title,
          sections: pageToSave.sections,
          homepage: pageToSave.homepage,
          about: pageToSave.about,
          industriesPage: pageToSave.industriesPage,
          industryDetail: pageToSave.industryDetail,
          servicesPage: pageToSave.servicesPage,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Draft could not be saved.");
      }
      const saved = await load();
      setNotice(
        saved?.page.hasUnpublishedChanges
          ? "Draft saved with unpublished changes."
          : "Draft saved. Published content matches this draft.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Draft could not be saved.");
    } finally {
      setBusy(false);
    }
  }
  async function publish() {
    if (!draft || dirty || busy || !data?.permissions.includes("publish_pages"))
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/cms/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: draft.id,
          expectedVersion: draft.version,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Publishing failed.");
      }
      await load();
      setNotice("Published. The public page now shows this saved draft.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Publishing failed.");
    } finally {
      setBusy(false);
    }
  }
  async function restore(revision: Revision) {
    if (!draft) return;
    if (
      dirty &&
      !window.confirm("Restore this revision and discard your unsaved changes?")
    )
      return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/cms/restore", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pageId: draft.id,
          revisionId: revision.id,
          expectedVersion: draft.version,
        }),
      });
      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Revision could not be restored.");
      }
      await load();
      setNotice(
        `Revision ${revision.version} restored as a new draft. Published content is unchanged.`,
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Revision could not be restored.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    if (dirty && !window.confirm("Sign out and discard unsaved changes?"))
      return;
    setBusy(true);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
      });
      if (!response.ok) throw new Error("Sign out failed. Please retry.");
      router.replace("/login");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign out failed.");
      setBusy(false);
    }
  }
  if (!data || !draft)
    return (
      <main className="loading">
        <img src="/brand/logo-dark.png" alt="CODEYEA" width="220" height="50" />
        <p role="status">{error || "Opening content studio…"}</p>
        {error && (
          <button
            className="button"
            onClick={() => {
              setError("");
              load().catch((e: Error) => setError(e.message));
            }}
          >
            Retry
          </button>
        )}
      </main>
    );
  const canEdit = data.permissions.includes("edit_pages");
  const canRestore = data.permissions.includes("edit_pages");
  const seoValue = readPageSeo(draft);
  function updateSeo(value: SeoText) {
    setDraft((current) => (current ? writePageSeo(current, value) : current));
    setNotice("");
  }
  return (
    <div className="studio">
      <aside className="sidebar">
        <Link href="/" aria-label="CODEYEA website">
          <img
            className="brand"
            src="/brand/logo-dark.png"
            alt="CODEYEA"
            width="190"
            height="43"
          />
        </Link>
        <p className="studio-label">Content studio</p>
        <PagePicker
          current={pageId}
          dirty={dirty}
          disabled={busy || switching || loadingMore}
        />
        <nav aria-label="Studio">
          {["Content", "SEO", "Revisions", "Audit log", "Brand & taxonomy"].map(
            (item) => (
              <button
                key={item}
                aria-current={tab === item ? "page" : undefined}
                className={tab === item ? "nav-item active" : "nav-item"}
                onClick={() => setTab(item)}
              >
                {item}
              </button>
            ),
          )}
        </nav>
        <div className="sidebar-bottom">
          <span className="avatar" aria-hidden="true">
            {data.user.name.charAt(0)}
          </span>
          <strong>{data.user.name}</strong>
          <span className="small">{data.user.email}</span>
          <button className="quiet-link" onClick={logout} disabled={busy}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="workspace">
        <header className="workspace-header">
          <span>
            Website /{" "}
            {isIndustrySlug(pageId)
              ? industryNames[pageId]
              : pageId === "homepage"
                ? "Homepage"
                : pageId === "about"
                  ? "About"
                  : pageId === "services"
                    ? "Services"
                    : "Industries"}
          </span>
          <Link
            href={
              isIndustrySlug(pageId)
                ? "/industries/" + pageId + "/"
                : pageId === "homepage"
                  ? "/"
                  : "/" + pageId
            }
            target="_blank"
            className="quiet-link"
          >
            View public page
          </Link>
        </header>
        <div className="workspace-body">
          <div className="page-heading">
            <div>
              <h1>
                {tab === "Content"
                  ? pageId === "about"
                    ? "Shape your About page."
                    : isIndustrySlug(pageId)
                      ? "Shape your " + industryNames[pageId] + " page."
                      : pageId === "industries"
                        ? "Shape your Industries page."
                        : "Shape your homepage."
                  : tab}
              </h1>
              <p>
                {tab === "Content"
                  ? "Edit the story. Save a draft. Keep every version."
                  : tab === "Revisions"
                    ? "A record of your content, with room to revisit."
                    : tab === "Audit log"
                      ? "Who changed what, and when."
                      : "The approved language and visual foundation for CODEYEA."}
              </p>
            </div>
            <span className="status-pill">
              {missingAbout
                ? "Not initialized"
                : switching
                  ? "Loading…"
                  : dirty
                    ? "Unsaved edits"
                    : data.page.hasUnpublishedChanges
                      ? "Draft saved with unpublished changes"
                      : "Published"}{" "}
              {!missingAbout && !switching && <> · v{draft.version}</>}
            </span>
          </div>
          <div role="alert" className={error ? "feedback error" : ""}>
            {error}
          </div>
          <div role="status" className={notice ? "feedback success" : ""}>
            {notice}
          </div>
          {switching && <p role="status">Loading page…</p>}
          {!switching && missingAbout && (
            <section className="editor-fields">
              <h2>
                {isIndustrySlug(pageId)
                  ? `Start a ${industryNames[pageId]} draft`
                  : pageId === "about"
                    ? "Start an About draft"
                    : "Start an Industries draft"}
              </h2>
              <p>
                This page has not been initialized. Create a private draft to
                review its content. This does not publish a page.
              </p>
              <button
                type="button"
                className="button"
                disabled={busy || !canEdit}
                onClick={initializeAbout}
              >
                {isIndustrySlug(pageId)
                  ? `Initialize ${industryNames[pageId]} draft`
                  : pageId === "about"
                    ? "Initialize About draft"
                    : "Initialize Industries draft"}
              </button>
            </section>
          )}
          {!switching &&
            !missingAbout &&
            draft.id === pageId &&
            tab === "Content" && (
              <Editor
                approvedProjects={data.approvedProjects}
                draft={draft}
                dirty={dirty}
                busy={busy}
                canEdit={canEdit}
                canPublish={data.permissions.includes("publish_pages")}
                onPublish={publish}
                onSave={save}
                onChange={(value) => {
                  setDraft(value);
                  setNotice("");
                }}
              />
            )}
          {!switching &&
            !missingAbout &&
            draft.id === pageId &&
            tab === "SEO" && (
              <>
                <AiAssistant
                  key={draft.id}
                  page={draft}
                  onApply={(next) => {
                    setDraft(next);
                    setNotice(
                      "AI suggestions applied to this unsaved draft. Save changes to keep them.",
                    );
                  }}
                />
                <form
                  onSubmit={(event) =>
                    void save(event, writePageSeo(draft, seoValue))
                  }
                  className="editor-fields"
                >
                  <SeoEditor
                    value={seoValue}
                    path={pagePath(pageId) ?? `/${pageId}/`}
                    onChange={updateSeo}
                  />
                  <div className="cms-actions">
                    <button
                      className="button"
                      disabled={!dirty || busy || !canEdit}
                    >
                      Save SEO draft
                    </button>
                    <span>
                      Draft metadata stays private until the page is published.
                    </span>
                  </div>
                </form>
              </>
            )}
          {!switching &&
            !missingAbout &&
            draft.id === pageId &&
            tab === "Revisions" && (
              <RevisionList
                key={pageId}
                revisions={data.revisions}
                draft={draft}
                nextVersion={data.nextRevisionVersion}
                onLoadMore={loadMoreRevisions}
                loadingMore={loadingMore}
                busy={busy}
                canRestore={canRestore}
                onRestore={restore}
              />
            )}
          {tab === "Audit log" && <Activity audit={data.audit} />}
          {tab === "Brand & taxonomy" && <BrandReference />}
        </div>
        <footer className="workspace-footer">
          CODEYEA · Digital Innovation Agency{" "}
          <span>
            {isIndustrySlug(pageId)
              ? industryNames[pageId]
              : pageId === "homepage"
                ? "Homepage"
                : pageId === "about"
                  ? "About"
                  : pageId === "services"
                    ? "Services"
                    : "Industries"}{" "}
            CMS / Review workspace
          </span>
        </footer>
      </main>
    </div>
  );
}
function readPageSeo(page: Page): SeoText {
  const value =
    page.homepage?.seo ??
    page.about?.seo ??
    page.servicesPage?.seo ??
    page.industriesPage?.seo ??
    page.industryDetail?.seo;
  if (
    value &&
    typeof value === "object" &&
    "title" in value &&
    "description" in value
  )
    return value as SeoText;
  return {
    title: `${page.title} | CODEYEA`,
    description: `Explore CODEYEA ${page.title.toLowerCase()} services and digital solutions.`,
  };
}
function writePageSeo(page: Page, value: SeoText): Page {
  if (page.homepage)
    return { ...page, homepage: { ...page.homepage, seo: value } };
  if (page.about) return { ...page, about: { ...page.about, seo: value } };
  if (page.servicesPage)
    return { ...page, servicesPage: { ...page.servicesPage, seo: value } };
  if (page.industriesPage)
    return { ...page, industriesPage: { ...page.industriesPage, seo: value } };
  if (page.industryDetail)
    return { ...page, industryDetail: { ...page.industryDetail, seo: value } };
  return page;
}
function Editor(
  props: React.ComponentProps<typeof DraftEditor> & {
    approvedProjects?: { id: string; title: string }[];
  },
) {
  return props.draft.servicesPage ? (
    <ServicesEditor {...props} />
  ) : Boolean(props.draft.industryDetail) ? (
    <IndustryDetailEditor {...props} />
  ) : props.draft.id === "industries" ? (
    <IndustriesEditor {...props} />
  ) : props.draft.id === "about" ? (
    <AboutEditor {...props} />
  ) : (
    <DraftEditor {...props} />
  );
}
