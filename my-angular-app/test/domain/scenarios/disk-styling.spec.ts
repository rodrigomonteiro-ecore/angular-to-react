import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Disk Styling ─────────────────────────────────────────

test.describe('Disk Styling', () => {
  test('disks should have different colors', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    expect(await hanoi.diskCountOnFirstPeg()).toBe(4);
    const colors = await hanoi.diskColorsOnPeg(1);
    expect(new Set(colors).size).toBe(4);
  });

  test('disks should have different widths (larger disk = wider)', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    const widths = await hanoi.diskWidthsOnPeg(1);
    // column-reverse: DOM order = largest first → smallest last
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]);
    }
  });

  test('should render disk labels with numbers', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    const labels = await hanoi.diskLabelsOnPeg(1);
    expect(labels).toEqual(['4', '3', '2', '1']);
  });

  test('disk colors cycle through 7 colors for 7 disks', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();
    await hanoi.selectDiskCount(7);

    expect(await hanoi.diskCountOnFirstPeg()).toBe(7);
    const colors = await hanoi.diskColorsOnPeg(1);
    expect(new Set(colors).size).toBe(7);
  });
});
