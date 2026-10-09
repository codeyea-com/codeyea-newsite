"use client";
import { useState, useEffect } from "react";
export function DocumentHistory({
  id,
  version,
  onRestore,
}: {
  id: string;
  version: number;
  onRestore: () => void;
}) {
  const [rows, setRows] = useState<
      { id: string; version: number; createdAt: string }[]
    >([]),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    fetch("/api/site-documents/revisions?id=" + id)
      .then(async (r) => {
        if (!r.ok) throw Error("Unable to load history");
        return r.json();
      })
      .then((d) => {
        if (active) setRows(d.revisions);
      })
      .catch((e) => {
        if (active) setMessage(String(e));
      });
    return () => {
      active = false;
    };
  }, [id, version]);
  async function restore(revisionId: string) {
    if (
      !confirm(
        "Restore this version as a new private draft? Unsaved edits will be discarded.",
      )
    )
      return;
    setBusy(true);
    setMessage("");
    try {
      const r = await fetch("/api/site-documents/revisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, version, revisionId }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error);
      onRestore();
    } catch (e) {
      setMessage(String(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <details className="site-history">
      <summary>Draft version history ({rows.length})</summary>
      <p role="status">{message}</p>
      {rows.map((row) => (
        <p key={row.id}>
          Version {row.version} · {new Date(row.createdAt).toLocaleString()}{" "}
          <button disabled={busy} onClick={() => restore(row.id)}>
            Restore draft
          </button>
        </p>
      ))}
      {!rows.length && (
        <p>Previous versions will appear after saving changes.</p>
      )}
    </details>
  );
}
