import { defineConfig } from '@playwright/test';
import path from 'path';

const MOCK_PORT = 4201;

export default defineConfig({
  testDir: '.',
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  retries: 0,
  workers: 1, // CRITICAL: single worker to avoid losing coverage data
  use: {
    baseURL: `http://localhost:${MOCK_PORT}`,
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: {
    command: `node ${path.resolve(__dirname, '..', 'mock-backend', 'server.js')}`,
    port: MOCK_PORT,
    reuseExistingServer: false,
    timeout: 30_000,
    env: {
      MOCK_PORT: String(MOCK_PORT),
    },
  },
});
