/**
 * Compensating Lambda for document-ingest.
 * Receives the full Step Functions state and reports which API stages to undo.
 */
export function rollback(state = {}) {
  const results = state.results ?? {};
  const completed = Object.entries(results)
    .filter(([, v]) => v && (v.status === 'SUCCEEDED' || v.Payload))
    .map(([name]) => name);
  return {
    rolledBack: true,
    function: 'rollback',
    completedStages: completed,
    error: state.error ?? null,
  };
}

export async function handler(event) {
  return rollback(event);
}
