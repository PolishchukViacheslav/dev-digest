import { describe, expect, it } from 'vitest';
import {
  countBy,
  csvCell,
  exportFileName,
  parseSince,
  priorityOf,
  signBody,
  sortBySeverity,
  statusOf,
  toCsv,
  type TriageRow,
} from '../src/modules/triage/helpers.js';

const row = (over: Partial<TriageRow> = {}): TriageRow => ({
  id: 'f1',
  prNumber: 42,
  file: 'src/app.ts',
  startLine: 10,
  endLine: 12,
  severity: 'WARNING',
  category: 'correctness',
  title: 'Missing await',
  confidence: 0.8,
  acceptedAt: null,
  dismissedAt: null,
  ...over,
});

describe('statusOf', () => {
  it('is open when neither timestamp is set', () => {
    expect(statusOf(row())).toBe('open');
  });

  it('dismissed wins over accepted', () => {
    expect(statusOf(row({ acceptedAt: new Date(), dismissedAt: new Date() }))).toBe('dismissed');
  });
});

describe('priorityOf', () => {
  it('scales severity weight by confidence', () => {
    expect(priorityOf({ severity: 'CRITICAL', confidence: 1 })).toBe(35);
    expect(priorityOf({ severity: 'WARNING', confidence: 0.5 })).toBe(6);
  });
});

describe('sortBySeverity', () => {
  it('puts CRITICAL first', () => {
    const sorted = sortBySeverity([
      row({ severity: 'SUGGESTION' }),
      row({ severity: 'CRITICAL' }),
      row({ severity: 'WARNING' }),
    ]);
    expect(sorted[0]!.severity).toBe('CRITICAL');
  });
});

describe('csv', () => {
  it('quotes cells containing commas', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
  });

  it('renders a header and one line per row', () => {
    const csv = toCsv([row(), row({ id: 'f2', severity: 'CRITICAL' })]);
    expect(csv.split('\n')).toHaveLength(3);
    expect(csv.split('\n')[0]).toBe('pr,file,lines,severity,category,title,confidence,status');
  });
});

describe('parseSince', () => {
  it('supports relative day windows', () => {
    const now = Date.UTC(2026, 0, 10);
    expect(parseSince('7d', now)?.toISOString()).toBe('2026-01-03T00:00:00.000Z');
  });

  it('returns null when absent', () => {
    expect(parseSince(undefined)).toBeNull();
  });
});

describe('signBody', () => {
  it('matches the GitHub sha256= format', () => {
    expect(signBody('s', '{}')).toMatch(/^sha256=[0-9a-f]{64}$/);
  });
});

describe('exportFileName', () => {
  it('defaults to a dated name', () => {
    expect(exportFileName(undefined, new Date('2026-03-01T10:00:00Z'))).toBe('findings-2026-03-01.csv');
  });

  it('keeps an explicit .csv name', () => {
    expect(exportFileName('weekly.csv')).toBe('weekly.csv');
  });
});

describe('countBy', () => {
  it('counts rows per key', () => {
    expect(countBy([row(), row(), row({ severity: 'CRITICAL' })], 'severity')).toEqual({
      WARNING: 2,
      CRITICAL: 1,
    });
  });
});
