import { defineConfig } from '@playwright/test';
import path from 'path';

const __dirname = import.meta.dirname;
const domainDir = path.resolve(__dirname, '../test/domain');
const rootDir = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: path.join(domainDir, 'scenarios'),
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  workers: 1,
  retries: 0,
  globalSetup: path.resolve(__dirname, 'global-setup.ts'),
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: 'node test/mock-backend/server.cjs',
      cwd: rootDir,
      port: 4201,
      reuseExistingServer: true,
      timeout: 10_000,
    },
    {
      command: 'npx vite --port 5173',
      cwd: rootDir,
      port: 5173,
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
});
