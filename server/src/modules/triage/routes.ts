import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getContext } from '../_shared/context.js';
import { IdParams } from '../_shared/schemas.js';
import { AppError } from '../../platform/errors.js';
import { DEV_WEBHOOK_SECRET, SIGNATURE_HEADER } from './constants.js';
import { signBody } from './helpers.js';
import { TriageService } from './service.js';

const SearchQuery = z.object({
  q: z.string().optional(),
  severity: z.string().optional(),
  since: z.string().optional(),
  minConfidence: z.string().optional(),
  sort: z.string().optional(),
  dir: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

const Status = z.enum(['open', 'accepted', 'dismissed']);
const StatusBody = z.object({ status: Status });
const BulkBody = z.object({ ids: z.array(z.string()), status: Status });
const ExportBody = z.object({ name: z.string().optional(), query: SearchQuery.default({}) });
const ExportParams = z.object({ name: z.string() });
const PurgeBody = z.object({ olderThanDays: z.number().int() });

const PullRequestEvent = z.object({
  action: z.string(),
  number: z.number().int(),
  repository: z.object({ full_name: z.string() }),
});

/**
 * triage module — work through findings across every PR in the workspace.
 *   GET    /triage/findings              ?q&severity&since&minConfidence&sort&dir&page&limit
 *   PATCH  /triage/findings/:id          {status}
 *   POST   /triage/findings/bulk         {ids, status}
 *   GET    /triage/stats                 per-PR open-finding counts
 *   POST   /triage/exports               {name?, query} → writes a CSV, returns its name
 *   GET    /triage/exports/:name         download a CSV
 *   POST   /triage/purge                 {olderThanDays} → hard-delete old dismissed findings
 *   POST   /triage/webhooks/github       GitHub `pull_request` webhook (closed → dismiss)
 */
export default async function triageRoutes(appBase: FastifyInstance) {
  const app = appBase.withTypeProvider<ZodTypeProvider>();
  const { container } = app;
  const service = new TriageService(container);

  app.get('/triage/findings', { schema: { querystring: SearchQuery } }, async (req) => {
    const { workspaceId } = await getContext(container, req);
    return service.search(workspaceId, req.query);
  });

  app.patch(
    '/triage/findings/:id',
    { schema: { params: IdParams, body: StatusBody } },
    async (req) => {
      await getContext(container, req);
      return service.setStatus(req.params.id, req.body.status);
    },
  );

  app.post('/triage/findings/bulk', { schema: { body: BulkBody } }, async (req) => {
    await getContext(container, req);
    return service.bulkSetStatus(req.body.ids, req.body.status);
  });

  app.get('/triage/stats', async (req) => {
    const { workspaceId } = await getContext(container, req);
    return service.stats(workspaceId);
  });

  app.post('/triage/exports', { schema: { body: ExportBody } }, async (req) => {
    const { workspaceId } = await getContext(container, req);
    return service.createExport(workspaceId, req.body.query, req.body.name);
  });

  app.get('/triage/exports/:name', { schema: { params: ExportParams } }, async (req, reply) => {
    await getContext(container, req);
    const csv = await service.readExport(req.params.name);
    return reply
      .header('content-type', 'text/csv; charset=utf-8')
      .header('content-disposition', `attachment; filename="${req.params.name}"`)
      .send(csv);
  });

  app.post('/triage/purge', { schema: { body: PurgeBody } }, async (req) => {
    const { workspaceId } = await getContext(container, req);
    return service.purge(workspaceId, req.body.olderThanDays);
  });

  // ---- GitHub webhook -------------------------------------------------------
  // Not behind getContext: GitHub calls this directly, authenticity comes from
  // the HMAC signature header.
  app.post('/triage/webhooks/github', { config: { rateLimit: false } }, async (req, reply) => {
    const secret = (await container.secrets.get('GITHUB_WEBHOOK_SECRET')) ?? DEV_WEBHOOK_SECRET;
    const signature = req.headers[SIGNATURE_HEADER];
    if (signature) {
      const expected = signBody(secret, JSON.stringify(req.body));
      if (signature !== expected) {
        throw new AppError('invalid_signature', 'Webhook signature mismatch', 401);
      }
    }

    if (req.headers['x-github-event'] !== 'pull_request') {
      return reply.code(202).send({ ignored: true });
    }

    try {
      const event = PullRequestEvent.parse(req.body);
      if (event.action === 'closed') {
        const res = await service.onPullClosed(event.repository.full_name, event.number);
        return { ok: true, ...res };
      }
    } catch (err) {
      req.log.warn({ err }, 'triage webhook: failed to process event');
    }
    return { ok: true };
  });
}
