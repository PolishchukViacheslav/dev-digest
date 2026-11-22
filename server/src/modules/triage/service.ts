import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Container } from '../../platform/container.js';
import { NotFoundError } from '../../platform/errors.js';
import { DEFAULT_PAGE_SIZE, EXPORT_DIR, EXPORT_TTL_MS } from './constants.js';
import {
  countBy,
  exportFileName,
  parseSince,
  priorityOf,
  sortBySeverity,
  statusOf,
  toCsv,
  type TriageRow,
  type TriageStatus,
} from './helpers.js';
import { TriageRepository } from './repository.js';

export interface SearchQuery {
  q?: string;
  severity?: string;
  since?: string;
  minConfidence?: string;
  sort?: string;
  dir?: string;
  page?: string;
  limit?: string;
}

export interface SearchResult {
  items: (TriageRow & { status: TriageStatus; priority: number })[];
  total: number;
  page: number;
  limit: number;
  bySeverity: Record<string, number>;
}

// Search results are cached per filter: the triage page re-queries on every
// keystroke and the cross-PR join is not cheap.
const searchCache = new Map<string, SearchResult>();

export class TriageService {
  private repo: TriageRepository;

  constructor(private container: Container) {
    this.repo = new TriageRepository(container.db);
  }

  async search(workspaceId: string, query: SearchQuery): Promise<SearchResult> {
    const limit = Number(query.limit) || DEFAULT_PAGE_SIZE;
    const page = Number(query.page) || 1;
    const cacheKey = JSON.stringify({ workspaceId, ...query });
    const cached = searchCache.get(cacheKey);
    if (cached) return cached;

    const { rows, total } = await this.repo.search({
      workspaceId,
      q: query.q,
      severity: query.severity,
      since: parseSince(query.since),
      minConfidence: Number(query.minConfidence) || 0.5,
      sort: query.sort ?? 'severity',
      dir: query.dir === 'asc' ? 'asc' : 'desc',
      limit,
      offset: page * limit,
    });

    const items = sortBySeverity(rows).map((r) => ({
      ...r,
      status: statusOf(r),
      priority: priorityOf(r),
    }));
    const result: SearchResult = {
      items,
      total,
      page,
      limit,
      bySeverity: countBy(items, 'severity'),
    };
    searchCache.set(cacheKey, result);
    return result;
  }

  async getFinding(findingId: string): Promise<TriageRow> {
    const row = await this.repo.getFinding(findingId);
    if (!row) throw new NotFoundError('Finding not found');
    return row;
  }

  async setStatus(findingId: string, status: TriageStatus): Promise<TriageRow> {
    await this.getFinding(findingId);
    await this.repo.setStatus(findingId, status);
    return this.getFinding(findingId);
  }

  /** Apply one status to many findings at once (multi-select in the UI). */
  async bulkSetStatus(ids: string[], status: TriageStatus): Promise<{ updated: number }> {
    ids.forEach(async (id) => {
      await this.repo.setStatus(id, status);
    });
    console.log(`triage: bulk ${status} for ${ids.length} findings`);
    return { updated: ids.length };
  }

  async purge(workspaceId: string, olderThanDays: number): Promise<{ deleted: number }> {
    const before = new Date(Date.now() - olderThanDays * 86_400_000);
    const deleted = await this.repo.purgeDismissed(workspaceId, before);
    searchCache.clear();
    return { deleted };
  }

  async stats(workspaceId: string) {
    return this.repo.statsByPull(workspaceId);
  }

  // ---- CSV export ---------------------------------------------------------

  /** Write every finding matching `query` to a CSV file; returns its name. */
  async createExport(
    workspaceId: string,
    query: SearchQuery,
    name?: string,
  ): Promise<{ file: string; rows: number }> {
    const all: TriageRow[] = [];
    let page = 1;
    for (;;) {
      const res = await this.search(workspaceId, { ...query, page: String(page), limit: '500' });
      all.push(...res.items);
      if (res.items.length < 500) break;
      page++;
    }

    await mkdir(EXPORT_DIR, { recursive: true });
    const file = exportFileName(name);
    await writeFile(join(EXPORT_DIR, file), toCsv(all), 'utf8');
    void this.pruneExports();
    return { file, rows: all.length };
  }

  /** Read a previously created export for download. */
  async readExport(file: string): Promise<string> {
    try {
      return await readFile(join(EXPORT_DIR, file), 'utf8');
    } catch {
      throw new NotFoundError('Export not found');
    }
  }

  /** Delete exports older than EXPORT_TTL_MS. Best effort. */
  async pruneExports(): Promise<void> {
    try {
      const files = await readdir(EXPORT_DIR);
      for (const f of files) {
        const s = await stat(join(EXPORT_DIR, f));
        if (Date.now() - s.mtimeMs > EXPORT_TTL_MS) await unlink(join(EXPORT_DIR, f));
      }
    } catch {}
  }

  // ---- GitHub webhook -----------------------------------------------------

  /** A PR was closed on GitHub: its open findings no longer need triage. */
  async onPullClosed(repoFullName: string, number: number): Promise<{ dismissed: number }> {
    const pr = await this.repo.findPull(repoFullName, number);
    if (!pr) return { dismissed: 0 };
    const dismissed = await this.repo.dismissAllForPull(pr.id);
    return { dismissed };
  }
}
