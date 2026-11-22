/**
 * Shared number formatting for run cost + tokens (PR list, timeline, run drawer).
 * Pure functions — no i18n: the "—" placeholder is the only text and is universal.
 */

/** Placeholder for "no data" (failed/cancelled run, legacy row, unknown price). */
export const NO_VALUE = "—";

/**
 * USD cost with 3 decimals: `$0.014`. Values above zero but below a tenth of a
 * cent show `<$0.001` instead of a misleading `$0.000`. Null/undefined → `—`.
 */
export function formatCost(usd: number | null | undefined): string {
  if (usd == null || !Number.isFinite(usd)) return NO_VALUE;
  if (usd > 0 && usd < 0.001) return "<$0.001";
  return `$${usd.toFixed(3)}`;
}

/** One token count: integers under 1000 (`512`), otherwise `8.2K`. */
function formatTokenCount(n: number): string {
  if (n < 1000) return String(Math.round(n));
  return `${(n / 1000).toFixed(1)}K`;
}

/**
 * Token in→out summary, e.g. `8.2K→1.3K`. Small counts stay exact (`420→35`)
 * instead of rounding to `0k`. Either side missing → `—`.
 */
export function formatTokens(tokensIn: number | null | undefined, tokensOut: number | null | undefined): string {
  if (tokensIn == null || tokensOut == null) return NO_VALUE;
  return `${formatTokenCount(tokensIn)}→${formatTokenCount(tokensOut)}`;
}
