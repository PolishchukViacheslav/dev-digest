import { CARD_MAX_HEIGHT, CARD_WIDTH } from "../../[number]/_components/FindingsPopoverCard";
import { POPOVER_GAP, VIEWPORT_MARGIN } from "./constants";

export interface PopoverPosition {
  left: number;
  /** Set when the card opens below the trigger. */
  top?: number;
  /** Set when the card opens above the trigger (distance from the viewport bottom). */
  bottom?: number;
}

/**
 * Where to put the fixed-position findings card for a trigger at `anchor`. It opens
 * below the trigger, or above it when there isn't room for a full card below and
 * there's more room above. It's left-aligned with the trigger and kept inside the
 * viewport horizontally.
 */
export function popoverPosition(
  anchor: { left: number; top: number; bottom: number },
  viewport: { width: number; height: number },
): PopoverPosition {
  const width = Math.min(CARD_WIDTH, viewport.width * 0.85);
  const left = Math.max(
    VIEWPORT_MARGIN,
    Math.min(anchor.left, viewport.width - width - VIEWPORT_MARGIN),
  );
  const spaceBelow = viewport.height - anchor.bottom;
  const spaceAbove = anchor.top;
  const fitsBelow = spaceBelow >= CARD_MAX_HEIGHT + POPOVER_GAP + VIEWPORT_MARGIN;
  if (fitsBelow || spaceBelow >= spaceAbove) return { left, top: anchor.bottom + POPOVER_GAP };
  return { left, bottom: viewport.height - anchor.top + POPOVER_GAP };
}
