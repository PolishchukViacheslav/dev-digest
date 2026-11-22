import { describe, it, expect } from "vitest";
import { popoverPosition } from "./helpers";
import { POPOVER_GAP, VIEWPORT_MARGIN } from "./constants";
import { CARD_WIDTH } from "../../[number]/_components/FindingsPopoverCard";

const VIEWPORT = { width: 1500, height: 900 };

describe("popoverPosition", () => {
  it("opens below the trigger, left-aligned with it", () => {
    expect(popoverPosition({ left: 1000, top: 300, bottom: 320 }, VIEWPORT)).toEqual({
      left: 1000,
      top: 320 + POPOVER_GAP,
    });
  });

  it("opens above when a full card doesn't fit below and there's more room above", () => {
    expect(popoverPosition({ left: 1000, top: 760, bottom: 780 }, VIEWPORT)).toEqual({
      left: 1000,
      bottom: 900 - 760 + POPOVER_GAP,
    });
  });

  it("keeps the card inside the right edge of the viewport", () => {
    const { left } = popoverPosition({ left: 1400, top: 300, bottom: 320 }, VIEWPORT);
    expect(left).toBe(1500 - CARD_WIDTH - VIEWPORT_MARGIN);
  });

  it("never starts left of the viewport margin", () => {
    const { left } = popoverPosition({ left: 4, top: 300, bottom: 320 }, VIEWPORT);
    expect(left).toBe(VIEWPORT_MARGIN);
  });

  it("narrow viewport: the card shrinks to 85vw and still fits on the right", () => {
    const { left } = popoverPosition({ left: 200, top: 300, bottom: 320 }, { width: 400, height: 900 });
    expect(left).toBe(400 - 400 * 0.85 - VIEWPORT_MARGIN);
  });
});
