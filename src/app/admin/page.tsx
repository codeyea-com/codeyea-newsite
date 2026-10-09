"use client";
import {RouteMap} from "@/components/cms/route-map";
import { DocumentHistory } from "@/components/cms/document-history";
import { IntegrationSettings } from "@/components/cms/integration-settings";
import { AnalyticsPanel } from "@/components/cms/analytics-dashboard";
import {
  cmsPageIds,
  industryNames,
  isIndustrySlug,
} from "@/content/industry-registry";
import { useState, useEffect } from "react";
import Link from "next/link";
type Field = { key: string; label: string; value: string };
type Doc = {
  id: string;
  slug: string;
  title: string;
  kind: string;
  locale: string;
  version: number;
  draft: {
    templateHash?: string;
    fields: Field[];
    description: string;
    body?: string;
    category?: string;
    tags?: string[];
  };
};
type Lead = {
  id: string;
  kind: string;
  name: string;
  email: string;
  status: string;
  emailStatus: string;
  createdAt: string;
  payload: Record<string, unknown>;
};
export default function SiteStudio() {
  const [section, setSection] = useState("Pages"),
    [docs, setDocs] = useState<Doc[]>([]),
    [selected, setSelected] = useState<Doc | null>(null),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [dirty, setDirty] = useState(false),
    [ops, setOps] = useState<{
      leads: Lead[];
      connections: [string, boolean, string][];
      proposals: { id: string; instruction: string; status: string }[];
    } | null>(null),
    [lead, setLead] = useState<Lead | null>(null),
    [query, setQuery] = useState("");
  async function api(url: string, init?: RequestInit) {
    const r = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
    if (r.status === 401) {
      location.href = "/login";
      throw Error("Sign in required");
    }
    const d = await r.json();
    if (!r.ok) throw Error(d.error || "Request failed");
    return d;
  }
  async function load() {
    try {
      setDocs((await api("/api/site-documents")).documents);
    } catch (e) {
      setMessage(String(e));
    }
  }
  useEffect(() => {
    load();
  }, []);
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);
  async function choose(id: string) {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    try {
      setSelected((await api("/api/site-documents?id=" + id)).document);
      setDirty(false);
      setMessage("");
    } catch (e) {
      setMessage(String(e));
    }
  }
  async function switchSection(s: string) {
    if (dirty && !confirm("Discard unsaved changes?")) return;
    setSection(s);
    setSelected(null);
    setDirty(false);
    setMessage("");
    if (["Leads", "Integrations", "AI Agent"].includes(s))
      try {
        setOps(await api("/api/site-operations"));
      } catch (e) {
        setMessage(String(e));
      }
  }
  async function save() {
    if (!selected) return;
    setBusy(true);
    try {
      await api("/api/site-documents", {
        method: "PATCH",
        body: JSON.stringify({
          id: selected.id,
          version: selected.version,
          title: selected.title,
          draft: selected.draft,
        }),
      });
      setDirty(false);
      setSelected(
        (await api("/api/site-documents?id=" + selected.id)).document,
      );
      setMessage("Draft saved. Approved design unchanged.");
      await load();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  function update(d: Doc) {
    setSelected(d);
    setDirty(true);
  }
  async function operation(action: Record<string, string>) {
    setBusy(true);
    try {
      await api("/api/site-operations", {
        method: "POST",
        body: JSON.stringify(action),
      });
      setOps(await api("/api/site-operations"));
      setMessage("Saved.");
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="studio">
      <aside className="sidebar">
        <img src="/brand/logo-dark.png" alt="CODEYEA" width="190" />
        <p className="studio-label">Website management</p>
        <nav>
          {["Pages", "Posts", "Leads", "Integrations", "AI Agent"].map((s) => (
            <button
              key={s}
              className={"nav-item " + (section === s ? "active" : "")}
              onClick={() => switchSection(s)}
            >
              {s}
            </button>
          ))}
        </nav>
        <Link href="/admin/editor">Existing page editors & revisions ↗</Link>
      </aside>
      <main className="workspace">
        <header className="workspace-header">
          CODEYEA / {section}
          <span>Private drafts · English / Arabic ready</span>
        </header>
        <div className="workspace-body">
          <h1>{selected ? selected.title : section}</h1>
          <p role="status">{message}</p>
          {["Pages", "Posts"].includes(section) && !selected && (
            <>
              <p>
                Choose a {section === "Pages" ? "page" : "post"} to open its
                details.
              </p>
              {section === "Pages" && <RouteMap/>}
              <input
                aria-label="Search pages"
                placeholder="Search…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              {section === "Posts" && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const f = new FormData(e.currentTarget);
                    setBusy(true);
                    try {
                      const r = await api("/api/site-documents", {
                        method: "POST",
                        body: JSON.stringify({
                          title: f.get("title"),
                          slug: f.get("slug"),
                          locale: f.get("locale"),
                        }),
                      });
                      await load();
                      setSelected(r.document);
                    } catch (err) {
                      setMessage(String(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                >
                  <h2>New post draft</h2>
                  <input name="title" placeholder="Post title" required />
                  <input
                    name="slug"
                    placeholder="post-url-slug"
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    required
                  />
                  <select name="locale">
                    <option value="en">English</option>
                    <option value="ar">العربية</option>
                  </select>
                  <button disabled={busy}>Create draft</button>
                </form>
              )}
              <div className="site-page-list">
                {section === "Pages" &&
                  cmsPageIds
                    .filter((id) =>
                      (isIndustrySlug(id) ? industryNames[id] : id)
                        .toLowerCase()
                        .includes(query.toLowerCase()),
                    )
                    .map((id) => (
                      <Link
                        className="site-page-link"
                        key={id}
                        href={"/admin/editor?page=" + id}
                      >
                        <strong>
                          {isIndustrySlug(id)
                            ? industryNames[id]
                            : {
                                homepage: "Homepage",
                                about: "About Us",
                                services: "Services",
                                industries: "Industries",
                              }[id] || id}
                        </strong>
                        <span>Page details →</span>
                      </Link>
                    ))}
                {docs
                  .filter(
                    (d) =>
                      d.kind === (section === "Pages" ? "page" : "post") &&
                      d.title.toLowerCase().includes(query.toLowerCase()),
                  )
                  .map((d) => (
                    <button key={d.id} onClick={() => choose(d.id)}>
                      <strong>{d.title}</strong>
                      <span>
                        {d.locale.toUpperCase()} · Draft v{d.version} →
                      </span>
                    </button>
                  ))}
              </div>
              {section === "Pages" && (
                <p>
                  <Link href="/admin/editor">
                    Homepage, About, Services and Industry pages — open existing
                    editors →
                  </Link>
                </p>
              )}
            </>
          )}
          {selected && (
            <>
              <div className="site-toolbar">
                <button
                  onClick={() => {
                    if (!dirty || confirm("Discard unsaved changes?")) {
                      setSelected(null);
                      setDirty(false);
                    }
                  }}
                >
                  ← All {section}
                </button>
                {selected.kind === "page" && (
                  <a
                    href={
                      "/preview/pages/" +
                      selected.slug +
                      "?locale=" +
                      selected.locale
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview approved design ↗
                  </a>
                )}
                <button onClick={save} disabled={busy || !dirty}>
                  Save draft
                </button>
              </div>
              <DocumentHistory
                id={selected.id}
                version={selected.version}
                onRestore={async () => {
                  setDirty(false);
                  setSelected(
                    (await api("/api/site-documents?id=" + selected.id))
                      .document,
                  );
                  await load();
                  setMessage("Version restored as a private draft.");
                }}
              />
              <label className="site-field">
                Title
                <input
                  value={selected.title}
                  onChange={(e) =>
                    update({ ...selected, title: e.target.value })
                  }
                />
              </label>
              <p>
                /{selected.slug} ·{" "}
                {selected.locale === "ar" ? "Arabic / RTL" : "English / LTR"} ·
                Version {selected.version}
              </p>
              <label className="site-field">
                SEO description
                <textarea
                  value={selected.draft.description}
                  maxLength={320}
                  onChange={(e) =>
                    update({
                      ...selected,
                      draft: { ...selected.draft, description: e.target.value },
                    })
                  }
                />
              </label>
              {selected.kind === "post" ? (
                <>
                  <label className="site-field">
                    Article content
                    <textarea
                      rows={20}
                      dir={selected.locale === "ar" ? "rtl" : "ltr"}
                      value={selected.draft.body || ""}
                      onChange={(e) =>
                        update({
                          ...selected,
                          draft: { ...selected.draft, body: e.target.value },
                        })
                      }
                    />
                  </label>
                  <label className="site-field">
                    Category
                    <input
                      value={selected.draft.category || ""}
                      onChange={(e) =>
                        update({
                          ...selected,
                          draft: {
                            ...selected.draft,
                            category: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                  <p>
                    Posts remain drafts until the blog design and publication
                    workflow are approved.
                  </p>
                </>
              ) : (
                selected.draft.fields.map((f, i) => (
                  <label key={f.key} className="site-field">
                    {f.label}
                    <textarea
                      rows={Math.min(
                        5,
                        Math.max(2, Math.ceil(f.value.length / 90)),
                      )}
                      dir={selected.locale === "ar" ? "rtl" : "ltr"}
                      value={f.value}
                      onChange={(e) => {
                        const fields = [...selected.draft.fields];
                        fields[i] = { ...f, value: e.target.value };
                        update({
                          ...selected,
                          draft: { ...selected.draft, fields },
                        });
                      }}
                    />
                  </label>
                ))
              )}
            </>
          )}
          {section === "Leads" && ops && (
            <div className="site-leads">
              <div>
                {ops.leads.map((l) => (
                  <button key={l.id} onClick={() => setLead(l)}>
                    {l.name} · {l.kind}
                    <small>
                      {l.emailStatus} / {l.status}
                    </small>
                  </button>
                ))}
              </div>
              {lead && (
                <article>
                  <h2>{lead.name}</h2>
                  <p>{lead.email}</p>
                  <select
                    value={lead.status}
                    onChange={(e) => {
                      setLead({ ...lead, status: e.target.value });
                      operation({
                        action: "lead-status",
                        id: lead.id,
                        status: e.target.value,
                      });
                    }}
                  >
                    {["NEW", "CONTACTED", "QUALIFIED", "CLOSED"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <button
                    disabled={busy}
                    onClick={() => operation({ action: "retry", id: lead.id })}
                  >
                    Retry email notification
                  </button>
                  <dl>
                    {Object.entries(lead.payload).map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd
                          style={{
                            whiteSpace: "pre-wrap",
                            overflowWrap: "anywhere",
                          }}
                        >
                          {typeof v === "string"
                            ? v
                            : JSON.stringify(v, null, 2)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              )}
            </div>
          )}
          {section === "Integrations" && ops && (
            <>
              <p>
                Connection settings are held on the server. No fabricated
                metrics or sample traffic.
              </p>
              {ops.connections.map(([name, configured, scope]) => (
                <article className="site-integration" key={name}>
                  <h2>{name}</h2>
                  <p>{scope}</p>
                  <strong>
                    {configured
                      ? "Configuration present — connection verification required"
                      : "Not connected — credentials required"}
                  </strong>
                </article>
              ))}
              <IntegrationSettings onDirtyChange={setDirty} />
              <AnalyticsPanel />
              <p>
                GTM manages tags; it is not a reporting source. Competitor
                rankings need a selected search-data provider and account before
                activation.
              </p>
            </>
          )}
          {section === "AI Agent" && (
            <>
              <p>
                Prepare an instruction for a future AI editing agent. It cannot
                execute or publish changes yet. Every proposal records the page
                version for later review.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const f = new FormData(e.currentTarget);
                  operation({
                    action: "agent-proposal",
                    documentId: String(f.get("documentId")),
                    instruction: String(f.get("instruction")),
                  });
                }}
              >
                <select name="documentId">
                  {docs.map((d) => (
                    <option value={d.id} key={d.id}>
                      {d.title}
                    </option>
                  ))}
                </select>
                <textarea
                  name="instruction"
                  minLength={10}
                  required
                  placeholder="Describe the proposed change…"
                />
                <button disabled={busy}>Save future-agent instruction</button>
              </form>
              {ops?.proposals.map((p) => (
                <article key={p.id}>
                  <p>{p.instruction}</p>
                  <small>{p.status}</small>
                </article>
              ))}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
