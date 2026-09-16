import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Page Load ────────────────────────────────────────────

test.describe('Tower of Hanoi - Page Load', () => {
  test('should display title and subtitle', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    const titleText = await hanoi.title();
    expect(titleText).toContain('Tower of Hanoi');
    expect(await hanoi.isSubtitleVisible()).toBe(true);
  });

  test('should show 3 pegs labeled A, B, C', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    expect(await hanoi.pegLabelCount()).toBe(3);
    const labels = await hanoi.pegLabels();
    expect(labels[0]).toBe('A');
    expect(labels[1]).toBe('B');
    expect(labels[2]).toBe('C');
  });

  test('should default to 4 disks on peg A', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    expect(await hanoi.activeDiskButtonText()).toBe('4');
    expect(await hanoi.diskCountOnPeg(1)).toBe(4);
    expect(await hanoi.diskCountOnPeg(2)).toBe(0);
    expect(await hanoi.diskCountOnPeg(3)).toBe(0);
  });

  test('should display moves=0 and optimal=15 for 4 disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    expect(await hanoi.moveCount()).toBe('0');
    expect(await hanoi.optimalMoves()).toBe('15');
  });

  test('should show initial hint text', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.hintContains('Click a peg to pick up its top disk');
  });

  test('should have router-outlet', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    expect(await hanoi.hasRouterOutlet()).toBe(true);
  });
});
