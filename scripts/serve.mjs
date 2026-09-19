import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { BASE_PATH } from '../lib/config.mjs';
const root = path.resolve('dist');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
};
const port = Number(process.env.PORT || 4173);
http
  .createServer(async (req, res) => {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/' && BASE_PATH !== '/') {
      res.writeHead(302, { Location: BASE_PATH });
      res.end();
      return;
    }
    if (!pathname.startsWith(BASE_PATH)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    let file = path.resolve(root, pathname.slice(BASE_PATH.length) || '.');
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403);
      res.end();
      return;
    }
    try {
      if ((await fs.stat(file)).isDirectory()) file = path.join(file, 'index.html');
      const data = await fs.readFile(file);
      res.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      });
      res.end(data);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(await fs.readFile(path.join(root, '404.html')));
    }
  })
  .listen(port, '127.0.0.1', () => console.log(`Atlas: http://127.0.0.1:${port}${BASE_PATH}`));
