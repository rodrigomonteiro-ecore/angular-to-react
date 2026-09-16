// Preload script: makes require() available in ESM context for Playwright workers
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

// Create require that resolves from test/domain/scenarios/
globalThis.require = createRequire(
  path.resolve(rootDir, 'test/domain/scenarios/_virtual.cjs')
);
