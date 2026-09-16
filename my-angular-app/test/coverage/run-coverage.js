#!/usr/bin/env node
/**
 * run-coverage.js — End-to-end script to:
 *   1. Build Angular in development mode
 *   2. Instrument with nyc
 *   3. Run Playwright tests (which start mock-backend via webServer config)
 *   4. Generate coverage report
 */
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..', '..');
const DIST_BROWSER = path.join(ROOT, 'dist', 'my-angular-app', 'browser');
const INSTRUMENTED = path.join(ROOT, 'instrumented');
const NYC_OUTPUT = path.join(ROOT, '.nyc_output');
const COVERAGE_RAW = path.join(ROOT, '.a2r', 'coverage-raw.json');

function run(cmd, label) {
  console.log(`\n▸ ${label}`);
  execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
}

// 1. Build
run('npx ng build --configuration=development', 'Building Angular app (dev mode)...');

// 2. Instrument
if (fs.existsSync(INSTRUMENTED)) fs.rmSync(INSTRUMENTED, { recursive: true });
run(
  `npx nyc instrument ${DIST_BROWSER} ${INSTRUMENTED} --source-map --compact=false ` +
    `--exclude='polyfills*.js' --exclude='runtime*.js' --exclude='vendor*.js' --exclude='*.css' --exclude='*.css.map' --exclude='*.ico'`,
  'Instrumenting with nyc...'
);
// Copy static assets
for (const f of ['index.html', 'styles.css', 'favicon.ico']) {
  const src = path.join(DIST_BROWSER, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(INSTRUMENTED, f));
}

// 3. Clean stale coverage
if (fs.existsSync(COVERAGE_RAW)) fs.unlinkSync(COVERAGE_RAW);

// 4. Run Playwright
run('npx playwright test --config=test/coverage/playwright.config.ts', 'Running Playwright tests...');

// 5. Copy coverage for nyc report
fs.mkdirSync(NYC_OUTPUT, { recursive: true });
if (fs.existsSync(COVERAGE_RAW)) {
  fs.copyFileSync(COVERAGE_RAW, path.join(NYC_OUTPUT, 'out.json'));
}

// 6. Report
run('npx nyc report --reporter=text --reporter=text-summary --temp-dir=.nyc_output', 'Coverage report:');
