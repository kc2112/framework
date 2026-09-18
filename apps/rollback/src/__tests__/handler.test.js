import { describe, expect, it } from '@jest/globals';
import { handler, rollback } from '../handler.js';

describe('rollback lambda', () => {
  it('lists completed stages', async () => {
    const out = await handler({
      results: {
        validateDocument: { Payload: { valid: true } },
        storeDocument: { status: 'SUCCEEDED' },
        storeMetadata: { status: 'FAILED' },
      },
      error: { message: 'stage-3 failed' },
    });
    expect(out.rolledBack).toBe(true);
    expect(out.completedStages).toEqual(expect.arrayContaining(['validateDocument', 'storeDocument']));
    expect(out.completedStages).not.toContain('storeMetadata');
  });

  it('exports rollback helper', () => {
    expect(rollback({}).function).toBe('rollback');
  });
});
