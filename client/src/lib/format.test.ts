import { describe, it, expect } from "vitest";
import { formatCost, formatTokens, NO_VALUE } from "./format";

describe("formatCost", () => {
  it("renders 3 decimals", () => {
    expect(formatCost(0.014)).toBe("$0.014");
    expect(formatCost(0.012)).toBe("$0.012");
    expect(formatCost(1.5)).toBe("$1.500");
  });

  it("shows <$0.001 for positive micro costs, never $0.000", () => {
    expect(formatCost(0.0002)).toBe("<$0.001");
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
