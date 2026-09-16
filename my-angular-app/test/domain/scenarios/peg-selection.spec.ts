import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage, resetCoverage } = require('../coverage-helper');
const { remapAndFilterCoverage } = require('../remap-coverage');

test.beforeAll(() => {
  resetCoverage();
});

test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});

test.afterAll(() => {
  remapAndFilterCoverage();
});

// ─── Peg Selection ────────────────────────────────────────

test.describe('Peg Selection', () => {
  test('should select a peg with disks and show indicator', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.clickPeg(1);

    expect(await hanoi.isSelectionIndicatorVisible()).toBe(true);
    await hanoi.selectionIndicatorContainsText('selected');
    await hanoi.hintContains('Click another peg to place the disk');
  });

  test('should NOT select an empty peg', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.clickPeg(2);

    expect(await hanoi.selectionIndicatorCount()).toBe(0);
    await hanoi.hintContains('Click a peg to pick up');
  });

  test('should deselect when clicking the same peg', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.clickPeg(1);
    expect(await hanoi.isSelectionIndicatorVisible()).toBe(true);

    await hanoi.clickPeg(1);
    expect(await hanoi.selectionIndicatorCount()).toBe(0);
  });
});
