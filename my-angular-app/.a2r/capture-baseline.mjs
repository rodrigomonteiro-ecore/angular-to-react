import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4202';
const SCREENSHOTS_DIR = join(import.meta.dirname, 'screenshots');

const routes = [
  { path: '/', folder: 'home' },
];

async function capture() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
  });

  for (const route of routes) {
    const page = await context.newPage();
    const url = `${BASE_URL}${route.path}`;
    console.log(`Navigating to ${url} ...`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

    // 3-second settle time for CSS animations
    console.log('Waiting 3s for animations to settle...');
    await page.waitForTimeout(3000);

    const outDir = join(SCREENSHOTS_DIR, route.folder);
    mkdirSync(outDir, { recursive: true });

    const outPath = join(outDir, 'angular.png');
    await page.screenshot({ path: outPath, fullPage: true });
    console.log(`✅ Saved ${outPath}`);

    await page.close();
  }

  await browser.close();
  console.log('Done — all baseline screenshots captured.');
}

capture().catch((err) => {
  console.error('Screenshot capture failed:', err);
  process.exit(1);
});
