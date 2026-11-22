import { describe, it, expect } from "vitest";
import type { FindingRecord, Severity } from "@devdigest/shared";
import { confidentFindings, countBySeverity, visibleFindings } from "./helpers";

function mk(id: string, severity: Severity, confidence = 0.9): FindingRecord {
  return {
    id,
    severity,
    category: "bug",
    title: id,
    file: "src/a.ts",
    start_line: 1,
    end_line: 1,
    rationale: "",
    suggestion: null,
    confidence,
    kind: "finding",
    trifecta_components: null,
    evidence: null,
    review_id: "r1",
    accepted_at: null,
    dismissed_at: null,
  };
}

const ids = (fs: FindingRecord[]) => fs.map((f) => f.id);

const FINDINGS = [
  mk("s1", "SUGGESTION"),
  mk("w1", "WARNING"),
  mk("c1", "CRITICAL"),
  mk("w-low", "WARNING", 0.5),
  mk("c2", "CRITICAL"),
];

describe("countBySeverity", () => {
  it("counts every level", () => {
    expect(countBySeverity(FINDINGS)).toEqual({ CRITICAL: 2, WARNING: 2, SUGGESTION: 1 });
  });

  it("returns 0 for levels with no findings", () => {
    expect(countBySeverity([mk("w1", "WARNING")])).toEqual({ CRITICAL: 0, WARNING: 1, SUGGESTION: 0 });
    expect(countBySeverity([])).toEqual({ CRITICAL: 0, WARNING: 0, SUGGESTION: 0 });
  });
});

describe("confidentFindings", () => {
  it("drops findings under the threshold only when hideLow is on", () => {
    expect(ids(confidentFindings(FINDINGS, false))).toHaveLength(5);
    expect(ids(confidentFindings(FINDINGS, true))).not.toContain("w-low");
  });
});

describe("visibleFindings", () => {
  it("sorts by severity when no severity filter is set", () => {
    expect(ids(visibleFindings(FINDINGS, false))).toEqual(["c1", "c2", "w1", "w-low", "s1"]);
    expect(ids(visibleFindings(FINDINGS, false, null))).toEqual(["c1", "c2", "w1", "w-low", "s1"]);
  });

  it("keeps only the selected severity", () => {
    expect(ids(visibleFindings(FINDINGS, false, "WARNING"))).toEqual(["w1", "w-low"]);
  });

  it("applies hideLow and the severity filter together", () => {
    expect(ids(visibleFindings(FINDINGS, true, "WARNING"))).toEqual(["w1"]);
  });
});
