import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const ENVIRONMENTS = ['local', 'dev', 'test', 'prod'];

export function resolveEnv(raw = process.env.APP_ENV ?? process.env.NX_TASK_TARGET_CONFIGURATION ?? 'local') {
  const env = String(raw).trim().toLowerCase();
  if (!ENVIRONMENTS.includes(env)) {
    throw Object.assign(new Error(`unknown env "${raw}". use: ${ENVIRONMENTS.join(', ')}`), {
      statusCode: 400,
    });
  }
  return env;
}

export async function loadConfig(env = resolveEnv()) {
  const name = resolveEnv(env);
  const path = join(here, 'environments', `${name}.json`);
  const config = JSON.parse(await readFile(path, 'utf8'));
  return Object.freeze({ ...config, env: name });
}

export function toExecutionInput(config, event = {}) {
  return {
    ...event,
    connectionArn: config['connection-arn'],
    rollbackFunctionArn: config['rollback-function-arn'],
    endpoints: config.endpoints,
  };
}
