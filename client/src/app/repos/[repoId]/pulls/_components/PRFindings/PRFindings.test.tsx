import { describe, it, expect, afterEach, beforeEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, act } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord, ReviewRecord, Severity } from "@devdigest/shared";
import type { PrMeta } from "@/lib/types";
import messages from "../../../../../../../messages/en/prReview.json";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, replace: vi.fn() }) }));

const usePrReviews = vi.fn();
vi.mock("@/lib/hooks", () => ({
  usePrReviews: (prId: string | null | undefined) => usePrReviews(prId),
}));

import { PRFindings } from "./PRFindings";
import { HOVER_CLOSE_DELAY_MS, HOVER_OPEN_DELAY_MS } from "./constants";

function pr(o: Partial<PrMeta> = {}): PrMeta {
  return {
    id: "pr-1",
    number: 12,
    title: "Analytics dashboard",
    author: "dev",
    branch: "feature/x",
    base: "main",
    head_sha: "abc",
    additions: 700,
    deletions: 116,
    files_count: 9,
    status: "reviewed",
    score: null,
    findings_critical: null,
    findings_warning: null,
    findings_suggestion: null,
    ...o,
  };
}

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
    review_id: "rv-new",
    accepted_at: null,
    dismissed_at: null,
  };
}

function review(id: string, findings: FindingRecord[]): ReviewRecord {
  return {
    id,
    pr_id: "pr-1",
    agent_id: "a1",
    run_id: `run-${id}`,
    kind: "review",
    verdict: "request_changes",
    summary: null,
    score: 17,
    model: "m",
    created_at: "2026-11-22T10:00:00.000Z",
    findings,
  };
}

// Newest first, as GET /pulls/:id/reviews returns them: only the first review counts.
const REVIEWS: ReviewRecord[] = [
  review("rv-new", [
    finding("w1", "WARNING", "Missing await on bulk update"),
    finding("c1", "CRITICAL", "SQL injection via sort param"),
    finding("w2", "WARNING", "Unbounded page size"),
  ]),
  review("rv-old", [finding("old", "CRITICAL", "Finding from an older review")]),
];

const REVIEWED = pr({ score: 17, findings_critical: 1, findings_warning: 2, findings_suggestion: 0 });

function renderCell(p: PrMeta, onRowClick = vi.fn()) {
  render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {/* stands in for PRRow, which navigates to the PR on click */}
      <div onClick={onRowClick}>
        <PRFindings pr={p} repoId="repo-1" />
      </div>
    </NextIntlClientProvider>,
  );
  return { onRowClick };
}

const trigger = () => screen.getByRole("button", { name: /1 Critical, 2 Warning/ });
const wait = (ms: number) => act(() => vi.advanceTimersByTime(ms));
const hoverOpen = () => {
  fireEvent.mouseEnter(trigger());
  wait(HOVER_OPEN_DELAY_MS);
};

beforeEach(() => {
  vi.useFakeTimers();
  push.mockReset();
  usePrReviews.mockReset();
  usePrReviews.mockImplementation((prId) =>
    prId ? { data: REVIEWS, isError: false } : { data: undefined, isError: false },
  );
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("PRFindings — counts", () => {
  it("shows an icon + count only for the severities the latest review found", () => {
    renderCell(pr({ score: 17, findings_critical: 1, findings_warning: 4, findings_suggestion: 0 }));
    const btn = screen.getByRole("button", { name: /^1 Critical, 4 Warning/ });
    expect(btn).toHaveTextContent("14");
    expect(btn.querySelectorAll("svg")).toHaveLength(2);
  });

  it("lists all three levels in CRITICAL → WARNING → SUGGESTION order", () => {
    renderCell(pr({ score: 40, findings_critical: 1, findings_warning: 2, findings_suggestion: 3 }));
    expect(
      screen.getByRole("button", { name: /^1 Critical, 2 Warning, 3 Suggestion/ }),
    ).toHaveTextContent("123");
  });

  it("shows a dash for a PR that has never been reviewed (null counts)", () => {
    renderCell(pr());
    expect(screen.getByText("—")).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows a dash when the review found nothing", () => {
    renderCell(pr({ score: 100, findings_critical: 0, findings_warning: 0, findings_suggestion: 0 }));
    expect(screen.getByText("—")).toBeInTheDocument();
  });
});

describe("PRFindings — hover popover", () => {
  it("does not load anything until hovered", () => {
    renderCell(REVIEWED);
    expect(usePrReviews).not.toHaveBeenCalledWith("pr-1");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("hover opens the latest review's findings, most severe first", () => {
    renderCell(REVIEWED);
    hoverOpen();
    const dialog = screen.getByRole("dialog", { name: "3 findings in the latest review" });
    expect(usePrReviews).toHaveBeenCalledWith("pr-1");
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    const titles = [...dialog.querySelectorAll("button")].map((b) => b.textContent);
    expect(titles[0]).toContain("SQL injection via sort param");
    expect(dialog).not.toHaveTextContent("Finding from an older review");
  });

  it("a pointer passing over the cell (shorter than the open delay) opens nothing", () => {
    renderCell(REVIEWED);
    fireEvent.mouseEnter(trigger());
    wait(HOVER_OPEN_DELAY_MS - 50);
    fireEvent.mouseLeave(trigger());
    wait(HOVER_OPEN_DELAY_MS + HOVER_CLOSE_DELAY_MS);
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(usePrReviews).not.toHaveBeenCalledWith("pr-1");
  });

  it("stays open while the pointer moves from the icons onto the card, closes after leaving it", () => {
    renderCell(REVIEWED);
    hoverOpen();
    fireEvent.mouseLeave(trigger());
    fireEvent.mouseEnter(screen.getByRole("dialog"));
    wait(HOVER_CLOSE_DELAY_MS * 2);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    fireEvent.mouseLeave(screen.getByRole("dialog"));
    wait(HOVER_CLOSE_DELAY_MS);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("shows a loading line while the reviews are being fetched", () => {
    usePrReviews.mockImplementation(() => ({ data: undefined, isError: false }));
    renderCell(REVIEWED);
    hoverOpen();
    expect(screen.getByRole("dialog", { name: "3 findings in the latest review" })).toHaveTextContent(
      "Loading findings…",
    );
  });

  it("clicking a finding opens the PR on its Findings tab without triggering the row click", () => {
    const { onRowClick } = renderCell(REVIEWED);
    hoverOpen();
    fireEvent.click(screen.getByText("SQL injection via sort param"));
    expect(push).toHaveBeenCalledWith("/repos/repo-1/pulls/12?tab=findings");
    expect(onRowClick).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("Escape closes the popover", () => {
    renderCell(REVIEWED);
    hoverOpen();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});
