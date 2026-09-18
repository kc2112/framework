import { describe, expect, it } from '@jest/globals';
import { createServiceApp as validateApp } from '../../../stage-1/src/app.js';
import { createServiceApp as storeDocApp } from '../../../stage-2/src/app.js';
import { createServiceApp as metaApp } from '../../../stage-3/src/app.js';
import { createServiceApp as aclApp } from '../../../stage-4/src/app.js';
import { createServiceApp as storageApp } from '../../../stage-6/src/app.js';
import { withServer } from '@doc-ingest/express-app/listen';

async function post(base, path, body) {
  return fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('stage APIs', () => {
  it('stage1 validates a documentId', async () => {
    await withServer(validateApp(), async (base) => {
      const res = await post(base, '/stage-1', { documentId: 'doc-1' });
      expect(res.status).toBe(200);
      expect(await res.json()).toMatchObject({ valid: true, function: 'stage-1' });
    });
  });

  it('stage1 rejects missing documentId', async () => {
    await withServer(validateApp(), async (base) => {
      expect((await post(base, '/stage-1', {})).status).toBe(400);
    });
  });

  it('stage2 stores a document', async () => {
    await withServer(storeDocApp(), async (base) => {
      const res = await post(base, '/stage-2', { documentId: 'doc-1' });
      expect(res.status).toBe(201);
      expect((await res.json()).uri).toContain('doc-1');
    });
  });

  it('stage3 stores metadata', async () => {
    await withServer(metaApp(), async (base) => {
      expect((await post(base, '/stage-3', { documentId: 'doc-1' })).status).toBe(201);
    });
  });

  it('stage4 stores acl', async () => {
    await withServer(aclApp(), async (base) => {
      const body = await (await post(base, '/stage-4', { documentId: 'doc-1' })).json();
      expect(body.function).toBe('stage-4');
    });
  });

  it('stage5 validates storage or fails', async () => {
    await withServer(storageApp(), async (base) => {
      expect((await post(base, '/stage-6', { documentId: 'doc-1' })).status).toBe(200);
      expect((await post(base, '/stage-6', { documentId: 'doc-1', failStorage: true })).status).toBe(409);
    });
  });
});
