#!/usr/bin/env node
/**
 * Tower of Hanoi – text-mode server
 * Works with Lynx, w3m, elinks, curl, and any plain HTML browser.
 * No JavaScript, no CSS classes, no SVG — pure HTML forms.
 *
 * Usage:  node server-text.js [port]
 * Then open:  lynx http://localhost:3000/hanoi
 */

const http = require('http');
const PORT = parseInt(process.argv[2] || '3000', 10);

// ── Game logic ────────────────────────────────────────────────────────────────

function initPegs(n) {
  const pegs = [[], [], []];
  for (let i = n; i >= 1; i--) pegs[0].push(i);
  return pegs;
}

function minMoves(n) {
  return Math.pow(2, n) - 1;
}

/** Encode pegs as a compact string: "4,3,2,1||" */
function encodePegs(pegs) {
  return pegs.map(p => p.join(',')).join('|');
}

/** Decode back to [[],[],[]] */
function decodePegs(str) {
  if (!str) return null;
  return str.split('|').map(s => (s === '' ? [] : s.split(',').map(Number)));
}

function diskCount(pegs) {
  return pegs.reduce((sum, p) => sum + p.length, 0);
}

function isWon(pegs) {
  return pegs[2].length === diskCount(pegs);
}

function applyMove(pegs, from, to) {
  // Returns new pegs on success, null on illegal move
  if (from < 0 || from > 2 || to < 0 || to > 2 || from === to) return null;
  if (pegs[from].length === 0) return null;
  const topFrom = pegs[from][pegs[from].length - 1];
  if (pegs[to].length > 0 && pegs[to][pegs[to].length - 1] < topFrom) return null;

  const next = pegs.map(p => [...p]);
  next[to].push(next[from].pop());
  return next;
}

// ── ASCII art rendering ───────────────────────────────────────────────────────

const PEG_NAMES = ['Left (A)', 'Middle (B)', 'Right (C)'];

function center(str, width) {
  const pad = Math.floor((width - str.length) / 2);
  return ' '.repeat(Math.max(0, pad)) + str + ' '.repeat(Math.max(0, width - str.length - pad));
}

function renderBoard(pegs) {
  const n = diskCount(pegs);
  // Largest disk label: [===============N===============]
  // size N has (N*2-1) '=' on each side plus 2 brackets plus digits
  const maxLabel = `[${'='.repeat(n * 2 - 1)}${n}${'='.repeat(n * 2 - 1)}]`;
  const pegWidth = maxLabel.length + 2;  // +2 side padding so rod is centred
  const gap = '   ';

  // Build each peg column as lines from top → bottom
  const columns = pegs.map(peg => {
    const lines = [];

    // peg array: index 0 = bottom (largest), last index = top (smallest)
    // Visual order top→bottom: empty rod rows first, then disks from top→bottom
    // "top of stack" = peg[peg.length - 1], "bottom" = peg[0]
    const emptyRows = n - peg.length;  // rod-only rows above the disk stack

    // Empty rod rows
    for (let r = 0; r < emptyRows; r++) {
      lines.push(center('|', pegWidth));
    }

    // Disk rows: render from smallest (top of stack) down to largest (bottom)
    for (let i = peg.length - 1; i >= 0; i--) {
      const size = peg[i];
      const dashes = '='.repeat(size * 2 - 1);
      const label = `[${dashes}${size}${dashes}]`;
      lines.push(center(label, pegWidth));
    }

    // Base
    lines.push('='.repeat(pegWidth));

    return lines;
  });

  // Merge columns side by side (all columns have n+1 lines)
  const rows = [];
  for (let r = 0; r <= n; r++) {
    rows.push(columns.map(col => col[r]).join(gap));
  }

  // Labels row — each label centred under its column
  const labelRow = PEG_NAMES.map(name => center(name, pegWidth)).join(gap);

  return rows.join('\n') + '\n' + labelRow;
}

// ── HTML helpers ──────────────────────────────────────────────────────────────

function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pegOptions(selected, label) {
  return [0, 1, 2]
    .map(i => `<option value="${i}"${selected === i ? ' selected' : ''}>${PEG_NAMES[i]}</option>`)
    .join('\n        ');
}

