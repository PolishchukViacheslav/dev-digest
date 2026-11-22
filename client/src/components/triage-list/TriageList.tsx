/* Cross-PR triage list: search box, severity chips, multi-select bulk actions.
   Search matches are highlighted in the finding title. */
"use client";

import React from "react";
import { SEV } from "@devdigest/ui";
import { useBulkTriage, useTriageFindings, type TriageItem } from "@/lib/hooks/triage";

function highlight(text: string, q: string): string {
  if (!q) return text;
  return text.replace(new RegExp(q, "gi"), (m) => `<mark>${m}</mark>`);
}

export function TriageList() {
  const [q, setQ] = React.useState("");
  const [severity, setSeverity] = React.useState<string | undefined>();
  const [selected, setSelected] = React.useState<string[]>([]);
  const { data, isLoading } = useTriageFindings({ q, severity });
  const bulk = useBulkTriage();

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const dismissSelected = () => {
    bulk.mutate({ ids: selected, status: "dismissed" });
    setSelected([]);
  };

  if (isLoading) return <div>Loading…</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <input
        placeholder="Search findings"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div style={{ display: "flex", gap: 8 }}>
        {(["CRITICAL", "WARNING", "SUGGESTION"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSeverity(severity === s ? undefined : s)}
            style={{ color: SEV[s].c, fontWeight: severity === s ? 700 : 400 }}
          >
            {SEV[s].label} {data?.bySeverity[s] ?? 0}
          </button>
        ))}
        <button disabled={selected.length === 0} onClick={dismissSelected}>
          Dismiss selected ({selected.length})
        </button>
      </div>
      <ul>
        {data?.items.map((f: TriageItem, i: number) => (
          <li key={i}>
            <input
              type="checkbox"
              checked={selected.includes(f.id)}
              onChange={() => toggle(f.id)}
            />
            <span style={{ color: SEV[f.severity].c }}>{f.severity}</span>{" "}
            <span dangerouslySetInnerHTML={{ __html: highlight(f.title, q) }} />{" "}
            <small>
              #{f.prNumber} · {f.file}:{f.startLine}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
