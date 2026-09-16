// Standalone CJS mock backend for audit - replicates test/mock-backend/server.js
const express = require('express');
const app = express();
const PORT = process.env.MOCK_BACKEND_PORT || 4201;

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`[audit] Mock backend listening on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
