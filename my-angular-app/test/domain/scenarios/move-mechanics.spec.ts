import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Move Mechanics ───────────────────────────────────────

test.describe('Move Mechanics', () => {
  test('should make a valid move and increment counter', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.moveDisk(1, 2);

    expect(await hanoi.moveCount()).toBe('1');
    expect(await hanoi.diskCountOnPeg(2)).toBe(1);
  });

  test('should allow moving to an empty peg', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.moveDisk(1, 3);

    expect(await hanoi.diskCountOnPeg(3)).toBe(1);
  });

  test('should reject invalid move (larger disk on smaller)', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Move disk 1: A→B
    await hanoi.moveDisk(1, 2);
    // Move disk 2: A→C
    await hanoi.moveDisk(1, 3);
    // Try invalid: disk 2 on C → B (where smaller disk 1 sits)
    await hanoi.clickPeg(3);
    await hanoi.clickPeg(2); // INVALID

    // Move counter stays at 2 (invalid move not counted)
    expect(await hanoi.moveCount()).toBe('2');
    // Selection switches to peg B
    await hanoi.isPegSelected(2);
  });

  test('should switch selection on invalid move to peg with disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(3);

    // Move disk 1: A→C
    await hanoi.moveDisk(1, 3);
    // Select peg A (disk 2,3), try move to C (disk 1) — invalid
    await hanoi.clickPeg(1);
    await hanoi.clickPeg(3); // invalid, switches selection to C

    await hanoi.isPegSelected(3);
  });

  test('should clear selection after valid move', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.moveDisk(1, 2);

    expect(await hanoi.selectionIndicatorCount()).toBe(0);
  });
});
