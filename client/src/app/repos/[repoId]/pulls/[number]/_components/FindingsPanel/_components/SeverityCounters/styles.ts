import type { CSSProperties } from "react";
import { SEV } from "@devdigest/ui";
import type { Severity } from "@devdigest/shared";

/** Co-located styles for SeverityCounters. Colours come from the shared SEV map. */
export const s = {
  row: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  } satisfies CSSProperties,

  /** One severity pill. The active pill is filled with its severity colour; while a
   *  filter is on, the other pills are dimmed. No hover styling on purpose — the
   *  filter state must be readable from a screenshot. */
  chip: (severity: Severity, active: boolean, anyActive: boolean, empty: boolean): CSSProperties => {
    const c = SEV[severity].c;
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "3px 12px",
      borderRadius: 999,
      border: `1px solid ${c}`,
      background: active ? c : "transparent",
      color: active ? "var(--bg-primary)" : c,
      fontSize: 12,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      whiteSpace: "nowrap",
      cursor: empty ? "not-allowed" : "pointer",
      opacity: empty ? 0.4 : anyActive && !active ? 0.5 : 1,
      transition: "background .12s, color .12s, opacity .12s",
    };
  },
} as const;
