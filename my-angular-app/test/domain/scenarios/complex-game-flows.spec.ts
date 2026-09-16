import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Complex Game Flows ───────────────────────────────────

test.describe('Complex Game Flows', () => {
  test('should handle multiple moves and verify peg states', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Move disk 1: A→B
    await hanoi.moveDisk(1, 2);
    expect(await hanoi.diskCountOnPeg(1)).toBe(2);
    expect(await hanoi.diskCountOnPeg(2)).toBe(1);

    // Move disk 2: A→C
    await hanoi.moveDisk(1, 3);
    expect(await hanoi.diskCountOnPeg(1)).toBe(1);
    expect(await hanoi.diskCountOnPeg(3)).toBe(1);

    // Move disk 1: B→C
    await hanoi.moveDisk(2, 3);
    expect(await hanoi.diskCountOnPeg(2)).toBe(0);
    expect(await hanoi.diskCountOnPeg(3)).toBe(2);

    expect(await hanoi.moveCount()).toBe('3');
  });

  test('should reset after winning and play again', async ({ page }) => {
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

    // Reset and verify clean state
    await hanoi.clickReset();
    expect(await hanoi.winBannerCount()).toBe(0);
    await hanoi.expectMoveCount('0');
    expect(await hanoi.diskCountOnPeg(1)).toBe(3);
  });

  test('should solve with 5 disks using recursive algorithm', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(5);

    await hanoi.solveHanoi(5, 1, 3, 2);

    expect(await hanoi.isWinBannerVisible()).toBe(true);
    await hanoi.winBannerContainsText('Solved in 31 moves');
    expect(await hanoi.isPerfectScoreVisible()).toBe(true);
  });
});
