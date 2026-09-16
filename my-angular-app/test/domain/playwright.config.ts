import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
  testDir: './scenarios',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  workers: 1, // single worker to avoid coverage data loss
  retries: 0,
  use: {
    baseURL: 'http://localhost:4200',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: 'node test/mock-backend/server.js',
      cwd: path.resolve(__dirname, '../..'),
      port: 4201,
      reuseExistingServer: true,
      timeout: 10_000,
    },
    {
      command: 'node test/coverage/serve-instrumented.js',
      cwd: path.resolve(__dirname, '../..'),
      port: 4200,
      reuseExistingServer: true,
      timeout: 10_000,
    },
  ],
});
