import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollback as rollbackLambda } from '../../rollback/src/handler.js';
import { buildResponse as buildResponseApi } from '../../stage-7/src/handlers.js';
import { ENVIRONMENTS, loadConfig, resolveEnv, toExecutionInput } from '@doc-ingest/config';

const here = dirname(fileURLToPath(import.meta.url));

export async function loadDefinition(path = join(here, 'document-ingest.asl.json')) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function loadLocalEndpoints() {
  const cfg = await loadConfig('local');
  return cfg.endpoints;
}

export function finalize({ ok, results, rollbackResult, error }) {
  if (ok) {
    return { ok: true, statusCode: 200, body: results['stage-7']?.Payload ?? results['stage-7'] };
  }
  return {
    ok: false,
    statusCode: 500,
    body: { error: error ?? { message: 'stage failed' }, rollback: rollbackResult, results },
  };
}

async function postJson(fetchImpl, url, payload) {
  const res = await fetchImpl(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(body.error ?? `HTTP ${res.status} for ${url}`);
    err.statusCode = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

function asBranch(name, fn) {
  return fn
    .then((result) => ({ function: name, status: 'SUCCEEDED', result }))
    .catch((error) => ({
      function: name,
      status: 'FAILED',
      error: { message: error.message, statusCode: error.statusCode ?? 500, body: error.body },
    }));
}

function stageUrl(ep, id) {
  return `${ep[id]}/${id}`;
}

/**
 * Mirrors ASL: stage-1 → parallel(stage-2..stage-5) → stage-6 → stage-7, or rollback Lambda.
 */
export async function runDocumentFlow(event, { fetchImpl = fetch, endpoints, rollbackFn = rollbackLambda } = {}) {
  const originalEvent = event.originalEvent ?? event;
  const ep = endpoints ?? event.endpoints;
  if (!ep) throw Object.assign(new Error('endpoints required'), { statusCode: 400 });

  const results = {};
  try {
    results['stage-1'] = {
      Payload: await postJson(fetchImpl, stageUrl(ep, 'stage-1'), originalEvent),
    };
  } catch (error) {
    const rollbackResult = rollbackFn({ results, error: { message: error.message } });
    return finalize({ ok: false, results, rollbackResult, error: { message: error.message, statusCode: error.statusCode } });
  }

  const parallelIds = ['stage-2', 'stage-3', 'stage-4', 'stage-5'];
  const parallel = await Promise.all(
    parallelIds.map((id) => asBranch(id, postJson(fetchImpl, stageUrl(ep, id), originalEvent))),
  );
  parallelIds.forEach((id, i) => {
    results[id] = parallel[i];
  });

  if (!parallel.every((s) => s.status === 'SUCCEEDED')) {
    const rollbackResult = rollbackFn({ results, error: { message: 'parallel stage failed' } });
    return finalize({ ok: false, results, rollbackResult, error: { message: 'parallel stage failed' } });
  }

  try {
    results['stage-6'] = {
      Payload: await postJson(fetchImpl, stageUrl(ep, 'stage-6'), originalEvent),
    };
    results['stage-7'] = {
      Payload: ep['stage-7']
        ? await postJson(fetchImpl, stageUrl(ep, 'stage-7'), { originalEvent, results })
        : buildResponseApi({ originalEvent, results }),
    };
  } catch (error) {
    const rollbackResult = rollbackFn({ results, error: { message: error.message } });
    return finalize({ ok: false, results, rollbackResult, error: { message: error.message, statusCode: error.statusCode } });
  }

  return finalize({ ok: true, results });
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  const argv = process.argv.slice(2);
  const envIdx = argv.indexOf('--env');
  const env = resolveEnv(envIdx >= 0 ? argv[envIdx + 1] : undefined);
  const documentId = argv.filter((a, i) => a !== '--env' && i !== envIdx + 1 && !ENVIRONMENTS.includes(a))[0] ?? 'doc-1';
  const cfg = await loadConfig(env);
  const event = toExecutionInput(cfg, { documentId });
  const result = await runDocumentFlow(event);
  process.stdout.write(`${JSON.stringify({ env, ...result }, null, 2)}\n`);
}
