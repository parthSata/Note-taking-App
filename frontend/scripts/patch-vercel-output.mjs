import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const configPath = path.join(__dirname, '../.vercel/output/config.json');

const config = JSON.parse(readFileSync(configPath, 'utf-8'));

const hasSpaFallback = config.routes?.some((route) => route.dest === '/index.html');

if (!hasSpaFallback) {
  config.routes.push({
    src: '/(.*)',
    dest: '/index.html',
  });
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
