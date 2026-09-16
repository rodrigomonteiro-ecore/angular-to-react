const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default;

const REPO = path.resolve(__dirname, '..');
const SCREENSHOTS_DIR = path.join(REPO, '.a2r', 'screenshots', 'root');
const REACT_URL = 'http://localhost:5173/';
const ANGULAR_PNG = path.join(SCREENSHOTS_DIR, 'angular.png');
const REACT_PNG = path.join(SCREENSHOTS_DIR, 'react.png');
const DIFF_PNG = path.join(SCREENSHOTS_DIR, 'diff.png');
const MAX_DIFF_RATIO = 0.30;

(async () => {
  // Verify angular baseline exists
  if (!fs.existsSync(ANGULAR_PNG)) {
    console.error('FAIL: angular.png baseline not found at', ANGULAR_PNG);
    process.exit(1);
  }

  // Launch browser and capture React screenshot
  console.log('Launching browser for React screenshot...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  try {
    console.log('Navigating to', REACT_URL);
    await page.goto(REACT_URL, { waitUntil: 'networkidle', timeout: 30000 });
    // 3s settle time
    console.log('Waiting 3s for settle...');
    await page.waitForTimeout(3000);

    console.log('Capturing screenshot...');
    await page.screenshot({ path: REACT_PNG, fullPage: true });
    console.log('React screenshot saved to', REACT_PNG);
  } finally {
    await browser.close();
  }

  // Pixel diff
  console.log('Running pixel diff...');
  const angularImg = PNG.sync.read(fs.readFileSync(ANGULAR_PNG));
  const reactImg = PNG.sync.read(fs.readFileSync(REACT_PNG));

  // Use the dimensions of the angular baseline
  const width = angularImg.width;
  const height = angularImg.height;

  console.log(`Angular dimensions: ${angularImg.width}x${angularImg.height}`);
  console.log(`React dimensions:   ${reactImg.width}x${reactImg.height}`);

  // If dimensions differ, we need to resize/crop one to match
  // Create canvases of matching size
  const maxW = Math.max(angularImg.width, reactImg.width);
  const maxH = Math.max(angularImg.height, reactImg.height);

  function padImage(img, targetW, targetH) {
    if (img.width === targetW && img.height === targetH) return img;
    const padded = new PNG({ width: targetW, height: targetH, fill: true });
    // Fill with white
    for (let i = 0; i < padded.data.length; i += 4) {
      padded.data[i] = 255;
      padded.data[i + 1] = 255;
      padded.data[i + 2] = 255;
      padded.data[i + 3] = 255;
    }
    PNG.bitblt(img, padded, 0, 0, img.width, img.height, 0, 0);
    return padded;
  }

  const a = padImage(angularImg, maxW, maxH);
  const r = padImage(reactImg, maxW, maxH);

  const diff = new PNG({ width: maxW, height: maxH });
  const numDiffPixels = pixelmatch(a.data, r.data, diff.data, maxW, maxH, {
    threshold: 0.1
  });

  const totalPixels = maxW * maxH;
  const diffRatio = numDiffPixels / totalPixels;

  fs.writeFileSync(DIFF_PNG, PNG.sync.write(diff));
  console.log(`\nDiff saved to ${DIFF_PNG}`);
  console.log(`Total pixels:    ${totalPixels}`);
  console.log(`Diff pixels:     ${numDiffPixels}`);
  console.log(`Diff ratio:      ${diffRatio.toFixed(4)} (${(diffRatio * 100).toFixed(2)}%)`);
  console.log(`Threshold:       ${MAX_DIFF_RATIO} (${(MAX_DIFF_RATIO * 100).toFixed(0)}%)`);

  if (diffRatio <= MAX_DIFF_RATIO) {
    console.log(`\n✅ PASS — route "/" diff ratio ${(diffRatio * 100).toFixed(2)}% is within ${(MAX_DIFF_RATIO * 100).toFixed(0)}% threshold`);
    process.exit(0);
  } else {
    console.log(`\n❌ FAIL — route "/" diff ratio ${(diffRatio * 100).toFixed(2)}% exceeds ${(MAX_DIFF_RATIO * 100).toFixed(0)}% threshold`);
    process.exit(1);
  }
})();
