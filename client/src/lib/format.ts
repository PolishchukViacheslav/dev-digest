/**
 * Shared number formatting for run cost + tokens (PR list, timeline, run drawer).
 * Pure functions — no i18n: the "—" placeholder is the only text and is universal.
 */

/** Placeholder for "no data" (failed/cancelled run, legacy row, unknown price). */
export const NO_VALUE = "—";

/** Decimal places in a USD cost. 5, so cheap-model runs (fractions of a cent) stay readable. */
export const COST_DECIMALS = 5;

/**
 * USD cost with COST_DECIMALS decimals: `$0.00042`. Values above zero but below
 * the smallest shown step show `<$0.00001` instead of a misleading `$0.00000`.
 * Null/undefined → `—`.
 */
export function formatCost(usd: number | null | undefined): string {
  if (usd == null || !Number.isFinite(usd)) return NO_VALUE;
  const step = 10 ** -COST_DECIMALS;
  if (usd > 0 && usd < step) return `<$${step.toFixed(COST_DECIMALS)}`;
  return `$${usd.toFixed(COST_DECIMALS)}`;
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
