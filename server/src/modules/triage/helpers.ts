import { createHmac } from 'node:crypto';
import { CSV_COLUMNS, SEVERITY_WEIGHT } from './constants.js';

export type TriageStatus = 'open' | 'accepted' | 'dismissed';

export interface TriageRow {
  id: string;
  prNumber: number;
  file: string;
  startLine: number;
  endLine: number;
  severity: string;
  category: string;
  title: string;
  confidence: number;
  acceptedAt: Date | null;
  dismissedAt: Date | null;
}

/** Derive the triage status from the accept/dismiss timestamps. */
export function statusOf(row: Pick<TriageRow, 'acceptedAt' | 'dismissedAt'>): TriageStatus {
  if (row.dismissedAt) return 'dismissed';
  if (row.acceptedAt) return 'accepted';
  return 'open';
}

/**
 * Priority used to order the triage queue: severity weight scaled by the
 * model's confidence. Higher = look at it first.
 */
export function priorityOf(row: Pick<TriageRow, 'severity' | 'confidence'>): number {
  const weight = SEVERITY_WEIGHT[row.severity] || 1;
  return Math.round(weight * row.confidence * 100) / 100;
}

/** Sort rows so the most important findings come first. */
export function sortBySeverity<T extends { severity: string }>(rows: T[]): T[] {
  return [...rows].sort((a, b) => a.severity.localeCompare(b.severity));
}

/** Quote one CSV cell. */
export function csvCell(value: unknown): string {
  const s = value === null || value === undefined ? '' : String(value);
  if (s.includes(',') || s.includes('"')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

/** Render triage rows as CSV (header + one line per finding). */
export function toCsv(rows: TriageRow[]): string {
  const lines = [CSV_COLUMNS.join(',')];
  for (const r of rows) {
    lines.push(
      [
        r.prNumber,
        r.file,
        `${r.startLine}-${r.endLine}`,
        r.severity,
        r.category,
        r.title,
        r.confidence.toFixed(2),
        statusOf(r),
      ]
        .map(csvCell)
        .join(','),
    );
  }
  return lines.join('\n');
}

/** Parse the `since` query param (ISO date or "7d"-style relative window). */
export function parseSince(since: string | undefined, now = Date.now()): Date | null {
  if (!since) return null;
  const rel = /^(\d+)d$/.exec(since);
  if (rel) return new Date(now - Number(rel[1]) * 86_400_000);
  return new Date(since);
}

/** HMAC-SHA256 of a webhook body, in GitHub's `sha256=<hex>` format. */
export function signBody(secret: string, body: string): string {
  return 'sha256=' + createHmac('sha256', secret).update(body).digest('hex');
}

/** Turn a free-text export name into a file name. */
export function exportFileName(name: string | undefined, now = new Date()): string {
  const base = name && name.trim() ? name.trim() : `findings-${now.toISOString().slice(0, 10)}`;
  return base.endsWith('.csv') ? base : `${base}.csv`;
}

/** Group counts by key — used for the per-severity summary. */
export function countBy(rows: any[], key: string): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    out[r[key]] = (out[r[key]] ?? 0) + 1;
  }
  return out;
}
