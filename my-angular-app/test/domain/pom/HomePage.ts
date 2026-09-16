import { type Page, type Locator, expect } from '@playwright/test';

/**
 * Page Object Model for the application home page.
 *
 * All CSS / DOM selectors are isolated here. Scenario files call only
 * the public methods on this class — never touch selectors directly.
 *
 * Method signatures are the contract shared between Angular and React.
 * When migrating to React, only the method **bodies** change.
 */
export class HomePage {
  private readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  // ── Navigation ────────────────────────────────────────────

  async navigate(): Promise<void> {
    await this.page.goto('/');
    // Wait for the main content to be present before interacting
    await this.page.locator('main.main').waitFor({ state: 'visible' });
  }

  // ── Title ─────────────────────────────────────────────────

  async getTitle(): Promise<string> {
    const heading = this.page.locator('h1');
    await expect(heading).toBeVisible();
    return (await heading.textContent()) ?? '';
  }

  // ── Angular Logo ──────────────────────────────────────────

  async isLogoVisible(): Promise<boolean> {
    const logo = this.page.locator('svg.angular-logo');
    await expect(logo).toBeVisible();
    return true;
  }

  // ── Congratulations Message ───────────────────────────────

  async getCongratulationsText(): Promise<string> {
    const paragraph = this.page.locator('.left-side p');
    await expect(paragraph).toBeVisible();
    return (await paragraph.textContent()) ?? '';
  }

  // ── Divider ───────────────────────────────────────────────

  async isDividerVisible(): Promise<boolean> {
    const divider = this.page.locator('.divider');
    await expect(divider).toBeVisible();
    return true;
  }

  async getDividerRole(): Promise<string> {
    const divider = this.page.locator('.divider');
    await expect(divider).toBeVisible();
    return (await divider.getAttribute('role')) ?? '';
  }

  // ── Pill Links ────────────────────────────────────────────

  async getPillCount(): Promise<number> {
    const pills = this.page.locator('.pill-group .pill');
    await expect(pills.first()).toBeVisible();
    return pills.count();
  }

  async getPillTexts(): Promise<string[]> {
    const pills = this.page.locator('.pill-group .pill');
    const count = await pills.count();
    const texts: string[] = [];
    for (let i = 0; i < count; i++) {
      const span = pills.nth(i).locator('span');
      texts.push(((await span.textContent()) ?? '').trim());
    }
    return texts;
  }

  async getPillHrefs(): Promise<string[]> {
    const pills = this.page.locator('.pill-group .pill');
    const count = await pills.count();
    const hrefs: string[] = [];
    for (let i = 0; i < count; i++) {
      const href = await pills.nth(i).getAttribute('href');
      if (href === null) throw new Error(`Pill at index ${i} has no href attribute`);
      hrefs.push(href);
    }
    return hrefs;
  }

  async getPillTargets(): Promise<string[]> {
    const pills = this.page.locator('.pill-group .pill');
    const count = await pills.count();
    const targets: string[] = [];
    for (let i = 0; i < count; i++) {
      const target = await pills.nth(i).getAttribute('target');
      if (target === null) throw new Error(`Pill at index ${i} has no target attribute`);
      targets.push(target);
    }
    return targets;
  }

  // ── Social Links ──────────────────────────────────────────

  async getSocialLinkCount(): Promise<number> {
    const links = this.page.locator('.social-links a');
    await expect(links.first()).toBeVisible();
    return links.count();
  }

  async getSocialLinkLabels(): Promise<string[]> {
    const links = this.page.locator('.social-links a');
    const count = await links.count();
    const labels: string[] = [];
    for (let i = 0; i < count; i++) {
      const label = await links.nth(i).getAttribute('aria-label');
      if (label === null) throw new Error(`Social link at index ${i} has no aria-label`);
      labels.push(label);
    }
    return labels;
  }

  // ── Router Outlet ─────────────────────────────────────────

  async isRouterOutletPresent(): Promise<boolean> {
    const outlet = this.page.locator('router-outlet');
    await expect(outlet).toBeAttached();
    return true;
  }
}
