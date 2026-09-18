import { describe, expect, it } from '@jest/globals';
import { loadDefinition, runDocumentFlow } from '../local-runner.js';

const endpoints = {
  'stage-1': 'http://s1',
  'stage-2': 'http://s2',
  'stage-3': 'http://s3',
  'stage-4': 'http://s4',
  'stage-5': 'http://s7',
  'stage-6': 'http://s5',
  'stage-7': 'http://s6',
};

function mockFetch(table) {
  return async (url, init = {}) => {
    const key = `${init.method ?? 'GET'} ${url}`;
    const row = table[key] ?? { status: 500, body: { error: `unexpected ${key}` } };
    return new Response(JSON.stringify(row.body), {
      status: row.status ?? 200,
      headers: { 'content-type': 'application/json' },
    });
  };
}

const okTable = {
  'POST http://s1/stage-1': { body: { valid: true } },
  'POST http://s2/stage-2': { status: 201, body: { uri: 's3://docs/doc-1' } },
  'POST http://s3/stage-3': { status: 201, body: { stored: true } },
  'POST http://s4/stage-4': { status: 201, body: { acl: 'private' } },
  'POST http://s7/stage-5': { status: 201, body: { stored: true } },
  'POST http://s5/stage-6': { body: { ok: true } },
  'POST http://s6/stage-7': { body: { statusCode: 200, message: 'document stored' } },
};

describe('definition', () => {
  it('runs store writes in Parallel and rollback as Lambda', async () => {
    const def = await loadDefinition();
    const parallel = def.States['parallel-store-writes'];
    expect(parallel.Type).toBe('Parallel');
    expect(parallel.Branches.map((b) => b.StartAt)).toEqual([
      'stage-2',
      'stage-3',
      'stage-4',
      'stage-5',
    ]);
    expect(def.States['stage-1'].Next).toBe('parallel-store-writes');
    expect(def.States['stage-1'].Resource).toBe('arn:aws:states:::http:invoke');
    expect(def.States['stage-6'].Resource).toBe('arn:aws:states:::http:invoke');
    expect(def.States['stage-7'].Resource).toBe('arn:aws:states:::http:invoke');
    expect(def.States['rollback'].Resource).toBe('arn:aws:states:::lambda:invoke');
    expect(def.States['rollback'].Parameters['FunctionName.$']).toBe('$.rollbackFunctionArn');
  });
});

describe('local runner', () => {
  it('succeeds when APIs 1-6 succeed', async () => {
    const out = await runDocumentFlow({ documentId: 'doc-1' }, { endpoints, fetchImpl: mockFetch(okTable) });
    expect(out.ok).toBe(true);
    expect(out.body.message).toBe('document stored');
  });

  it('invokes rollback when a parallel store fails', async () => {
    const table = { ...okTable, 'POST http://s3/stage-3': { status: 500, body: { error: 'nope' } } };
    const out = await runDocumentFlow({ documentId: 'doc-1' }, { endpoints, fetchImpl: mockFetch(table) });
    expect(out.ok).toBe(false);
    expect(out.body.rollback.rolledBack).toBe(true);
    expect(out.body.results['stage-3'].status).toBe('FAILED');
  });
});
