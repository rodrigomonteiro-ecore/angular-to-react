import { test, expect } from '@playwright/test';
import { HomePage } from '../pom';

const { mergeCoverageFromPage, resetCoverage } = require('../coverage-helper');
const { remapAndFilterCoverage } = require('../remap-coverage');

// ── Coverage lifecycle ──────────────────────────────────────
test.beforeAll(() => {
  resetCoverage();
});

test.afterEach(async ({ page }) => {
  await mergeCoverageFromPage(page);
});

test.afterAll(() => {
  remapAndFilterCoverage();
});

// ── Scenarios: Root Route ("/") ─────────────────────────────
//
// Each test uses **only** POM methods — no selectors, no
// framework-specific details.  When the POM is swapped for the
// React variant the scenarios run unchanged.

test.describe('Home page — title & hero', () => {
  test('displays the application title', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const title = await home.getTitle();
    expect(title).toContain('my-angular-app');
  });

  test('shows the framework logo', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const visible = await home.isLogoVisible();
    expect(visible).toBe(true);
  });

  test('shows the congratulations message', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const text = await home.getCongratulationsText();
    expect(text).toContain('Congratulations! Your app is running.');
  });
});

test.describe('Home page — layout', () => {
  test('displays a divider with separator role', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const visible = await home.isDividerVisible();
    expect(visible).toBe(true);

    const role = await home.getDividerRole();
    expect(role).toBe('separator');
  });

  test('has a router outlet present', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const present = await home.isRouterOutletPresent();
    expect(present).toBe(true);
  });
});

test.describe('Home page — pill links', () => {
  const expectedTexts = [
    'Explore the Docs',
    'Learn with Tutorials',
    'Prompt and best practices for AI',
    'CLI Docs',
    'Angular Language Service',
    'Angular DevTools',
  ];

  const expectedHrefs = [
    'https://angular.dev',
    'https://angular.dev/tutorials',
    'https://angular.dev/ai/develop-with-ai',
    'https://angular.dev/tools/cli',
    'https://angular.dev/tools/language-service',
    'https://angular.dev/tools/devtools',
  ];

  test('renders exactly 6 pill links', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const count = await home.getPillCount();
    expect(count).toBe(6);
  });

  test('pill links have the correct text', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const texts = await home.getPillTexts();
    expect(texts).toEqual(expectedTexts);
  });

  test('pill links have the correct hrefs', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const hrefs = await home.getPillHrefs();
    expect(hrefs).toEqual(expectedHrefs);
  });

  test('pill links open in a new tab', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const targets = await home.getPillTargets();
    for (const target of targets) {
      expect(target).toBe('_blank');
    }
  });
});

test.describe('Home page — social links', () => {
  test('renders 3 social links with correct labels', async ({ page }) => {
    const home = new HomePage(page);
    await home.navigate();

    const count = await home.getSocialLinkCount();
    expect(count).toBe(3);

    const labels = await home.getSocialLinkLabels();
    expect(labels).toEqual(['Github', 'X', 'Youtube']);
  });
});
