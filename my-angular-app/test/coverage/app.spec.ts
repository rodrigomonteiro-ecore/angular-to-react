import { test, expect } from '@playwright/test';
<<<<<<< Updated upstream
import { collectCoverage, resetCoverage } from './coverage-helper';

// Delete stale coverage before entire suite
=======
const { mergeCoverageFromPage, resetCoverage } = require('./coverage-helper');
const { remapAndFilterCoverage } = require('./remap-coverage');

>>>>>>> Stashed changes
test.beforeAll(() => {
  resetCoverage();
});

<<<<<<< Updated upstream
// After every test, persist coverage
test.afterEach(async ({ page }) => {
  await collectCoverage(page);
});

test.describe('Root route /', () => {
  test('renders the main page with title and content', async ({ page }) => {
    await page.goto('/');

    // Wait for the Angular app to bootstrap
    await page.waitForSelector('main.main');

    // Verify the title "Hello, my-angular-app" is visible
    const heading = page.locator('h1');
    await expect(heading).toContainText('Hello, my-angular-app');

    // Verify the congratulations paragraph
    const paragraph = page.locator('p');
    await expect(paragraph.first()).toContainText('Congratulations! Your app is running.');
  });

  test('renders the Angular logo SVG', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    const logo = page.locator('svg.angular-logo');
    await expect(logo).toBeVisible();
  });

  test('renders all documentation link pills', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    // There should be 6 pill links
    const pills = page.locator('.pill-group a.pill');
    await expect(pills).toHaveCount(6);

    // Verify specific link titles
    await expect(pills.nth(0)).toContainText('Explore the Docs');
    await expect(pills.nth(1)).toContainText('Learn with Tutorials');
    await expect(pills.nth(2)).toContainText('Prompt and best practices for AI');
    await expect(pills.nth(3)).toContainText('CLI Docs');
    await expect(pills.nth(4)).toContainText('Angular Language Service');
    await expect(pills.nth(5)).toContainText('Angular DevTools');
  });

  test('documentation links have correct hrefs and open in new tab', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    const pills = page.locator('.pill-group a.pill');

    const expectedLinks = [
=======
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
>>>>>>> Stashed changes
      'https://angular.dev',
      'https://angular.dev/tutorials',
      'https://angular.dev/ai/develop-with-ai',
      'https://angular.dev/tools/cli',
      'https://angular.dev/tools/language-service',
      'https://angular.dev/tools/devtools',
    ];
<<<<<<< Updated upstream

    for (let i = 0; i < expectedLinks.length; i++) {
      await expect(pills.nth(i)).toHaveAttribute('href', expectedLinks[i]);
      await expect(pills.nth(i)).toHaveAttribute('target', '_blank');
      await expect(pills.nth(i)).toHaveAttribute('rel', 'noopener');
    }
  });

  test('renders social links (GitHub, X, YouTube)', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    const socialLinks = page.locator('.social-links a');
    await expect(socialLinks).toHaveCount(3);

    await expect(socialLinks.nth(0)).toHaveAttribute('aria-label', 'Github');
    await expect(socialLinks.nth(0)).toHaveAttribute('href', 'https://github.com/angular/angular');

    await expect(socialLinks.nth(1)).toHaveAttribute('aria-label', 'X');
    await expect(socialLinks.nth(1)).toHaveAttribute('href', 'https://x.com/angular');

    await expect(socialLinks.nth(2)).toHaveAttribute('aria-label', 'Youtube');
    await expect(socialLinks.nth(2)).toHaveAttribute('href', 'https://www.youtube.com/channel/UCbn1OgGei-DV7aSRo_HaAiw');
  });

  test('renders divider separator element', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    const divider = page.locator('.divider');
    await expect(divider).toBeVisible();
    await expect(divider).toHaveAttribute('role', 'separator');
  });

  test('router-outlet is present', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    // Verify router-outlet element exists in the DOM
    const routerOutlet = page.locator('router-outlet');
    await expect(routerOutlet).toBeAttached();
  });

  test('pill hover interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    // Hover over each pill to trigger any hover-related code paths
    const pills = page.locator('.pill-group a.pill');
    const count = await pills.count();
    for (let i = 0; i < count; i++) {
      await pills.nth(i).hover();
    }
  });

  test('social link hover interaction', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('main.main');

    const socialLinks = page.locator('.social-links a');
    const count = await socialLinks.count();
    for (let i = 0; i < count; i++) {
      await socialLinks.nth(i).hover();
    }
=======
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
>>>>>>> Stashed changes
  });
});
