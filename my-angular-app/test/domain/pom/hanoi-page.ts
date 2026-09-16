import { Page, expect, Locator } from '@playwright/test';

/**
 * Page Object Model for the Tower of Hanoi game.
 *
 * All CSS / aria / role selectors live here. Scenario files call
 * only these domain-language methods and never touch the DOM directly.
 *
 * Method signatures are the stable contract — when migrating from
 * Angular to React only the method **bodies** change.
 *
 * React port notes:
 * - CSS Modules hash class names, so bare `.foo` selectors won't work.
 *   We use `[class*="foo"]` for partial matching, or prefer ARIA/role/text.
 * - Peg columns have aria-label="Peg N" and role="button" — ideal selectors.
 * - Disks have aria-label="Disk N".
 * - React Router has no <router-outlet>; we check for React's #root instead.
 */
export class HanoiPage {
  constructor(private readonly page: Page) {}

  // ─── Navigation ────────────────────────────────────────────

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  // ─── Page header ───────────────────────────────────────────

  async title(): Promise<string> {
    const el = this.page.locator('h1');
    await el.waitFor({ state: 'visible' });
    return (await el.textContent())!;
  }

  async isSubtitleVisible(): Promise<boolean> {
    const el = this.page.locator('[class*="subtitle"]');
    await el.waitFor({ state: 'visible' });
    return el.isVisible();
  }

  // ─── Peg labels ────────────────────────────────────────────

  async pegLabels(): Promise<string[]> {
    const labels = this.page.locator('[class*="peg-label"]');
    await expect(labels).not.toHaveCount(0);
    return labels.allTextContents();
  }

  async pegLabelCount(): Promise<number> {
    return this.page.locator('[class*="peg-label"]').count();
  }

  // ─── Disk-count selector ───────────────────────────────────

  async activeDiskButtonText(): Promise<string> {
    const btn = this.page.locator('[class*="disk-btn"][class*="active"]');
    await btn.waitFor({ state: 'visible' });
    return (await btn.textContent())!.trim();
  }

  async selectDiskCount(n: 3 | 4 | 5 | 6 | 7): Promise<void> {
    const idx = n - 3;
    await this.page.locator('[class*="disk-buttons"] button').nth(idx).click();
    await this.page
      .locator('[class*="disk-btn"][class*="active"]')
      .filter({ hasText: String(n) })
      .waitFor();
  }

  // ─── Disks on a peg ───────────────────────────────────────

  async diskLabelsOnPeg(pegNumber: 1 | 2 | 3): Promise<string[]> {
    const peg = this.page.locator(`[aria-label="Peg ${pegNumber}"]`);
    return peg.locator('[class*="disk-label"]').allTextContents();
  }

  async diskCountOnPeg(pegNumber: 1 | 2 | 3): Promise<number> {
    return (await this.diskLabelsOnPeg(pegNumber)).length;
  }

  // ─── Stats (moves / optimal) ──────────────────────────────

  async moveCount(): Promise<string> {
    const el = this.page.locator('[class*="stat-value"]').nth(0);
    await el.waitFor({ state: 'visible' });
    return (await el.textContent())!.trim();
  }

  async expectMoveCount(expected: string): Promise<void> {
    await expect(this.page.locator('[class*="stat-value"]').nth(0)).toHaveText(expected);
  }

  async optimalMoves(): Promise<string> {
    const el = this.page.locator('[class*="stat-value"]').nth(1);
    await el.waitFor({ state: 'visible' });
    return (await el.textContent())!.trim();
  }

  async expectOptimalMoves(expected: string): Promise<void> {
    await expect(this.page.locator('[class*="stat-value"]').nth(1)).toHaveText(expected);
  }

  // ─── Hint ─────────────────────────────────────────────────

  async hintText(): Promise<string> {
    const el = this.page.locator('[class*="hint"]');
    return ((await el.textContent()) ?? '').trim();
  }

  async hintContains(text: string): Promise<void> {
    await expect(this.page.locator('[class*="hint"]')).toContainText(text);
  }

  // ─── Router-outlet equivalent (React: check #root mount) ──

  async hasRouterOutlet(): Promise<boolean> {
    // React Router renders into #root — no <router-outlet> element.
    // Return true when the React app has mounted inside #root.
    return (await this.page.locator('#root').count()) > 0;
  }

  // ─── Peg interaction ──────────────────────────────────────

  async clickPeg(pegNumber: 1 | 2 | 3): Promise<void> {
    const peg = this.page.locator(`[aria-label="Peg ${pegNumber}"]`);
    await peg.waitFor({ state: 'visible' });
    await peg.click();
    await this.page.waitForTimeout(50);
  }

