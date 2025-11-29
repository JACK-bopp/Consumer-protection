const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

function loadEnv() {
  const envPath = path.join(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return {};
  const raw = fs.readFileSync(envPath, 'utf8');
  return raw.split(/\r?\n/).reduce((acc, line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return acc;
    const [key, ...rest] = trimmed.split('=');
    acc[key] = rest.join('=');
    return acc;
  }, {});
}

const env = { ...loadEnv(), ...process.env };
const PORT = Number(env.PORT || 5173);
const API_BASE_URL = env.API_BASE_URL;
const API_KEY = env.API_KEY;
const publicDir = path.join(process.cwd(), 'public');

function serveStatic(req, res) {
  const parsed = url.parse(req.url);
  let filePath = path.join(publicDir, parsed.pathname);
  if (parsed.pathname === '/') {
    filePath = path.join(publicDir, 'index.html');
  }

  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const contentType = {
      '.html': 'text/html',
      '.js': 'text/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
    }[ext] || 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
}

async function handleStatus(res) {
  if (!API_BASE_URL || !API_KEY) {
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: 'Missing API_BASE_URL or API_KEY. Set them in .env.' }));
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/status`, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    const body = await response.text();
    res.writeHead(response.status, { 'Content-Type': 'application/json' });
    res.end(body || JSON.stringify({ ok: false, error: 'Empty response from upstream' }));
  } catch (error) {
    res.writeHead(502, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: false, error: error.message }));
  }
}

const server = http.createServer((req, res) => {
  const parsed = url.parse(req.url);
  if (parsed.pathname === '/api/status') {
    handleStatus(res);
    return;
  }

  serveStatic(req, res);
});

server.listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
