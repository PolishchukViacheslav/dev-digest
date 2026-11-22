// Type-only on purpose: a runtime import of @devdigest/shared makes Next's webpack follow
// the barrel's `./contracts/*.js` specifiers, which it can't resolve to .ts (500 on every page).
import type { FindingActionKind, Severity } from "@devdigest/shared";

/** Severity levels shown as counters, in display order (mirrors the `Severity` contract). */
export const SEVERITY_LEVELS = ["CRITICAL", "WARNING", "SUGGESTION"] as const satisfies readonly Severity[];

// Compile-time guard: fails typecheck if the contract gains a level that is missing above.
const _allLevelsListed: [Exclude<Severity, (typeof SEVERITY_LEVELS)[number]>] extends [never] ? true : false = true;
void _allLevelsListed;

/** Sort weight per severity (lower = shown first). */
export const SEVERITY_ORDER: Record<string, number> = {
  CRITICAL: 0,
  WARNING: 1,
  SUGGESTION: 2,
  INFO: 3,
};

/** Confidence below this is hidden when "hide low confidence" is on. */
export const LOW_CONFIDENCE_THRESHOLD = 0.65;

/** Keyboard shortcut → finding action. */
export const KEY_TO_ACTION: Record<string, FindingActionKind> = {
  a: "accept",
  d: "dismiss",
};
