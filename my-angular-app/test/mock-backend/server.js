/**
 * Minimal mock backend for the Tower of Hanoi app.
 *
 * This app has NO API calls, so this server is a placeholder that
 * satisfies the Playwright webServer config. It serves a simple
 * health-check endpoint on port 4201.
 */
const http = require('http');

const PORT = process.env.MOCK_PORT || 4201;

const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok', message: 'No API endpoints needed for this app' }));
});

server.listen(PORT, () => {
  console.log(`Mock backend (placeholder) listening on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
