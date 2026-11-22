import type { CSSProperties } from "react";
import { CARD_MAX_HEIGHT, CARD_WIDTH } from "./constants";

/** Co-located styles for FindingsPopoverCard (the card inside a findings popover). */
export const s = {
  card: {
    width: `min(${CARD_WIDTH}px, 85vw)`,
    maxHeight: CARD_MAX_HEIGHT,
    overflowY: "auto",
    borderRadius: 10,
    border: "1px solid var(--border-strong)",
    background: "var(--bg-elevated)",
    boxShadow: "0 12px 32px rgba(0,0,0,.45)",
    cursor: "default",
  } satisfies CSSProperties,

  header: {
    position: "sticky",
    top: 0,
    display: "flex",
    alignItems: "center",
    gap: 6,
    padding: "10px 14px",
    borderBottom: "1px solid var(--border)",
    background: "var(--bg-elevated)",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: "var(--text-muted)",
  } satisfies CSSProperties,

  placeholder: {
    padding: "14px",
    fontSize: 12.5,
    color: "var(--text-muted)",
  } satisfies CSSProperties,

  item: {
    display: "flex",
    flexDirection: "column",
    gap: 5,
    width: "100%",
    padding: "11px 14px",
    border: "none",
    borderBottom: "1px solid var(--border)",
    background: "transparent",
    textAlign: "left",
    font: "inherit",
    cursor: "pointer",
  } satisfies CSSProperties,

  itemHead: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    minWidth: 0,
  } satisfies CSSProperties,

  title: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    fontWeight: 600,
    color: "var(--text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  } satisfies CSSProperties,

  meta: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  } satisfies CSSProperties,

  location: {
    fontSize: 12,
    color: "var(--accent-text)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "100%",
  } satisfies CSSProperties,

  /** Short description: the rationale clamped to two lines. */
  rationale: {
    fontSize: 12.5,
    lineHeight: 1.45,
    color: "var(--text-secondary)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  } satisfies CSSProperties,
} as const;
