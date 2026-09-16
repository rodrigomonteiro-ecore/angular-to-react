/**
 * Capture Angular baseline screenshots for all routes.
 * Uses Playwright to navigate to each route, wait for networkidle + 3s settle,
 * then capture a full-page screenshot.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = process.env.BASE_URL || 'http://localhost:4201';
const SCREENSHOTS_DIR = resolve(__dirname, 'screenshots');

const routes = [
  { path: '/', name: 'root' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  for (const route of routes) {
    const page = await context.newPage();
    const url = `${BASE_URL}${route.path}`;
    console.log(`Navigating to ${url} ...`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    // 3-second settle time
    await page.waitForTimeout(3000);

    const outDir = resolve(SCREENSHOTS_DIR, route.name);
    mkdirSync(outDir, { recursive: true });

    const outPath = resolve(outDir, 'angular.png');
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`  ✓ Saved ${outPath}`);

    await page.close();
  }

  await browser.close();
  console.log('Done — all baseline screenshots captured.');
}

main().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
