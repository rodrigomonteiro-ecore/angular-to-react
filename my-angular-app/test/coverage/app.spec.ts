import { test, expect, Page } from '@playwright/test';
const { mergeCoverageFromPage, resetCoverage } = require('./coverage-helper');
const { remapAndFilterCoverage } = require('./remap-coverage');

test.beforeAll(() => {
  resetCoverage();
});

test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});

test.afterAll(() => {
  remapAndFilterCoverage();
});

// ─── Helpers ───────────────────────────────────────────────

/** Click a peg by its aria-label (Peg 1 = A, Peg 2 = B, Peg 3 = C) */
async function clickPeg(page: Page, pegNumber: 1 | 2 | 3) {
  const peg = page.locator(`[aria-label="Peg ${pegNumber}"]`);
  await peg.waitFor({ state: 'visible' });
  await peg.click();
  // Small delay for Angular change detection
  await page.waitForTimeout(50);
}

/** Get the text of all disk labels in a peg (bottom to top) */
async function getDisksOnPeg(page: Page, pegNumber: 1 | 2 | 3): Promise<string[]> {
  const peg = page.locator(`[aria-label="Peg ${pegNumber}"]`);
  return peg.locator('.disk-label').allTextContents();
}

/** Click a disk-count button. Buttons are 3,4,5,6,7 (index 0-4). */
async function selectDiskCount(page: Page, n: 3 | 4 | 5 | 6 | 7) {
  const idx = n - 3; // 3→0, 4→1, 5→2, 6→3, 7→4
  await page.locator('.disk-buttons .disk-btn').nth(idx).click();
  // Wait for Angular to re-render with new disk count
  await page.locator('.disk-btn.active').filter({ hasText: String(n) }).waitFor();
}

/** Solve Tower of Hanoi recursively using peg clicks */
async function solveHanoi(page: Page, n: number, from: 1|2|3, to: 1|2|3, aux: 1|2|3) {
  if (n === 0) return;
  await solveHanoi(page, n - 1, from, aux, to);
  await clickPeg(page, from);
  await clickPeg(page, to);
  await solveHanoi(page, n - 1, aux, to, from);
}

// ─── Basic page load ───────────────────────────────────────

test.describe('Tower of Hanoi - Page Load', () => {
  test('should display title and subtitle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Tower of Hanoi');
    await expect(page.locator('.subtitle')).toBeVisible();
  });

  test('should show 3 pegs labeled A, B, C', async ({ page }) => {
    await page.goto('/');
    const pegLabels = page.locator('.peg-label');
    await expect(pegLabels).toHaveCount(3);
    await expect(pegLabels.nth(0)).toHaveText('A');
    await expect(pegLabels.nth(1)).toHaveText('B');
    await expect(pegLabels.nth(2)).toHaveText('C');
  });

  test('should default to 4 disks on peg A', async ({ page }) => {
    await page.goto('/');
    const activeBtn = page.locator('.disk-btn.active');
    await expect(activeBtn).toHaveText('4');

    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(4);

    const disksB = await getDisksOnPeg(page, 2);
    expect(disksB.length).toBe(0);
    const disksC = await getDisksOnPeg(page, 3);
    expect(disksC.length).toBe(0);
  });

  test('should display moves=0 and optimal=15 for 4 disks', async ({ page }) => {
    await page.goto('/');
    const stats = page.locator('.stat-value');
    await expect(stats.nth(0)).toHaveText('0');
    await expect(stats.nth(1)).toHaveText('15');
  });

  test('should show initial hint text', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.hint')).toContainText('Click a peg to pick up its top disk');
  });

  test('should have router-outlet', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('router-outlet')).toBeAttached();
  });
});

// ─── Disk count selector ───────────────────────────────────

test.describe('Disk Count Selector', () => {
  test('should switch to 3 disks', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);
    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(3);
    await expect(page.locator('.stat-value').nth(1)).toHaveText('7');
  });

  test('should switch to 5 disks', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 5);
    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(5);
    await expect(page.locator('.stat-value').nth(1)).toHaveText('31');
  });

  test('should switch to 6 disks', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 6);
    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(6);
    await expect(page.locator('.stat-value').nth(1)).toHaveText('63');
  });

  test('should switch to 7 disks', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 7);
    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(7);
    await expect(page.locator('.stat-value').nth(1)).toHaveText('127');
  });

  test('should reset game when changing disk count', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await clickPeg(page, 2);
    await expect(page.locator('.stat-value').nth(0)).toHaveText('1');

    await selectDiskCount(page, 3);
    await expect(page.locator('.stat-value').nth(0)).toHaveText('0');
  });
});

// ─── Selection mechanics ───────────────────────────────────

