/**
 * Mock backend server for my-angular-app coverage testing.
 *
 * Since this Angular app has no API calls (api_surface is empty),
 * this server only serves the instrumented static files.
 * It also exposes a POST /coverage endpoint so Playwright tests
 * can push window.__coverage__ data for collection.
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const PORT = process.env.MOCK_PORT || 4201;
const INSTRUMENTED_DIR = path.resolve(__dirname, '..', '..', 'instrumented');
const COVERAGE_OUTPUT = path.resolve(__dirname, '..', '..', '.a2r', 'coverage-raw.json');

const app = express();
app.use(express.json({ limit: '50mb' }));

// Serve instrumented static files
app.use(express.static(INSTRUMENTED_DIR));

// Coverage collection endpoint
app.post('/coverage', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'No coverage data' });
  }

  // Deep-merge: read existing, merge counters, write back
  let existing = {};
  if (fs.existsSync(COVERAGE_OUTPUT)) {
    try {
      existing = JSON.parse(fs.readFileSync(COVERAGE_OUTPUT, 'utf-8'));
    } catch {
      existing = {};
    }
  }

  for (const [filePath, fileCov] of Object.entries(incoming)) {
    if (!existing[filePath]) {
      existing[filePath] = fileCov;
    } else {
      // Merge statement counters
      const es = existing[filePath].s;
      const is_ = fileCov.s;
      for (const key of Object.keys(is_)) {
        es[key] = (es[key] || 0) + is_[key];
      }
      // Merge branch counters
      const eb = existing[filePath].b;
      const ib = fileCov.b;
      for (const key of Object.keys(ib)) {
        if (!eb[key]) {
          eb[key] = ib[key];
        } else {
          for (let i = 0; i < ib[key].length; i++) {
            eb[key][i] = (eb[key][i] || 0) + ib[key][i];
          }
        }
      }
      // Merge function counters
      const ef = existing[filePath].f;
      const if_ = fileCov.f;
      for (const key of Object.keys(if_)) {
        ef[key] = (ef[key] || 0) + if_[key];
      }
    }
  }

  fs.mkdirSync(path.dirname(COVERAGE_OUTPUT), { recursive: true });
  fs.writeFileSync(COVERAGE_OUTPUT, JSON.stringify(existing, null, 2));
  res.json({ ok: true });
});

// SPA fallback — serve index.html for any non-file route
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(INSTRUMENTED_DIR, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`Mock backend serving instrumented app on http://localhost:${PORT}`);
  // Write PID file
  const pidDir = path.resolve(__dirname, '..', '..', '.a2r', 'pids');
  fs.mkdirSync(pidDir, { recursive: true });
  fs.writeFileSync(path.join(pidDir, 'mock-backend.pid'), String(process.pid));
});

module.exports = { app, server };
