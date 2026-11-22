import type { CSSProperties } from "react";

export const s = {
  cost: {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: 12,
    color: "var(--text-primary)",
    fontVariantNumeric: "tabular-nums",
  } satisfies CSSProperties,
  /** Placeholder for runs without cost data — muted so it never reads as a real $0. */
  empty: {
    fontSize: 12,
    color: "var(--text-muted)",
  } satisfies CSSProperties,
  detailed: {
    fontFamily: "var(--font-mono, monospace)",
    fontSize: 12,
    whiteSpace: "nowrap",
  } satisfies CSSProperties,
  sep: { color: "var(--text-muted)" } satisfies CSSProperties,
  tokens: { color: "var(--text-muted)" } satisfies CSSProperties,
};
