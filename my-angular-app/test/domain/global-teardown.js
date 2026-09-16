/**
 * global-teardown.js
 *
 * Runs after all Playwright tests complete.
 * Remaps raw istanbul coverage through source maps and filters to app files only.
 */
const { execSync } = require('child_process');
const path = require('path');

module.exports = async function globalTeardown() {
  const ROOT = path.resolve(__dirname, '../..');
  const remapScript = path.join(__dirname, 'remap-coverage.js');
  
  try {
    const output = execSync(`node "${remapScript}"`, {
      cwd: ROOT,
      stdio: 'pipe',
      timeout: 30000,
    });
    console.log(output.toString());
  } catch (e) {
    console.error('Coverage remap failed:', e.stderr?.toString() || e.message);
  }
};
