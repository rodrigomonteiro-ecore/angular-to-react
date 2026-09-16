/**
 * Playwright coverage helpers — collect and persist window.__coverage__
 */
import { Page } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const COVERAGE_FILE = path.resolve(__dirname, '..', '..', '.a2r', 'coverage-raw.json');

/**
 * Deep-merge incoming Istanbul coverage into the on-disk file.
 * Read → merge → write (never overwrite).
 */
export async function collectCoverage(page: Page): Promise<void> {
  const coverage = await page.evaluate(() => (window as any).__coverage__);
  if (!coverage) return;

  let existing: Record<string, any> = {};
  if (fs.existsSync(COVERAGE_FILE)) {
    try {
      existing = JSON.parse(fs.readFileSync(COVERAGE_FILE, 'utf-8'));
    } catch {
      existing = {};
    }
  }

  for (const [filePath, fileCov] of Object.entries<any>(coverage)) {
    if (!existing[filePath]) {
      existing[filePath] = fileCov;
    } else {
      // Merge statement counters
      for (const key of Object.keys(fileCov.s)) {
        existing[filePath].s[key] = (existing[filePath].s[key] || 0) + fileCov.s[key];
      }
      // Merge branch counters
      for (const key of Object.keys(fileCov.b)) {
        if (!existing[filePath].b[key]) {
          existing[filePath].b[key] = fileCov.b[key];
        } else {
          for (let i = 0; i < fileCov.b[key].length; i++) {
            existing[filePath].b[key][i] = (existing[filePath].b[key][i] || 0) + fileCov.b[key][i];
          }
        }
      }
      // Merge function counters
      for (const key of Object.keys(fileCov.f)) {
        existing[filePath].f[key] = (existing[filePath].f[key] || 0) + fileCov.f[key];
      }
    }
  }

  fs.mkdirSync(path.dirname(COVERAGE_FILE), { recursive: true });
  fs.writeFileSync(COVERAGE_FILE, JSON.stringify(existing, null, 2));
}

/**
 * Delete stale coverage data before the suite runs.
 */
export function resetCoverage(): void {
  if (fs.existsSync(COVERAGE_FILE)) {
    fs.unlinkSync(COVERAGE_FILE);
  }
}
