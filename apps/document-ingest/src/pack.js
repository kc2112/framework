import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../..');
const version =
  process.env.SFN_VERSION ??
  process.env.CI_COMMIT_TAG ??
  process.env.CI_COMMIT_SHORT_SHA ??
  'local';

const asl = JSON.parse(await readFile(join(here, 'document-ingest.asl.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(here, 'manifest.json'), 'utf8'));

const bundle = {
  version,
  packagedAt: new Date().toISOString(),
  commit: process.env.CI_COMMIT_SHA ?? null,
  pipeline: process.env.CI_PIPELINE_ID ?? null,
  manifest,
  definition: asl,
};

const dist = join(root, 'dist');
await mkdir(dist, { recursive: true });
const jsonName = `document-ingest-${version}.json`;
await writeFile(join(dist, jsonName), JSON.stringify(bundle, null, 2));
await writeFile(join(dist, 'document-ingest-latest.json'), JSON.stringify(bundle, null, 2));

const zipName = `document-ingest-${version}.zip`;
execFileSync('zip', ['-j', zipName, jsonName, 'document-ingest-latest.json'], { cwd: dist });
process.stdout.write(`wrote dist/${zipName}\n`);
