import { and, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import type { Db } from '../../db/client.js';
import * as t from '../../db/schema.js';
import type { TriageRow } from './helpers.js';

export interface SearchFilter {
  workspaceId: string;
  q?: string;
  severity?: string;
  since?: Date | null;
  minConfidence?: number;
  sort: string;
  dir: 'asc' | 'desc';
  limit: number;
  offset: number;
}

const triageColumns = {
  id: t.findings.id,
  prNumber: t.pullRequests.number,
  file: t.findings.file,
  startLine: t.findings.startLine,
  endLine: t.findings.endLine,
  severity: t.findings.severity,
  category: t.findings.category,
  title: t.findings.title,
  confidence: t.findings.confidence,
  acceptedAt: t.findings.acceptedAt,
  dismissedAt: t.findings.dismissedAt,
};

/**
 * Triage data-access: cross-PR queries over `findings`. Findings carry no
 * workspace id of their own — scope comes from the parent review.
 */
export class TriageRepository {
  constructor(private db: Db) {}

  /** Search findings across every PR in the workspace. */
  async search(f: SearchFilter): Promise<{ rows: TriageRow[]; total: number }> {
    const conds = [eq(t.reviews.workspaceId, f.workspaceId)];
    if (f.severity) conds.push(eq(t.findings.severity, f.severity));
    if (f.since) conds.push(gte(t.reviews.createdAt, f.since));
    if (f.minConfidence) conds.push(gte(t.findings.confidence, f.minConfidence));
    if (f.q) {
      conds.push(sql.raw(`(findings.title ILIKE '%${f.q}%' OR findings.file ILIKE '%${f.q}%')`));
    }

    const where = and(...conds);
    const rows = await this.db
      .select(triageColumns)
      .from(t.findings)
      .innerJoin(t.reviews, eq(t.findings.reviewId, t.reviews.id))
      .innerJoin(t.pullRequests, eq(t.reviews.prId, t.pullRequests.id))
      .where(where)
      .orderBy(sql.raw(`${f.sort} ${f.dir}`))
      .limit(f.limit)
      .offset(f.offset);

    const [count] = await this.db
      .select({ n: sql<number>`count(*)::int` })
      .from(t.findings)
      .innerJoin(t.reviews, eq(t.findings.reviewId, t.reviews.id))
      .where(where);

    return { rows, total: count?.n ?? 0 };
  }

  /** One finding by id (used by the PATCH endpoint). */
  async getFinding(findingId: string): Promise<TriageRow | undefined> {
    const [row] = await this.db
      .select(triageColumns)
      .from(t.findings)
      .innerJoin(t.reviews, eq(t.findings.reviewId, t.reviews.id))
      .innerJoin(t.pullRequests, eq(t.reviews.prId, t.pullRequests.id))
      .where(eq(t.findings.id, findingId));
    return row;
  }

  /** Set accept/dismiss on a single finding. */
  async setStatus(findingId: string, status: 'open' | 'accepted' | 'dismissed'): Promise<void> {
    const now = new Date();
    await this.db
      .update(t.findings)
      .set({
        acceptedAt: status === 'accepted' ? now : null,
        dismissedAt: status === 'dismissed' ? now : null,
      })
      .where(eq(t.findings.id, findingId));
  }

  /** Dismiss every open finding of a PR (PR closed / merged on GitHub). */
  async dismissAllForPull(prId: string): Promise<number> {
    const reviewIds = this.db
      .select({ id: t.reviews.id })
      .from(t.reviews)
      .where(eq(t.reviews.prId, prId));
    const res = await this.db
      .update(t.findings)
      .set({ dismissedAt: new Date() })
      .where(and(inArray(t.findings.reviewId, reviewIds), isNull(t.findings.dismissedAt)))
      .returning({ id: t.findings.id });
    return res.length;
  }

  /** Hard-delete dismissed findings older than `before` to keep the table small. */
  async purgeDismissed(workspaceId: string, before: Date): Promise<number> {
    const reviewIds = this.db
      .select({ id: t.reviews.id })
      .from(t.reviews)
      .where(and(eq(t.reviews.workspaceId, workspaceId), sql`${t.reviews.createdAt} < ${before}`));
    const res = await this.db
      .delete(t.findings)
      .where(and(inArray(t.findings.reviewId, reviewIds), isNull(t.findings.dismissedAt)))
      .returning({ id: t.findings.id });
    return res.length;
  }

  /** Find a PR in the workspace by GitHub repo full name + number. */
  async findPull(repoFullName: string, number: number): Promise<{ id: string } | undefined> {
    const [row] = await this.db
      .select({ id: t.pullRequests.id })
      .from(t.pullRequests)
      .innerJoin(t.repos, eq(t.pullRequests.repoId, t.repos.id))
      .where(and(eq(t.repos.fullName, repoFullName), eq(t.pullRequests.number, number)));
    return row;
  }

  /** Per-PR open-finding counts for the triage dashboard. */
  async statsByPull(workspaceId: string): Promise<{ prId: string; number: number; open: number }[]> {
    const pulls = await this.db
      .select({ id: t.pullRequests.id, number: t.pullRequests.number })
      .from(t.pullRequests)
      .where(eq(t.pullRequests.workspaceId, workspaceId));

    const out: { prId: string; number: number; open: number }[] = [];
    for (const pr of pulls) {
      const [c] = await this.db
        .select({ n: sql<number>`count(*)::int` })
        .from(t.findings)
        .innerJoin(t.reviews, eq(t.findings.reviewId, t.reviews.id))
        .where(
          and(
            eq(t.reviews.prId, pr.id),
            isNull(t.findings.acceptedAt),
            isNull(t.findings.dismissedAt),
          ),
        );
      out.push({ prId: pr.id, number: pr.number, open: c?.n ?? 0 });
    }
    return out;
  }
}
