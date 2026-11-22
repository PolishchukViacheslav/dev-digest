/* FindingsPopoverCard — the card inside a findings popover: a sticky header and one
   short clickable card per finding (severity icon, title, category, file:line,
   confidence, rationale clamped to two lines), most severe first.
   Shared by the PR timeline (RunFindingsPopover) and the PR list FINDINGS cell
   (PRFindings); the callers own opening, closing and positioning. */
"use client";

import React from "react";
import { Icon, SEV, CategoryTag, ConfidenceNum } from "@devdigest/ui";
import type { FindingRecord } from "@devdigest/shared";
import { visibleFindings } from "../FindingsPanel/helpers";
import { lineLabel } from "../FindingCard/helpers";
import { s } from "./styles";

export function FindingsPopoverCard({
  header,
  findings,
  itemTitle,
  onSelect,
  placeholder,
}: {
  header: string;
  findings: FindingRecord[];
  /** Tooltip on each finding (what clicking it does). */
  itemTitle: string;
  onSelect?: (finding: FindingRecord) => void;
  /** Shown under the header instead of the list while there are no findings (loading / error). */
  placeholder?: React.ReactNode;
}) {
  const sorted = React.useMemo(() => visibleFindings(findings, false), [findings]);

  return (
    <div style={s.card}>
      <div style={s.header}>
        <Icon.FileText size={12} />
        {header}
      </div>
      {sorted.length === 0 && placeholder != null && <div style={s.placeholder}>{placeholder}</div>}
      {sorted.map((f) => {
        const sev = SEV[f.severity];
        const I = Icon[sev.icon];
        return (
          <button
            key={f.id}
            type="button"
            title={itemTitle}
            onClick={() => onSelect?.(f)}
            style={s.item}
          >
            <span style={s.itemHead}>
              <I size={14} style={{ color: sev.c, flexShrink: 0 }} />
              <span style={s.title}>{f.title}</span>
              <CategoryTag category={f.category} />
            </span>
            <span style={s.meta}>
              <span className="mono" style={s.location}>
                {f.file}:{lineLabel(f)}
              </span>
              <ConfidenceNum value={f.confidence} />
            </span>
            {f.rationale && <span style={s.rationale}>{f.rationale}</span>}
          </button>
        );
      })}
    </div>
  );
}
