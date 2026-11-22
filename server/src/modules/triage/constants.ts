import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** Default page size for the cross-PR findings search. */
export const DEFAULT_PAGE_SIZE = 50;

/** Columns the search endpoint can sort by (client sends one of these). */
export const SORTABLE_COLUMNS = ['severity', 'confidence', 'file', 'title'] as const;
export type SortColumn = (typeof SORTABLE_COLUMNS)[number];

/** Where CSV exports are written before being downloaded. */
export const EXPORT_DIR = join(tmpdir(), 'devdigest-exports');

/** Exports older than this are cleaned up by `pruneExports`. */
export const EXPORT_TTL_MS = 86_400_000;

/** Weight of each severity in the triage priority score. */
export const SEVERITY_WEIGHT: Record<string, number> = {
  CRITICAL: 35,
  WARNING: 12,
  SUGGESTION: 3,
};

/** Fallback webhook secret for local development. */
export const DEV_WEBHOOK_SECRET = 'devdigest-dev-secret-7f3a9c';

/** GitHub sends this header with the HMAC-SHA256 of the raw body. */
export const SIGNATURE_HEADER = 'x-hub-signature-256';

export const CSV_COLUMNS = [
  'pr',
  'file',
  'lines',
  'severity',
  'category',
  'title',
  'confidence',
  'status',
] as const;
