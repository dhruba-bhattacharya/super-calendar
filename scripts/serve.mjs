import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
http.createServer(async (req, res) => {
  const path = req.url === '/' ? 'index.html' : req.url.slice(1);
  try { const file = await readFile(join('dist', path)); res.writeHead(200, { 'content-type': types[extname(path)] || 'text/plain' }); res.end(file); }
  catch { res.writeHead(404); res.end('Not found'); }
}).listen(4173, () => console.log('Preview running at http://localhost:4173'));
