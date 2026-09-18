# document-ingest

Nx workspace: one Step Functions definition, seven Express APIs, one rollback Lambda.

## Naming

| Kind | Style | Example |
|---|---|---|
| Folders, files, npm packages, Nx projects | kebab-case | `apps/stage-5` |
| HTTP paths, Docker Compose services | kebab-case | `POST /stage-5` |
| Step Functions state names | kebab-case | `stage-1`, `parallel-store-writes` |
| Result / endpoint keys in ASL | kebab-case + JSONPath brackets | `$.results['stage-2']` |
| Lambda name | kebab-case | `document-ingest-rollback` |
| JS functions, variables, ESM exports | camelCase | `storeHeaderData()`, `runDocumentFlow` |
| JS classes | PascalCase | — |
| Env vars | SCREAMING_SNAKE | `PORT`, `DEBUG` |
| AWS built-in fields | AWS camelCase | `connectionArn`, `FunctionName` |
| JSON payload resource id | kebab-case | `{ "function": "stage-4" }` |
| JSON payload data fields | camelCase | `{ "documentId": "doc-1" }` |

Hyphens are not valid unquoted JS identifiers, so source stays camelCase. Resource names the graph, URLs, and AWS states use kebab-case.

## Graph

```
initialize
  → stage-1              HTTP   sequential
  → parallel-store-writes
        ├─ stage-2          HTTP
        ├─ stage-3          HTTP
        ├─ stage-4          HTTP
        └─ stage-5       HTTP
  → merge-parallel → check-parallel
  → stage-6               HTTP   sequential
  → stage-7                 HTTP   sequential
  → mark-success → finalize → done

failure → rollback (Lambda) → mark-failure → finalize → done
```

## Layout

```
apps/stage-1
apps/stage-2
apps/stage-3
apps/stage-4
apps/stage-5
apps/stage-6
apps/stage-7
apps/rollback                  Lambda handler.js
apps/document-ingest           document-ingest.asl.json + local-runner
packages/express-app
```

## Stages

Ids are `stage-1` … `stage-7`. Compensating Lambda is `rollback`. There is no name-remap file.

## Environments



`APP_ENV` is `local` | `dev` | `test` | `prod`. Files: `packages/config/src/environments/<env>.json`.

```bash
npx nx serve document-ingest --configuration=local
npx nx serve document-ingest --configuration=dev
npx nx serve document-ingest --configuration=test
npx nx serve document-ingest --configuration=prod
npx nx print-config document-ingest --configuration=dev
```

`NODE_ENV` is only Node’s runtime (`development` / `test` / `production`).

## Commands


```bash
npm install
npx nx graph
npx nx run-many -t lint
npx nx run-many -t test
npx nx serve stage-1
npx nx pack document-ingest
DEBUG=1 docker compose up --build
```

GitLab publishes `dist/document-ingest-<sha>.zip`. Coverage thresholds fail on **main** only.

Input: `apps/document-ingest/events/document.json` (`documentId`, kebab-case `endpoints`, `rollbackFunctionArn`).
