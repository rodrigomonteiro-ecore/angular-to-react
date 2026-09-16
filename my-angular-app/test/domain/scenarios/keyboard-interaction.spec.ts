import { test, expect } from '@playwright/test';
import { HanoiPage } from '../pom';
const { mergeCoverageFromPage } = require('../coverage-helper');


test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});


// ─── Keyboard Interaction ─────────────────────────────────

test.describe('Keyboard Interaction', () => {
  test('should select peg with Enter key', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.pressPegKey(1, 'Enter');

    expect(await hanoi.isSelectionIndicatorVisible()).toBe(true);
  });

  test('should select peg with Space key', async ({ page }) => {
    const hanoi = new HanoiPage(page);
    await hanoi.goto();

    await hanoi.pressPegKey(1, 'Space');

    expect(await hanoi.isSelectionIndicatorVisible()).toBe(true);
  });
});
