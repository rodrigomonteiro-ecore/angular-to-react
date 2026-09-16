/**
 * remap-coverage.js
 *
 * Reads the raw coverage temp file, uses nyc to remap through source maps,
 * then filters to only app source files. Writes .a2r/coverage-raw.json.
 *
 * Copied from test/coverage/remap-coverage.js — do not import via
 * relative path; test/domain/ must be self-contained.
 *
 * Can be used as:
 *   - require('./remap-coverage').remapAndFilterCoverage()  (from tests)
 *   - node remap-coverage.js  (standalone)
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '../..');
const COVERAGE_RAW_TEMP = path.join(ROOT, '.a2r', 'coverage-raw-temp.json');
const COVERAGE_RAW = path.join(ROOT, '.a2r', 'coverage-raw.json');
const NYC_OUTPUT = path.join(ROOT, '.nyc_output');
const REPORT_DIR = path.join(ROOT, '.a2r', 'coverage-report');

function remapAndFilterCoverage() {
  // 1. Check temp file exists
  if (!fs.existsSync(COVERAGE_RAW_TEMP)) {
    console.error('No coverage-raw-temp.json found. Did the tests run?');
    return;
  }

  const rawCoverage = JSON.parse(fs.readFileSync(COVERAGE_RAW_TEMP, 'utf-8'));
  console.log('Raw coverage keys:', Object.keys(rawCoverage).length);

  // 2. Write raw coverage to .nyc_output for nyc to pick up
  if (!fs.existsSync(NYC_OUTPUT)) {
    fs.mkdirSync(NYC_OUTPUT, { recursive: true });
  }
  fs.writeFileSync(path.join(NYC_OUTPUT, 'out.json'), JSON.stringify(rawCoverage));

  // 3. Run nyc report to remap via source maps
  if (fs.existsSync(REPORT_DIR)) {
    fs.rmSync(REPORT_DIR, { recursive: true, force: true });
  }
  try {
    execSync(
      `npx nyc report --reporter=json --report-dir="${REPORT_DIR}" --temp-dir="${NYC_OUTPUT}"`,
      { cwd: ROOT, stdio: 'pipe', timeout: 30000 }
    );
  } catch (e) {
    console.error('nyc report failed:', e.stderr?.toString() || e.message);
    return;
  }

  // 4. Read the remapped coverage-final.json
  const coverageFinalPath = path.join(REPORT_DIR, 'coverage-final.json');
  if (!fs.existsSync(coverageFinalPath)) {
    console.error('coverage-final.json not produced by nyc report');
    return;
  }
  const remapped = JSON.parse(fs.readFileSync(coverageFinalPath, 'utf-8'));

  // 5. Filter to only app source files (src/app/** and src/main.ts)
  const filtered = {};
  for (const [filePath, data] of Object.entries(remapped)) {
    if (filePath.includes('/src/app/') || filePath.endsWith('/src/main.ts')) {
      filtered[filePath] = data;
    }
  }

  // 6. Write filtered coverage to .a2r/coverage-raw.json
  const a2rDir = path.join(ROOT, '.a2r');
  if (!fs.existsSync(a2rDir)) {
    fs.mkdirSync(a2rDir, { recursive: true });
  }
  fs.writeFileSync(COVERAGE_RAW, JSON.stringify(filtered, null, 2));

  // 7. Summary
  let totalStmts = 0, coveredStmts = 0;
  let totalBranches = 0, coveredBranches = 0;
  let totalFns = 0, coveredFns = 0;

  for (const data of Object.values(filtered)) {
    for (const sid of Object.keys(data.s || {})) {
      totalStmts++;
      if (data.s[sid] > 0) coveredStmts++;
    }
    for (const bid of Object.keys(data.b || {})) {
      for (const c of data.b[bid]) {
        totalBranches++;
        if (c > 0) coveredBranches++;
      }
    }
    for (const fid of Object.keys(data.f || {})) {
      totalFns++;
      if (data.f[fid] > 0) coveredFns++;
    }
  }

  console.log(`Filtered coverage: ${Object.keys(filtered).length} app source files`);
  Object.keys(filtered).forEach(f => console.log('  ' + f.split('/').slice(-3).join('/')));
  console.log(`Statements: ${coveredStmts}/${totalStmts} (${totalStmts ? (coveredStmts/totalStmts*100).toFixed(1) : 'N/A'}%)`);
  console.log(`Branches:   ${coveredBranches}/${totalBranches} (${totalBranches ? (coveredBranches/totalBranches*100).toFixed(1) : 'N/A'}%)`);
  console.log(`Functions:  ${coveredFns}/${totalFns} (${totalFns ? (coveredFns/totalFns*100).toFixed(1) : 'N/A'}%)`);
  console.log(`Written to: ${COVERAGE_RAW}`);

  // Clean up temp file
  if (fs.existsSync(COVERAGE_RAW_TEMP)) {
    fs.unlinkSync(COVERAGE_RAW_TEMP);
  }
}

module.exports = { remapAndFilterCoverage };

// Run as standalone script
if (require.main === module) {
  remapAndFilterCoverage();
}