  async pressPegKey(pegNumber: 1 | 2 | 3, key: string): Promise<void> {
    const peg = this.page.locator(`[aria-label="Peg ${pegNumber}"]`);
    await peg.press(key);
    await this.page.waitForTimeout(50);
  }

  // ─── Selection indicator ──────────────────────────────────

  async isSelectionIndicatorVisible(): Promise<boolean> {
    return (await this.page.locator('[class*="selection-indicator"]').count()) > 0 &&
           (await this.page.locator('[class*="selection-indicator"]').first().isVisible());
  }

  async selectionIndicatorCount(): Promise<number> {
    return this.page.locator('[class*="selection-indicator"]').count();
  }

  async selectionIndicatorContainsText(text: string): Promise<void> {
    await expect(this.page.locator('[class*="selection-indicator"]')).toContainText(text);
  }

  async isPegSelected(pegNumber: 1 | 2 | 3): Promise<void> {
    const col = this.page.locator(`[aria-label="Peg ${pegNumber}"]`);
    await expect(col).toHaveClass(/selected/);
  }

  // ─── Reset ────────────────────────────────────────────────

  async clickReset(): Promise<void> {
    const btn = this.page.locator('[class*="reset-btn"]');
    await btn.waitFor({ state: 'visible' });
    await btn.click();
    // Wait for React state update after reset
    await this.page.waitForTimeout(100);
  }

  // ─── Win banner ───────────────────────────────────────────

  async isWinBannerVisible(): Promise<boolean> {
    const banner = this.page.locator('[class*="win-banner"]');
    await banner.waitFor({ state: 'visible', timeout: 5000 });
    return banner.isVisible();
  }

  async winBannerCount(): Promise<number> {
    return this.page.locator('[class*="win-banner"]').count();
  }

  async winBannerContainsText(text: string): Promise<void> {
    await expect(this.page.locator('[class*="win-banner"]')).toContainText(text);
  }

  async isPerfectScoreVisible(): Promise<boolean> {
    return (await this.page.locator('[class*="perfect"]').count()) > 0;
  }

  async perfectScoreCount(): Promise<number> {
    return this.page.locator('[class*="perfect"]').count();
  }

  async perfectScoreContainsText(text: string): Promise<void> {
    await expect(this.page.locator('[class*="perfect"]')).toContainText(text);
  }

  // ─── Disk styling ─────────────────────────────────────────

  async diskColorsOnPeg(pegNumber: 1 | 2 | 3): Promise<string[]> {
    const peg = this.page.locator(`[aria-label="Peg ${pegNumber}"]`);
    const disks = peg.locator('[aria-label^="Disk"]');
    const count = await disks.count();
    if (count === 0) throw new Error(`No disks found on peg ${pegNumber}`);
    const colors: string[] = [];
    for (let i = 0; i < count; i++) {
      const bg = await disks.nth(i).evaluate(el => getComputedStyle(el).backgroundColor);
      colors.push(bg);
    }
    return colors;
  }

  async diskWidthsOnPeg(pegNumber: 1 | 2 | 3): Promise<number[]> {
    const peg = this.page.locator(`[aria-label="Peg ${pegNumber}"]`);
    const disks = peg.locator('[aria-label^="Disk"]');
    const count = await disks.count();
    if (count === 0) throw new Error(`No disks found on peg ${pegNumber}`);
    const widths: number[] = [];
    for (let i = 0; i < count; i++) {
      const w = await disks.nth(i).evaluate(el => el.getBoundingClientRect().width);
      widths.push(w);
    }
    return widths;
  }

  async diskCountOnFirstPeg(): Promise<number> {
    const peg = this.page.locator('[aria-label="Peg 1"]');
    return peg.locator('[aria-label^="Disk"]').count();
  }

  // ─── Composite helpers ────────────────────────────────────

  /** Move a disk from one peg to another (select source, then target). */
  async moveDisk(from: 1 | 2 | 3, to: 1 | 2 | 3): Promise<void> {
    await this.clickPeg(from);
    await this.clickPeg(to);
  }

  /**
   * Solve Tower of Hanoi recursively.
   * Moves n disks from `from` to `to` using `aux` as auxiliary.
   */
  async solveHanoi(
    n: number,
    from: 1 | 2 | 3,
    to: 1 | 2 | 3,
    aux: 1 | 2 | 3,
  ): Promise<void> {
    if (n === 0) return;
    await this.solveHanoi(n - 1, from, aux, to);
    await this.moveDisk(from, to);
    await this.solveHanoi(n - 1, aux, to, from);
  }
}
