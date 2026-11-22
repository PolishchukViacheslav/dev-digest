import { describe, it, expect } from "vitest";
import { formatCost, formatTokens, NO_VALUE } from "./format";

describe("formatCost", () => {
  it("renders 5 decimals", () => {
    expect(formatCost(0.014)).toBe("$0.01400");
    expect(formatCost(0.00042)).toBe("$0.00042");
    expect(formatCost(0.000123456)).toBe("$0.00012");
    expect(formatCost(1.5)).toBe("$1.50000");
    expect(formatCost(0)).toBe("$0.00000");
  });

  it("shows <$0.00001 for positive costs below the smallest step, never $0.00000", () => {
    expect(formatCost(0.000004)).toBe("<$0.00001");
  });

  it("shows the placeholder for null / undefined / non-finite, never $0.00", () => {
    expect(formatCost(null)).toBe(NO_VALUE);
    expect(formatCost(undefined)).toBe(NO_VALUE);
    expect(formatCost(Number.NaN)).toBe(NO_VALUE);
  });
});

describe("formatTokens", () => {
  it("abbreviates thousands with one decimal", () => {
    expect(formatTokens(8200, 1300)).toBe("8.2K→1.3K");
    expect(formatTokens(12000, 1500)).toBe("12.0K→1.5K");
  });

  it("keeps small counts exact instead of 0k", () => {
    expect(formatTokens(100, 50)).toBe("100→50");
    expect(formatTokens(420, 35)).toBe("420→35");
    expect(formatTokens(0, 0)).toBe("0→0");
  });

  it("shows the placeholder when either side is missing", () => {
    expect(formatTokens(null, 10)).toBe(NO_VALUE);
    expect(formatTokens(10, undefined)).toBe(NO_VALUE);
  });
});
