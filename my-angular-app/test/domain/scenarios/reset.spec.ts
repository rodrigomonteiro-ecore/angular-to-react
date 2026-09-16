import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Reset ────────────────────────────────────────────────

test.describe('Reset', () => {
  test('should reset the game', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    // Make a couple of moves
    await hanoi.moveDisk(1, 2);
    await hanoi.moveDisk(1, 3);

    // Reset
    await hanoi.clickReset();

    await hanoi.expectMoveCount('0');
    expect(await hanoi.diskCountOnPeg(1)).toBe(4);
  });
});
