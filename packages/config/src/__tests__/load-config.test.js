import { describe, expect, it } from '@jest/globals';
import { ENVIRONMENTS, loadConfig, resolveEnv, toExecutionInput } from '../load-config.js';

describe('load-config', () => {
  it('accepts local, dev, test, prod', () => {
    expect(ENVIRONMENTS).toEqual(['local', 'dev', 'test', 'prod']);
    expect(resolveEnv('DEV')).toBe('dev');
  });

  it('rejects unknown env', () => {
    expect(() => resolveEnv('staging')).toThrow(/unknown env/);
  });

  it('loads stage-n endpoints for each env', async () => {
    for (const env of ENVIRONMENTS) {
      const cfg = await loadConfig(env);
      expect(cfg.env).toBe(env);
      expect(cfg.endpoints['stage-1']).toMatch(/^https?:\/\//);
      expect(cfg['rollback-function-arn']).toMatch(/function:document-ingest-rollback/);
    }
  });

  it('builds execution input', async () => {
    const cfg = await loadConfig('local');
    const input = toExecutionInput(cfg, { documentId: 'doc-1' });
    expect(input.documentId).toBe('doc-1');
    expect(input.endpoints['stage-5']).toContain('127.0.0.1:3007');
    expect(input.connectionArn).toBe(cfg['connection-arn']);
  });
});