function buildPage({ pegs, moves, error, message, n }) {
  const won = isWon(pegs);
  const board = renderBoard(pegs);
  const encoded = escHtml(encodePegs(pegs));
  const optimal = minMoves(n);

  // Which pegs have a disk on top (for the "from" selector)
  const hasDisk = pegs.map(p => p.length > 0);

  let statusLine = '';
  if (won) {
    statusLine = `\n*** YOU WIN! Solved in ${moves} move${moves !== 1 ? 's' : ''} (optimal: ${optimal}) ***\n`;
  } else if (error) {
    statusLine = `\n! ${escHtml(error)}\n`;
  } else if (message) {
    statusLine = `\n> ${escHtml(message)}\n`;
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Tower of Hanoi (Text Mode)</title>
</head>
<body>
<h1>Tower of Hanoi</h1>
<p>Move all disks from Left (A) to Right (C).<br>
You may only place a smaller disk on a larger one.</p>
<p>Disks: ${n} | Moves: ${moves} | Optimal: ${optimal}</p>
<hr>
<pre>
${board}
</pre>
<hr>
${statusLine ? `<pre>${statusLine}</pre>` : ''}

${won ? `
<form method="GET" action="/hanoi">
  <p>Play again?</p>
  <label for="newn">Number of disks (2-8):</label>
  <input type="number" id="newn" name="n" value="${n}" min="2" max="8">
  <input type="submit" value="New Game">
</form>
` : `
<form method="POST" action="/hanoi/move">
  <input type="hidden" name="pegs" value="${encoded}">
  <input type="hidden" name="moves" value="${escHtml(String(moves))}">
  <input type="hidden" name="n" value="${escHtml(String(n))}">

  <p>
    <label for="from">Move from:</label>
    <select id="from" name="from">
      ${pegOptions(-1, 'from')}
    </select>
  </p>
  <p>
    <label for="to">to:</label>
    <select id="to" name="to">
      ${pegOptions(-1, 'to')}
    </select>
  </p>
  <p><input type="submit" value="Move Disk"></p>
</form>

<form method="GET" action="/hanoi">
  <input type="hidden" name="n" value="${escHtml(String(n))}">
  <input type="submit" value="Reset Game">
</form>
`}

<hr>
<form method="GET" action="/hanoi">
  <label for="newn2">Change number of disks (2-8):</label>
  <input type="number" id="newn2" name="n" value="${n}" min="2" max="8">
  <input type="submit" value="New Game">
</form>

<hr>
<address>Tower of Hanoi text-mode server | <a href="/hanoi">Home</a></address>
</body>
</html>`;
}

// ── Request parsing helpers ───────────────────────────────────────────────────

function parseQuery(str) {
  const params = {};
  if (!str) return params;
  str.replace(/^\?/, '').split('&').forEach(pair => {
    const [k, v] = pair.split('=').map(decodeURIComponent);
    if (k) params[k] = v ?? '';
  });
  return params;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

// ── Route handlers ────────────────────────────────────────────────────────────

function handleGet(query, res) {
  const n = Math.min(8, Math.max(2, parseInt(query.n || '4', 10)));
  const pegs = initPegs(n);
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(buildPage({ pegs, moves: 0, n, message: `New game with ${n} disks. Good luck!` }));
}

async function handleMove(req, res) {
  const body = await readBody(req);
  const params = parseQuery(body);

  const pegsRaw = params.pegs || '';
  const moves = parseInt(params.moves || '0', 10);
  const n = Math.min(8, Math.max(2, parseInt(params.n || '4', 10)));
  const from = parseInt(params.from, 10);
  const to = parseInt(params.to, 10);

  const pegs = decodePegs(pegsRaw);
  if (!pegs) {
    res.writeHead(302, { Location: '/hanoi' });
    res.end();
    return;
  }

  const next = applyMove(pegs, from, to);
  if (!next) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(buildPage({
      pegs,
      moves,
      n,
      error: from === to
        ? 'Source and destination must be different pegs.'
        : pegs[from].length === 0
          ? `${PEG_NAMES[from]} has no disk to move.`
          : `Cannot place disk ${pegs[from][pegs[from].length - 1]} on top of disk ${pegs[to][pegs[to].length - 1]}.`,
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(buildPage({
    pegs: next,
    moves: moves + 1,
    n,
    message: isWon(next) ? null : `Moved disk from ${PEG_NAMES[from]} to ${PEG_NAMES[to]}.`,
  }));
}

// ── Server ────────────────────────────────────────────────────────────────────

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (url.pathname === '/' || url.pathname === '') {
    res.writeHead(302, { Location: '/hanoi' });
    res.end();
    return;
  }

  if (url.pathname === '/hanoi' && req.method === 'GET') {
    handleGet(parseQuery(url.search), res);
    return;
  }

  if (url.pathname === '/hanoi/move' && req.method === 'POST') {
    await handleMove(req, res);
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found. Try /hanoi');
});

server.listen(PORT, () => {
  console.log(`Tower of Hanoi text-mode server running at http://localhost:${PORT}/hanoi`);
  console.log(`Open with:  lynx http://localhost:${PORT}/hanoi`);
  console.log(`       or:  curl http://localhost:${PORT}/hanoi`);
});
