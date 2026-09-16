import { defineConfig } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

export default defineConfig({
  testDir: path.resolve(projectRoot, 'test/domain/scenarios'),
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  workers: 1,
  retries: 0,
  use: {
    baseURL: 'http://localhost:5173',
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
  webServer: [
    {
      command: 'node test/mock-backend/server.cjs',
      cwd: projectRoot,
      port: 4201,
      reuseExistingServer: true,
      timeout: 10_000,
    },
    {
      command: 'npx vite --port 5173',
      cwd: projectRoot,
      port: 5173,
      reuseExistingServer: true,
      timeout: 15_000,
    },
  ],
});
