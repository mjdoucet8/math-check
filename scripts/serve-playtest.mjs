import http from 'node:http';
import { readFile, realpath, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const host = option('--host', '127.0.0.1');
const port = Number(option('--port', '4173'));
const prefix = option('--prefix', '/');
if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !prefix?.startsWith('/') || !prefix.endsWith('/')) {
  throw new Error('Use --host ADDRESS, --port 1–65535 and --prefix /folder/.');
}
const root = await realpath(fileURLToPath(new URL('../dist/', import.meta.url)));
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405).end(); return; }
    const pathname = new URL(request.url, 'http://localhost').pathname;
    if (!pathname.startsWith(prefix)) { response.writeHead(404).end(); return; }
    const name = decodeURIComponent(pathname.slice(prefix.length)) || 'index.html';
    const file = await realpath(path.resolve(root, name));
    if (!file.startsWith(root + path.sep) || !(await stat(file)).isFile()) { response.writeHead(404).end(); return; }
    const data = await readFile(file);
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Content-Length': data.length, 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff' });
    response.end(request.method === 'HEAD' ? undefined : data);
  } catch { response.writeHead(404).end(); }
});
server.listen(port, host, () => {
  console.log(`Numora playtest: http://${host}:${port}${prefix}`);
  if (host === '0.0.0.0') console.log('On your tablet, use this computer’s local Wi-Fi IP instead of 0.0.0.0.');
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close());