test.describe('Peg Selection', () => {
  test('should select a peg with disks and show indicator', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await expect(page.locator('.selection-indicator')).toBeVisible();
    await expect(page.locator('.selection-indicator')).toContainText('selected');
    await expect(page.locator('.hint')).toContainText('Click another peg to place the disk');
  });

  test('should NOT select an empty peg', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 2);
    await expect(page.locator('.selection-indicator')).toHaveCount(0);
    await expect(page.locator('.hint')).toContainText('Click a peg to pick up');
  });

  test('should deselect when clicking the same peg', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await expect(page.locator('.selection-indicator')).toBeVisible();
    await clickPeg(page, 1);
    await expect(page.locator('.selection-indicator')).toHaveCount(0);
  });
});

// ─── Move mechanics ────────────────────────────────────────

test.describe('Move Mechanics', () => {
  test('should make a valid move and increment counter', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await clickPeg(page, 2);
    await expect(page.locator('.stat-value').nth(0)).toHaveText('1');

    const disksB = await getDisksOnPeg(page, 2);
    expect(disksB.length).toBe(1);
  });

  test('should allow moving to an empty peg', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await clickPeg(page, 3);
    const disksC = await getDisksOnPeg(page, 3);
    expect(disksC.length).toBe(1);
  });

  test('should reject invalid move (larger disk on smaller)', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    // Move disk 1 from A to B
    await clickPeg(page, 1);
    await clickPeg(page, 2);

    // Move disk 2 from A to C
    await clickPeg(page, 1);
    await clickPeg(page, 3);

    // Try invalid: disk 2 on C → B (where smaller disk 1 is)
    await clickPeg(page, 3);
    await clickPeg(page, 2); // INVALID

    await expect(page.locator('.stat-value').nth(0)).toHaveText('2');

    // Selection switches to peg B
    const pegColumns = page.locator('.peg-column');
    await expect(pegColumns.nth(1)).toHaveClass(/selected/);
  });

  test('should switch selection on invalid move to peg with disks', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    // Move disk 1 from A to C
    await clickPeg(page, 1);
    await clickPeg(page, 3);

    // Select peg A (has disk 2,3), try move to C (has disk 1) - invalid
    await clickPeg(page, 1);
    await clickPeg(page, 3); // invalid, switches selection to C

    const pegColumns = page.locator('.peg-column');
    await expect(pegColumns.nth(2)).toHaveClass(/selected/);
  });

  test('should clear selection after valid move', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await clickPeg(page, 2);
    await expect(page.locator('.selection-indicator')).toHaveCount(0);
  });
});

// ─── Reset ─────────────────────────────────────────────────

test.describe('Reset', () => {
  test('should reset the game', async ({ page }) => {
    await page.goto('/');
    await clickPeg(page, 1);
    await clickPeg(page, 2);
    await clickPeg(page, 1);
    await clickPeg(page, 3);

    await page.locator('.reset-btn').click();

    await expect(page.locator('.stat-value').nth(0)).toHaveText('0');
    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(4);
  });
});

// ─── Win condition ─────────────────────────────────────────

test.describe('Win Condition', () => {
  test('should show win banner after solving with 3 disks (optimal)', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    // Optimal solve: A→C, A→B, C→B, A→C, B→A, B→C, A→C
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 2);
    await clickPeg(page, 3); await clickPeg(page, 2);
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 2); await clickPeg(page, 1);
    await clickPeg(page, 2); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 3);

    await expect(page.locator('.win-banner')).toBeVisible();
    await expect(page.locator('.win-banner')).toContainText('Solved in 7 moves');
    await expect(page.locator('.perfect')).toBeVisible();
    await expect(page.locator('.perfect')).toContainText('Perfect score');
  });

  test('should show win banner without perfect score (non-optimal)', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    // Add wasted moves first
    await clickPeg(page, 1); await clickPeg(page, 2); // A→B
    await clickPeg(page, 2); await clickPeg(page, 1); // B→A (undo)
    // Now solve normally (7 more = 9 total, non-optimal)
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 2);
    await clickPeg(page, 3); await clickPeg(page, 2);
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 2); await clickPeg(page, 1);
    await clickPeg(page, 2); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 3);

    await expect(page.locator('.win-banner')).toBeVisible();
    await expect(page.locator('.win-banner')).toContainText('Solved in 9 moves');
    await expect(page.locator('.perfect')).toHaveCount(0);
  });

  test('should ignore clicks after winning', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 2);
    await clickPeg(page, 3); await clickPeg(page, 2);
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 2); await clickPeg(page, 1);
    await clickPeg(page, 2); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 3);

    await expect(page.locator('.win-banner')).toBeVisible();

    // Clicks after win should be ignored
    await clickPeg(page, 3);
    await expect(page.locator('.selection-indicator')).toHaveCount(0);
    await expect(page.locator('.stat-value').nth(0)).toHaveText('7');
  });

  test('should hide hint text after winning', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 2);
    await clickPeg(page, 3); await clickPeg(page, 2);
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 2); await clickPeg(page, 1);
    await clickPeg(page, 2); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 3);

    await expect(page.locator('.win-banner')).toBeVisible();
    const hintText = await page.locator('.hint').textContent();
    expect(hintText?.trim()).toBe('');
  });
});

