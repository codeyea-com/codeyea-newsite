"use client";
import { useState } from "react";
export function ArabicInitializeButton({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  return (
    <div>
      <button
        className="button secondary"
        type="button"
        disabled={disabled || busy}
        onClick={async () => {
          setBusy(true);
          setMessage("");
          try {
            const response = await fetch("/api/cms/arabic", { method: "POST" });
            const data = await response.json();
            if (!response.ok)
              throw Error(data.error ?? "Could not initialize Arabic drafts");
            setMessage(
              `${data.created.length} Arabic drafts created; ${data.existing.length} existing drafts preserved. None published.`,
            );
            location.reload();
          } catch (error) {
            setMessage(String(error));
          } finally {
            setBusy(false);
          }
        }}
      >
        {busy ? "Preparing Arabic drafts…" : "Create Arabic page drafts"}
      </button>
      <small>
        {message ||
          "Creates missing Arabic counterparts privately. Existing edits are preserved."}
      </small>
    </div>
  );
}
