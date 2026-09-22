/**
 * Minimal demo web application for the automation framework example tests.
 *
 * Serves the static pages in /demo and handles the login form POST so the
 * example BDD scenarios have a real, self-contained target to run against.
 *
 * Run: npm run demo
 * (optionally DEMO_PORT=3000 npm run demo)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.DEMO_PORT) || 3000;
const VALID_USER = process.env.DEMO_USER || 'demo';
const VALID_PASS = process.env.DEMO_PASS || 'password';

const DEMO_DIR = path.join(__dirname, '..', 'demo');
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
};

function sendFile(res, filePath) {
  if (!filePath.startsWith(DEMO_DIR)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }
  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(content);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

  // Handle login form submission.
  if (req.method === 'POST' && url.pathname === '/login') {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      const data = new URLSearchParams(body);
      if (data.get('username') === VALID_USER && data.get('password') === VALID_PASS) {
        res.writeHead(302, { Location: '/dashboard' });
      } else {
        res.writeHead(302, { Location: '/login?error=invalid' });
      }
      res.end();
    });
    return;
  }

  // Route to static pages.
  let filePath;
  if (url.pathname === '/' || url.pathname === '/login') {
    filePath = path.join(DEMO_DIR, 'login.html');
  } else if (url.pathname === '/dashboard') {
    filePath = path.join(DEMO_DIR, 'dashboard.html');
  } else {
    filePath = path.join(DEMO_DIR, url.pathname);
  }

  sendFile(res, filePath);
});

server.listen(PORT, () => {
  console.log(`Demo app running at http://localhost:${PORT}`);
});
