import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

const SCREENSHOTS_DIR = path.resolve('.a2r/screenshots');
const ROUTES = [{ name: 'root', path: '/' }];
const BASE_URL = 'http://localhost:5173';
const VIEWPORT = { width: 1280, height: 720 };
const MAX_DIFF_RATIO = 0.30;

async function run() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  const results = [];

  for (const route of ROUTES) {
    const routeDir = path.join(SCREENSHOTS_DIR, route.name);
    const reactPath = path.join(routeDir, 'react.png');
    const angularPath = path.join(routeDir, 'angular.png');

    // Check angular baseline exists
    if (!fs.existsSync(angularPath)) {
      console.error(`FAIL: Angular baseline missing at ${angularPath}`);
      results.push({ route: route.path, status: 'FAIL', reason: 'angular.png missing' });
      continue;
    }

    // Navigate and wait for networkidle + 3s settle
    console.log(`Navigating to ${BASE_URL}${route.path} ...`);
    await page.goto(`${BASE_URL}${route.path}`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    // Screenshot
    await page.screenshot({ path: reactPath, fullPage: false });
    console.log(`Saved: ${reactPath}`);

    // Pixel diff
    const angularBuf = fs.readFileSync(angularPath);
    const reactBuf = fs.readFileSync(reactPath);
    const angularPng = PNG.sync.read(angularBuf);
    const reactPng = PNG.sync.read(reactBuf);

    // If sizes differ, resize canvas to match (use larger dimensions)
    const width = Math.max(angularPng.width, reactPng.width);
    const height = Math.max(angularPng.height, reactPng.height);

    const padImage = (img, w, h) => {
      if (img.width === w && img.height === h) return img.data;
      const padded = new PNG({ width: w, height: h, fill: true });
      // fill with white
      for (let i = 0; i < padded.data.length; i += 4) {
        padded.data[i] = 255;
        padded.data[i + 1] = 255;
        padded.data[i + 2] = 255;
        padded.data[i + 3] = 255;
      }
      PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0);
      return padded.data;
    };

    const angularData = padImage(angularPng, width, height);
    const reactData = padImage(reactPng, width, height);

    const diffPng = new PNG({ width, height });
    const numDiffPixels = pixelmatch(angularData, reactData, diffPng.data, width, height, { threshold: 0.1 });
    const totalPixels = width * height;
    const diffRatio = numDiffPixels / totalPixels;
    const pass = diffRatio <= MAX_DIFF_RATIO;

    // Save diff image
    const diffPath = path.join(routeDir, 'diff.png');
    fs.writeFileSync(diffPath, PNG.sync.write(diffPng));

    console.log(`Route "${route.path}": diffPixels=${numDiffPixels}, totalPixels=${totalPixels}, diffRatio=${diffRatio.toFixed(4)} → ${pass ? 'PASS' : 'FAIL'}`);
    results.push({ route: route.path, diffRatio: diffRatio.toFixed(4), numDiffPixels, totalPixels, status: pass ? 'PASS' : 'FAIL' });
  }

  await browser.close();

  // Summary
  console.log('\n=== SCREENSHOT DIFF SUMMARY ===');
  for (const r of results) {
    console.log(`  ${r.route}: ${r.status} (diffRatio: ${r.diffRatio || 'N/A'})`);
  }
  const allPass = results.every(r => r.status === 'PASS');
  console.log(`\nOverall: ${allPass ? 'PASS' : 'FAIL'}`);
  process.exit(allPass ? 0 : 1);
}

run().catch(err => { console.error(err); process.exit(1); });
