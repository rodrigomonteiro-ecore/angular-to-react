const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.MOCK_BACKEND_PORT || 4201;

// No API endpoints needed — this app has no API surface.
// This server exists as a placeholder in case API calls are added later.
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const server = app.listen(PORT, () => {
  console.log(`Mock backend listening on http://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
