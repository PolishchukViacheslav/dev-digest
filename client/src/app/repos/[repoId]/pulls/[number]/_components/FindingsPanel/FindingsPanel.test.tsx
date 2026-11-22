import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import type { FindingRecord, Severity } from "@devdigest/shared";
import messages from "../../../../../../../../messages/en/prReview.json";

vi.mock("../../../../../../../lib/hooks/reviews", () => ({
  useFindingAction: () => ({ mutate: vi.fn(), isPending: false }),
}));

import { FindingsPanel } from "./FindingsPanel";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const FINDINGS: FindingRecord[] = [
  {
    id: "f1",
    severity: "CRITICAL",
    category: "security",
    title: "Hardcoded secret",
    file: "src/config.ts",
    start_line: 11,
    end_line: 11,
    rationale: "A secret is committed.",
    suggestion: null,
    confidence: 0.95,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  },
];

function renderWithIntl(ui: React.ReactElement) {
  return render(
    <NextIntlClientProvider locale="en" messages={{ prReview: messages }}>
      {ui}
    </NextIntlClientProvider>,
  );
}

describe("FindingsPanel (smoke)", () => {
  it("renders the toolbar + a finding card", () => {
    renderWithIntl(<FindingsPanel findings={FINDINGS} prId="pr1" />);
    expect(screen.getByText("Hide low confidence")).toBeInTheDocument();
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });

  it("shows the empty state when nothing matches", () => {
    renderWithIntl(<FindingsPanel findings={[]} prId="pr1" />);
    expect(screen.getByText("No findings match")).toBeInTheDocument();
  });
});

function mk(id: string, severity: Severity, title: string, confidence = 0.9): FindingRecord {
  return { ...FINDINGS[0]!, id, severity, title, confidence };
}

// 2 CRITICAL · 3 WARNING (one low-confidence) · 1 SUGGESTION
const MIXED: FindingRecord[] = [
  mk("s1", "SUGGESTION", "Extract magic number"),
  mk("c1", "CRITICAL", "Hardcoded secret"),
  mk("w1", "WARNING", "Missing input validation"),
  mk("w2", "WARNING", "No rate limiting"),
  mk("w-low", "WARNING", "Possible race condition", 0.5),
  mk("c2", "CRITICAL", "SQL injection"),
];

const pill = (name: string) => screen.getByRole("button", { name });
const titles = () =>
  MIXED.map((f) => f.title).filter((title) => screen.queryByText(title) !== null);

describe("FindingsPanel — severity counters + filter", () => {
  it("shows a counter per severity level, none active", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);
    for (const name of ["2 Critical", "3 Warning", "1 Suggestion"]) {
      expect(pill(name)).toHaveAttribute("aria-pressed", "false");
    }
    expect(titles()).toHaveLength(6);
  });

  it("clicking a level keeps only that level's findings, without any request", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(() => {
      throw new Error("no network expected");
    });
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);

    fireEvent.click(pill("2 Critical"));

    expect(titles()).toEqual(["Hardcoded secret", "SQL injection"]);
    expect(pill("2 Critical")).toHaveAttribute("aria-pressed", "true");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("only one level is active: clicking another moves the filter", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);

    fireEvent.click(pill("2 Critical"));
    fireEvent.click(pill("3 Warning"));

    expect(pill("2 Critical")).toHaveAttribute("aria-pressed", "false");
    expect(pill("3 Warning")).toHaveAttribute("aria-pressed", "true");
    expect(titles()).toEqual(["Missing input validation", "No rate limiting", "Possible race condition"]);
  });

  it("clicking the active level again clears the filter", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);

    fireEvent.click(pill("1 Suggestion"));
    expect(titles()).toEqual(["Extract magic number"]);

    fireEvent.click(pill("1 Suggestion"));
    expect(titles()).toHaveLength(6);
    for (const name of ["2 Critical", "3 Warning", "1 Suggestion"]) {
      expect(pill(name)).toHaveAttribute("aria-pressed", "false");
    }
  });

  it("works together with Hide low confidence: counts and list pass both conditions", () => {
    renderWithIntl(<FindingsPanel findings={MIXED} prId="pr1" />);

    fireEvent.click(screen.getByRole("switch"));
    expect(pill("2 Warning")).toBeInTheDocument();

    fireEvent.click(pill("2 Warning"));
    expect(titles()).toEqual(["Missing input validation", "No rate limiting"]);
  });

  it("shows 0 for a level with no findings and disables it", () => {
    renderWithIntl(<FindingsPanel findings={MIXED.filter((f) => f.severity !== "SUGGESTION")} prId="pr1" />);
    expect(pill("0 Suggestion")).toBeDisabled();
    expect(pill("2 Critical")).toBeEnabled();
  });

  it("shows the empty state when the filters leave nothing, and the active level can still be cleared", () => {
    const findings = [mk("c1", "CRITICAL", "Hardcoded secret"), mk("s-low", "SUGGESTION", "Rename var", 0.4)];
    renderWithIntl(<FindingsPanel findings={findings} prId="pr1" />);

    fireEvent.click(pill("1 Suggestion"));
    fireEvent.click(screen.getByRole("switch"));

    expect(screen.getByText("No findings match")).toBeInTheDocument();
    expect(pill("0 Suggestion")).toBeEnabled();

    fireEvent.click(pill("0 Suggestion"));
    expect(screen.getByText("Hardcoded secret")).toBeInTheDocument();
  });
});
