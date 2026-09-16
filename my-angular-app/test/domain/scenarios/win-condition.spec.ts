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

// ─── Win Condition ────────────────────────────────────────

test.describe('Win Condition', () => {
  test('should show win banner after solving with 3 disks (optimal)', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Optimal 7-move solve: A→C, A→B, C→B, A→C, B→A, B→C, A→C
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(1, 2);
    await hanoi.moveDisk(3, 2);
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(2, 1);
    await hanoi.moveDisk(2, 3);
    await hanoi.moveDisk(1, 3);

    expect(await hanoi.isWinBannerVisible()).toBe(true);
    await hanoi.winBannerContainsText('Solved in 7 moves');
    expect(await hanoi.isPerfectScoreVisible()).toBe(true);
    await hanoi.perfectScoreContainsText('Perfect score');
  });

  test('should show win banner without perfect score (non-optimal)', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Waste 2 moves first
    await hanoi.moveDisk(1, 2); // A→B
    await hanoi.moveDisk(2, 1); // B→A (undo)

    // Now solve normally (7 more = 9 total)
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(1, 2);
    await hanoi.moveDisk(3, 2);
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(2, 1);
    await hanoi.moveDisk(2, 3);
    await hanoi.moveDisk(1, 3);

    expect(await hanoi.isWinBannerVisible()).toBe(true);
    await hanoi.winBannerContainsText('Solved in 9 moves');
    expect(await hanoi.perfectScoreCount()).toBe(0);
  });

  test('should ignore clicks after winning', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Solve optimally
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(1, 2);
    await hanoi.moveDisk(3, 2);
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(2, 1);
    await hanoi.moveDisk(2, 3);
    await hanoi.moveDisk(1, 3);

    expect(await hanoi.isWinBannerVisible()).toBe(true);

    // Clicks after win should be ignored
    await hanoi.clickPeg(3);
    expect(await hanoi.selectionIndicatorCount()).toBe(0);
    expect(await hanoi.moveCount()).toBe('7');
  });

  test('should hide hint text after winning', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Solve optimally
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(1, 2);
    await hanoi.moveDisk(3, 2);
    await hanoi.moveDisk(1, 3);
    await hanoi.moveDisk(2, 1);
    await hanoi.moveDisk(2, 3);
    await hanoi.moveDisk(1, 3);

    expect(await hanoi.isWinBannerVisible()).toBe(true);
    expect(await hanoi.hintText()).toBe('');
  });
});
