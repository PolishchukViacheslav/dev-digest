import type { CSSProperties } from "react";
import type { PopoverPosition } from "./helpers";

/** Co-located styles for PRFindings (PR list FINDINGS cell + its findings popover). */
export const s = {
  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    background: "none",
    border: "none",
    padding: "1px 0",
    font: "inherit",
    cursor: "pointer",
  } satisfies CSSProperties,

  /** One "icon + count" group, dotted-underlined in its severity colour (signals "hover me"),
   *  same sizing as the timeline row. */
  count: (color: string): CSSProperties => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12.5,
    fontWeight: 600,
    color,
    borderBottom: `1px dotted ${color}`,
    paddingBottom: 1,
  }),

  /** Fixed-position wrapper portalled to <body> (escapes the table card's overflow: hidden). */
  popover: (pos: PopoverPosition): CSSProperties => ({
    position: "fixed",
    left: pos.left,
    ...(pos.top !== undefined ? { top: pos.top } : {}),
    ...(pos.bottom !== undefined ? { bottom: pos.bottom } : {}),
    zIndex: 60,
  }),

  muted: { color: "var(--text-muted)" } satisfies CSSProperties,
} as const;
