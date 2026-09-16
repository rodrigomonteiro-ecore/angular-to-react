import { createRequire } from 'module';
import path from 'path';

async function globalSetup() {
  const rootDir = path.resolve(import.meta.dirname, '..');
  // Create require that resolves relative to test/domain/scenarios/
  // (where the spec files live and do require('../coverage-helper'))
  globalThis.require = createRequire(
    path.resolve(rootDir, 'test/domain/scenarios/placeholder.js')
  );
}

export default globalSetup;
