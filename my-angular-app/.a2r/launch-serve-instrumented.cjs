// Standalone CJS instrumented-app server for audit - replicates test/domain/serve-instrumented.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.APP_PORT || 4200;
const INSTRUMENTED_DIR = path.resolve(__dirname, '..', 'instrumented');

app.use(express.static(INSTRUMENTED_DIR));

// SPA fallback
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(INSTRUMENTED_DIR, 'index.html'));
});

const server = app.listen(PORT, () => {
  console.log(`[audit] Instrumented app serving from ${INSTRUMENTED_DIR} on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
