/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  roots: ['<rootDir>/apps', '<rootDir>/packages'],
  testMatch: ['**/__tests__/**/*.test.js', '**/*.test.js'],
  moduleFileExtensions: ['js', 'mjs', 'json'],
  transform: {},
  clearMocks: true,
  moduleNameMapper: {
    '^@doc-ingest/express-app$': '<rootDir>/packages/express-app/src/app.js',
    '^@doc-ingest/express-app/listen$': '<rootDir>/packages/express-app/src/listen.js',
    '^@doc-ingest/config$': '<rootDir>/packages/config/src/load-config.js',
  },
  collectCoverageFrom: [
    'apps/*/src/**/*.js',
    'packages/*/src/**/*.js',
    '!apps/*/src/server.js',
    '!apps/*/src/pack.js',
    '!**/__tests__/**',
  ],
  coverageDirectory: 'coverage',
  coverageProvider: 'v8',
  coverageReporters: ['text', 'lcov', 'json-summary', 'cobertura'],
};
