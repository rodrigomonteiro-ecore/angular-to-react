import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Disk Count Selector ──────────────────────────────────

test.describe('Disk Count Selector', () => {
  test('should switch to 3 disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    expect(await hanoi.diskCountOnPeg(1)).toBe(3);
    expect(await hanoi.optimalMoves()).toBe('7');
  });

  test('should switch to 5 disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(5);

    expect(await hanoi.diskCountOnPeg(1)).toBe(5);
    expect(await hanoi.optimalMoves()).toBe('31');
  });

  test('should switch to 6 disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(6);

    expect(await hanoi.diskCountOnPeg(1)).toBe(6);
    expect(await hanoi.optimalMoves()).toBe('63');
  });

  test('should switch to 7 disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(7);

    expect(await hanoi.diskCountOnPeg(1)).toBe(7);
    expect(await hanoi.optimalMoves()).toBe('127');
  });

  test('should reset game when changing disk count', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    // Make one move, then change disk count — moves should reset to 0
    await hanoi.moveDisk(1, 2);
    expect(await hanoi.moveCount()).toBe('1');

    await hanoi.selectDiskCount(3);
    expect(await hanoi.moveCount()).toBe('0');
  });
});
