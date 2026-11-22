import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { RunCostBadge } from "./RunCostBadge";

afterEach(cleanup);

describe("RunCostBadge", () => {
  it("compact: shows cost only", () => {
    render(<RunCostBadge costUsd={0.012} variant="compact" />);
    expect(screen.getByText("$0.01200")).toBeInTheDocument();
  });

  it("detailed: shows cost and tokens in→out", () => {
    render(<RunCostBadge costUsd={0.014} tokensIn={8200} tokensOut={1300} variant="detailed" />);
    expect(screen.getByText("$0.01400")).toBeInTheDocument();
    expect(screen.getByText("8.2K→1.3K")).toBeInTheDocument();
  });

  it("renders the placeholder (never $0.00) when cost is null", () => {
    render(<RunCostBadge costUsd={null} variant="compact" />);
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByText("$0.00")).toBeNull();
  });

  it("detailed with null cost and tokens shows two placeholders", () => {
    render(<RunCostBadge costUsd={null} tokensIn={null} tokensOut={null} variant="detailed" />);
    expect(screen.getAllByText("—")).toHaveLength(2);
  });
});
