import { test, expect } from '@playwright/test';
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

// ─── Tests ─────────────────────────────────────────────────

test.describe('Angular App - Root Route', () => {
  test('should load the home page and display title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('my-angular-app');
  });

  test('should display the Angular logo SVG', async ({ page }) => {
    await page.goto('/');
    const svg = page.locator('.angular-logo');
    await expect(svg).toBeVisible();
  });

  test('should display the congratulations message', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('p')).toContainText('Congratulations! Your app is running.');
  });

  test('should display the divider', async ({ page }) => {
    await page.goto('/');
    const divider = page.locator('.divider');
    await expect(divider).toBeVisible();
    await expect(divider).toHaveAttribute('role', 'separator');
  });

  test('should render all 6 pill links', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('.pill-group .pill');
    await expect(pills).toHaveCount(6);
  });

  test('should have correct pill link texts', async ({ page }) => {
    await page.goto('/');
    const expectedTexts = [
      'Explore the Docs',
      'Learn with Tutorials',
      'Prompt and best practices for AI',
      'CLI Docs',
      'Angular Language Service',
      'Angular DevTools',
    ];
    for (const text of expectedTexts) {
      await expect(page.locator(`.pill:has-text("${text}")`)).toBeVisible();
    }
  });

  test('should have correct pill link hrefs', async ({ page }) => {
    await page.goto('/');
    const pills = page.locator('.pill-group .pill');
    const expectedHrefs = [
      'https://angular.dev',
      'https://angular.dev/tutorials',
      'https://angular.dev/ai/develop-with-ai',
      'https://angular.dev/tools/cli',
      'https://angular.dev/tools/language-service',
      'https://angular.dev/tools/devtools',
    ];
    for (let i = 0; i < expectedHrefs.length; i++) {
      await expect(pills.nth(i)).toHaveAttribute('href', expectedHrefs[i]);
      await expect(pills.nth(i)).toHaveAttribute('target', '_blank');
    }
  });

  test('should render social links (Github, X, Youtube)', async ({ page }) => {
    await page.goto('/');
    const socialLinks = page.locator('.social-links a');
    await expect(socialLinks).toHaveCount(3);
    await expect(socialLinks.nth(0)).toHaveAttribute('aria-label', 'Github');
    await expect(socialLinks.nth(1)).toHaveAttribute('aria-label', 'X');
    await expect(socialLinks.nth(2)).toHaveAttribute('aria-label', 'Youtube');
  });

  test('should have router-outlet present', async ({ page }) => {
    await page.goto('/');
    const outlet = page.locator('router-outlet');
    await expect(outlet).toBeAttached();
  });
});
