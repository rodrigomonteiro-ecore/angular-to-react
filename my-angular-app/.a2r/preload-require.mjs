// Preload script: make require() available in ESM context for Playwright tests.
// The test specs live under test/domain/scenarios/ and require('../coverage-helper').
// We create require() rooted at that directory so relative paths resolve correctly.
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const scenariosDir = path.resolve(__dirname, '..', 'test', 'domain', 'scenarios');
const scenarioRequire = createRequire(pathToFileURL(path.join(scenariosDir, '_virtual.js')).href);
globalThis.require = scenarioRequire;
