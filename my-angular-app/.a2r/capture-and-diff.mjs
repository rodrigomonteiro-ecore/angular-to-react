import { chromium } from 'playwright';
import { readFileSync, writeFileSync } from 'fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import path from 'path';

const SCREENSHOTS_DIR = path.resolve('.a2r/screenshots/home');
const REACT_URL = 'http://localhost:4200/';
const MAX_DIFF_RATIO = 0.30;

async function main() {
  // Step 1: Capture React screenshot
  console.log('Launching browser for React screenshot...');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  console.log(`Navigating to ${REACT_URL}...`);
  await page.goto(REACT_URL, { waitUntil: 'networkidle' });

  // Extra 3s settle time
  console.log('Waiting 3s for settle...');
  await page.waitForTimeout(3000);

  const reactPath = path.join(SCREENSHOTS_DIR, 'react.png');
  await page.screenshot({ path: reactPath, fullPage: true });
  console.log(`React screenshot saved: ${reactPath}`);

  await browser.close();

  // Step 2: Pixel diff against Angular baseline
  const angularPath = path.join(SCREENSHOTS_DIR, 'angular.png');
  console.log(`\nDiffing:\n  Angular: ${angularPath}\n  React:   ${reactPath}`);

  const angularImg = PNG.sync.read(readFileSync(angularPath));
  const reactImg = PNG.sync.read(readFileSync(reactPath));

  const width = Math.max(angularImg.width, reactImg.width);
  const height = Math.max(angularImg.height, reactImg.height);

  // Resize images to same dimensions if needed
  const normalize = (img, w, h) => {
    if (img.width === w && img.height === h) return img;
    const out = new PNG({ width: w, height: h });
    // Fill with white
    for (let i = 0; i < out.data.length; i += 4) {
      out.data[i] = 255; out.data[i+1] = 255; out.data[i+2] = 255; out.data[i+3] = 255;
    }
    PNG.bitblt(img, out, 0, 0, img.width, img.height, 0, 0);
    return out;
  };

  const a = normalize(angularImg, width, height);
  const r = normalize(reactImg, width, height);

  const diff = new PNG({ width, height });
  const numDiffPixels = pixelmatch(a.data, r.data, diff.data, width, height, { threshold: 0.1 });

  const totalPixels = width * height;
  const diffRatio = numDiffPixels / totalPixels;

  // Save diff image
  const diffPath = path.join(SCREENSHOTS_DIR, 'diff.png');
  writeFileSync(diffPath, PNG.sync.write(diff));

  console.log(`\n=== DIFF RESULTS ===`);
  console.log(`Resolution:      ${width}x${height}`);
  console.log(`Total pixels:    ${totalPixels}`);
  console.log(`Diff pixels:     ${numDiffPixels}`);
  console.log(`Diff ratio:      ${diffRatio.toFixed(4)} (${(diffRatio * 100).toFixed(2)}%)`);
  console.log(`Max allowed:     ${MAX_DIFF_RATIO} (${(MAX_DIFF_RATIO * 100).toFixed(0)}%)`);
  console.log(`Result:          ${diffRatio <= MAX_DIFF_RATIO ? 'PASS ✅' : 'FAIL ❌'}`);

  process.exit(diffRatio <= MAX_DIFF_RATIO ? 0 : 1);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(2);
});
