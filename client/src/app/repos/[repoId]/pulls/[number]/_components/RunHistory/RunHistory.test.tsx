/**
 * RunHistory — the badge must reflect the review OUTCOME, not the run lifecycle.
 * Regression guard for the "green ✓ done on a run that found 5 blockers" bug:
 * a settled run is colored/labelled by its denormalized blocker/finding counts,
 * and shows the review score ring.
 */
import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord, RunSummary, Severity } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";
import { RunHistory } from "./RunHistory";

afterEach(cleanup);

function run(o: Partial<RunSummary>): RunSummary {
  return {
    run_id: "run-1",
    agent_id: "a1",
    agent_name: "Security Reviewer",
    provider: "openrouter",
    model: "deepseek/deepseek-v4-flash",
    status: "done",
    error: null,
    duration_ms: 1000,
    tokens_in: 100,
    tokens_out: 50,
    cost_usd: null,
    findings_count: 0,
    grounding: "0/0 passed",
    ran_at: "2026-06-11T18:44:34.000Z",
    score: null,
    blockers: null,
    ...o,
  };
}

function renderRuns(runs: RunSummary[]) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <RunHistory runs={runs} onOpenTrace={() => {}} />
    </NextIntlClientProvider>,
  );
}

describe("RunHistory — outcome badge", () => {
  it("a done run WITH blockers reads 'rejected' (never green 'done') + shows the score ring", () => {
    renderRuns([run({ status: "done", findings_count: 5, blockers: 5, score: 0 })]);
    expect(screen.getByText("rejected")).toBeInTheDocument();
    expect(screen.queryByText("done")).not.toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument(); // CircularScore renders the number
    expect(screen.getByText(/5 blockers/)).toBeInTheDocument();
  });

  it("a clean done run reads 'approved'", () => {
    renderRuns([run({ status: "done", findings_count: 0, blockers: 0, score: 95 })]);
    expect(screen.getByText("approved")).toBeInTheDocument();
    expect(screen.getByText("95")).toBeInTheDocument();
  });

  it("a done run with non-blocking findings reads 'reviewed'", () => {
    renderRuns([run({ status: "done", findings_count: 3, blockers: 0, score: 72 })]);
    expect(screen.getByText("reviewed")).toBeInTheDocument();
    expect(screen.queryByText(/blockers/)).not.toBeInTheDocument();
  });

  it("a failed run reads 'error'", () => {
    renderRuns([run({ status: "failed", error: "boom", score: null, blockers: null })]);
    expect(screen.getByText("error")).toBeInTheDocument();
  });

  it("a running run reads 'running'", () => {
    renderRuns([run({ status: "running", score: null, blockers: null })]);
    expect(screen.getByText("running")).toBeInTheDocument();
  });
});

function finding(id: string, severity: Severity, title: string): FindingRecord {
  return {
    id,
    severity,
    category: "security",
    title,
    file: "lib/analytics.router.ts",
    start_line: 19,
    end_line: 19,
    rationale: `Rationale for ${title}.`,
    suggestion: null,
    confidence: 0.95,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  };
}

// 1 CRITICAL · 2 WARNING · 0 SUGGESTION
const RUN_FINDINGS = [
  finding("w1", "WARNING", "Date-range boundary is inclusive"),
  finding("c1", "CRITICAL", "Analytics endpoints are unauthenticated"),
  finding("w2", "WARNING", "No tests for AnalyticsService"),
];

function renderWithFindings(onGoToReview = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      <RunHistory
        runs={[run({ status: "done", findings_count: 3, blockers: 1, score: 17 })]}
        onOpenTrace={() => {}}
        onGoToReview={onGoToReview}
        findingsByRun={{ "run-1": RUN_FINDINGS }}
      />
    </NextIntlClientProvider>,
  );
  return onGoToReview;
}

const trigger = () => screen.getByRole("button", { name: /1 Critical, 2 Warning/ });

describe("RunHistory — severity icons + findings popover", () => {
  it("shows a count per severity that has findings (zero levels hidden) instead of the text", () => {
    renderWithFindings();
    expect(trigger()).toHaveTextContent("12");
    expect(trigger()).not.toHaveAccessibleName(/Suggestion/);
    expect(screen.queryByText(/3 finding\(s\)/)).not.toBeInTheDocument();
  });

  it("hover opens the popover with a short card per finding, critical first", () => {
    renderWithFindings();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.mouseEnter(trigger());

    const dialog = screen.getByRole("dialog", { name: "3 findings in this run" });
    const items = dialog.querySelectorAll("button");
    expect(items[0]).toHaveTextContent("Analytics endpoints are unauthenticated");
    expect(dialog).toHaveTextContent("lib/analytics.router.ts:19");
    expect(dialog).toHaveTextContent("95% conf");
    expect(dialog).toHaveTextContent("Rationale for No tests for AnalyticsService.");
  });

  it("click pins it open; Escape closes it", () => {
    renderWithFindings();
    fireEvent.click(trigger());
    fireEvent.mouseLeave(trigger().parentElement!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("clicking a finding jumps to that run in Review runs and closes the popover", () => {
    const onGoToReview = renderWithFindings();
    fireEvent.click(trigger());

    fireEvent.click(screen.getByText("No tests for AnalyticsService"));

    expect(onGoToReview).toHaveBeenCalledWith("run-1");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("falls back to the plain text when the run's findings aren't loaded", () => {
    renderRuns([run({ status: "done", findings_count: 3, blockers: 0, score: 72 })]);
    expect(screen.getByText(/3 finding\(s\)/)).toBeInTheDocument();
  });
});
