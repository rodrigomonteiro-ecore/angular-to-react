import { defineConfig } from '@playwright/test';
import path from 'path';

export default defineConfig({
  testDir: './scenarios',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  workers: 1, // single worker to avoid coverage data loss
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
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
      command: 'npx vite --port 5173',
      cwd: path.resolve(__dirname, '../..'),
      port: 5173,
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
});
