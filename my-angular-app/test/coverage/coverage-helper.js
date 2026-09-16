// @ts-check
/**
 * coverage-helper.js
 *
 * Collects window.__coverage__ from the browser and persists it to disk.
 * After the suite completes, remap-coverage.js converts raw coverage to
 * source-mapped, app-only coverage.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const COVERAGE_RAW_TEMP = path.join(ROOT, '.a2r', 'coverage-raw-temp.json');

/**
 * Collect raw window.__coverage__ from the page and deep-merge into
 * the on-disk temp file (read-merge-write pattern).
 * @param {import('@playwright/test').Page} page
 */
async function mergeCoverageFromPage(page) {
  const coverage = await page.evaluate(() => window['__coverage__'] || null);
  if (!coverage) return;

  const a2rDir = path.join(ROOT, '.a2r');
  if (!fs.existsSync(a2rDir)) {
    fs.mkdirSync(a2rDir, { recursive: true });
  }

  // Read existing accumulated coverage
  let accumulated = {};
  if (fs.existsSync(COVERAGE_RAW_TEMP)) {
    try {
      accumulated = JSON.parse(fs.readFileSync(COVERAGE_RAW_TEMP, 'utf-8'));
    } catch {
      accumulated = {};
    }
  }

  // Deep-merge counters
  for (const [key, fileData] of Object.entries(coverage)) {
    if (!accumulated[key]) {
      accumulated[key] = fileData;
    } else {
      const existing = accumulated[key];
      // Merge statement counters
      for (const sid of Object.keys(fileData.s || {})) {
        existing.s[sid] = (existing.s[sid] || 0) + (fileData.s[sid] || 0);
      }
      // Merge function counters
      for (const fid of Object.keys(fileData.f || {})) {
        existing.f[fid] = (existing.f[fid] || 0) + (fileData.f[fid] || 0);
      }
      // Merge branch counters
      for (const bid of Object.keys(fileData.b || {})) {
        if (!existing.b[bid]) {
          existing.b[bid] = fileData.b[bid];
        } else {
          existing.b[bid] = existing.b[bid].map(
            (count, i) => count + (fileData.b[bid][i] || 0)
          );
        }
      }
    }
  }

  // Write back
  fs.writeFileSync(COVERAGE_RAW_TEMP, JSON.stringify(accumulated));
}

/**
 * Delete stale coverage files. Call once at the start of the suite.
 */
function resetCoverage() {
  for (const f of [
    COVERAGE_RAW_TEMP,
    path.join(ROOT, '.a2r', 'coverage-raw.json'),
  ]) {
    if (fs.existsSync(f)) fs.unlinkSync(f);
  }
  const nycOut = path.join(ROOT, '.nyc_output');
  if (fs.existsSync(nycOut)) {
    fs.rmSync(nycOut, { recursive: true, force: true });
  }
}

module.exports = { mergeCoverageFromPage, resetCoverage };
