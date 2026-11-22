import type { CSSProperties } from "react";

/** Co-located styles for RunFindingsPopover (timeline severity icons + findings popover). */
export const s = {
  /** Positioning context for the popover; mouse leaving it (trigger + popover) closes a hover-opened popover. */
  wrap: {
    position: "relative",
    display: "inline-flex",
    alignSelf: "flex-start",
  } satisfies CSSProperties,

  trigger: {
    display: "inline-flex",
    alignItems: "center",
    gap: 12,
    background: "none",
    border: "none",
    padding: "1px 0",
    font: "inherit",
    cursor: "pointer",
  } satisfies CSSProperties,

  /** One "icon + count" group, dotted-underlined in its severity colour (signals "hover me"). */
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

  /** Transparent bridge (paddingTop) so the pointer can travel from trigger to card without closing it. */
  popover: {
    position: "absolute",
    top: "100%",
    left: 0,
    paddingTop: 6,
    zIndex: 40,
  } satisfies CSSProperties,
} as const;
