import type { FindingRecord, Severity } from "@devdigest/shared";
import { LOW_CONFIDENCE_THRESHOLD, SEVERITY_LEVELS, SEVERITY_ORDER } from "./constants";

export type SeverityCounts = Record<Severity, number>;

/** Drop low-confidence findings when `hideLow` is on; otherwise return the list as is. */
export function confidentFindings(findings: FindingRecord[], hideLow: boolean): FindingRecord[] {
  return hideLow ? findings.filter((f) => f.confidence >= LOW_CONFIDENCE_THRESHOLD) : findings;
}

/** Number of findings per severity level; every level is present (0 when absent). */
export function countBySeverity(findings: FindingRecord[]): SeverityCounts {
  const counts = Object.fromEntries(SEVERITY_LEVELS.map((sev) => [sev, 0])) as SeverityCounts;
  for (const f of findings) {
    if (f.severity in counts) counts[f.severity] += 1;
  }
  return counts;
}

/** Optionally drop low-confidence findings, keep only one severity, and sort by severity. */
export function visibleFindings(
  findings: FindingRecord[],
  hideLow: boolean,
  severity: Severity | null = null,
): FindingRecord[] {
  let shown = confidentFindings(findings, hideLow);
  if (severity) shown = shown.filter((f) => f.severity === severity);
  return [...shown].sort(
    (a, b) => (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9),
  );
}
