"use client";
import type { HostingServerFeatures } from "@/schemas/hosting-server-features";

export function HostingServerFeaturesEditor({ value, onChange }: {
  value: HostingServerFeatures;
  onChange: (value: HostingServerFeatures) => void;
}) {
  return <details>
    <summary>Hosting server features · {value.slides.length}</summary>
    <label><input type="checkbox" checked={value.enabled} onChange={e => onChange({ ...value, enabled: e.target.checked })} /> Visible</label>
    {(["label", "heading", "cta", "category", "note", "logoNote"] as const).map(field => <label className="site-field" key={field}>
      {field}<textarea dir="auto" maxLength={field === "note" || field === "logoNote" ? 500 : field === "heading" ? 300 : 200} value={value[field]} onChange={e => onChange({ ...value, [field]: e.target.value })} />
    </label>)}
    {value.slides.map((slide, index) => <fieldset key={slide.id}>
      <legend>{index + 1}. {slide.id}</legend>
      {(["title", "body", "caption"] as const).map(field => <label className="site-field" key={field}>
        {field}<textarea dir="auto" maxLength={field === "body" ? 3000 : field === "caption" ? 500 : 200} value={slide[field]} onChange={e => onChange({ ...value, slides: value.slides.map((item, i) => i === index ? { ...item, [field]: e.target.value } : item) })} />
      </label>)}
    </fieldset>)}
  </details>;
}