// ─── Disk colors and widths ────────────────────────────────

test.describe('Disk Styling', () => {
  test('disks should have different colors', async ({ page }) => {
    await page.goto('/');
    const disks = page.locator('.peg-column').first().locator('.disk');
    const count = await disks.count();
    expect(count).toBe(4);

    const colors = new Set<string>();
    for (let i = 0; i < count; i++) {
      const bg = await disks.nth(i).evaluate(el => getComputedStyle(el).backgroundColor);
      colors.add(bg);
    }
    expect(colors.size).toBe(4);
  });

  test('disks should have different widths (larger disk = wider)', async ({ page }) => {
    await page.goto('/');
    const disks = page.locator('.peg-column').first().locator('.disk');
    const count = await disks.count();

    const widths: number[] = [];
    for (let i = 0; i < count; i++) {
      const w = await disks.nth(i).evaluate(el => el.getBoundingClientRect().width);
      widths.push(w);
    }
    // column-reverse: DOM order = largest first → smallest last
    for (let i = 1; i < widths.length; i++) {
      expect(widths[i]).toBeLessThan(widths[i - 1]);
    }
  });

  test('should render disk labels with numbers', async ({ page }) => {
    await page.goto('/');
    const labels = await page.locator('.peg-column').first().locator('.disk-label').allTextContents();
    expect(labels).toEqual(['4', '3', '2', '1']);
  });

  test('disk colors cycle through 7 colors for 7 disks', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 7);
    const disks = page.locator('.peg-column').first().locator('.disk');
    const count = await disks.count();
    expect(count).toBe(7);

    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const bg = await disks.nth(i).evaluate(el => getComputedStyle(el).backgroundColor);
      colors.push(bg);
    }
    expect(new Set(colors).size).toBe(7);
  });
});

// ─── Keyboard interaction ──────────────────────────────────

test.describe('Keyboard Interaction', () => {
  test('should select peg with Enter key', async ({ page }) => {
    await page.goto('/');
    const pegA = page.locator('[aria-label="Peg 1"]');
    await pegA.press('Enter');
    await expect(page.locator('.selection-indicator')).toBeVisible();
  });

  test('should select peg with Space key', async ({ page }) => {
    await page.goto('/');
    const pegA = page.locator('[aria-label="Peg 1"]');
    await pegA.press('Space');
    await expect(page.locator('.selection-indicator')).toBeVisible();
  });
});

// ─── Complex game flows ────────────────────────────────────

test.describe('Complex Game Flows', () => {
  test('should handle multiple moves and verify peg states', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    // Move disk 1: A→B
    await clickPeg(page, 1);
    await clickPeg(page, 2);
    expect((await getDisksOnPeg(page, 1)).length).toBe(2);
    expect((await getDisksOnPeg(page, 2)).length).toBe(1);

    // Move disk 2: A→C
    await clickPeg(page, 1);
    await clickPeg(page, 3);
    expect((await getDisksOnPeg(page, 1)).length).toBe(1);
    expect((await getDisksOnPeg(page, 3)).length).toBe(1);

    // Move disk 1: B→C
    await clickPeg(page, 2);
    await clickPeg(page, 3);
    expect((await getDisksOnPeg(page, 2)).length).toBe(0);
    expect((await getDisksOnPeg(page, 3)).length).toBe(2);

    await expect(page.locator('.stat-value').nth(0)).toHaveText('3');
  });

  test('should reset after winning and play again', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 3);

    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 2);
    await clickPeg(page, 3); await clickPeg(page, 2);
    await clickPeg(page, 1); await clickPeg(page, 3);
    await clickPeg(page, 2); await clickPeg(page, 1);
    await clickPeg(page, 2); await clickPeg(page, 3);
    await clickPeg(page, 1); await clickPeg(page, 3);

    await expect(page.locator('.win-banner')).toBeVisible();

    await page.locator('.reset-btn').click();
    await expect(page.locator('.win-banner')).toHaveCount(0);
    await expect(page.locator('.stat-value').nth(0)).toHaveText('0');
    const disksA = await getDisksOnPeg(page, 1);
    expect(disksA.length).toBe(3);
  });

  test('should solve with 5 disks using recursive algorithm', async ({ page }) => {
    await page.goto('/');
    await selectDiskCount(page, 5);

    await solveHanoi(page, 5, 1, 3, 2);

    await expect(page.locator('.win-banner')).toBeVisible();
    await expect(page.locator('.win-banner')).toContainText('Solved in 31 moves');
    await expect(page.locator('.perfect')).toBeVisible();
  });
});
