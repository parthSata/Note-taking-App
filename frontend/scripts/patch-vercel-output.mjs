import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../.vercel/output');
const configPath = path.join(outputDir, 'config.json');
const apiFuncPkgPath = path.join(outputDir, 'functions/api.func/package.json');
const backendPkgPath = path.join(__dirname, '../../backend/package.json');

const config = JSON.parse(readFileSync(configPath, 'utf-8'));

const hasSpaFallback = config.routes?.some((route) => route.dest === '/index.html');

if (!hasSpaFallback) {
  config.routes.push({
    src: '/(.*)',
    dest: '/index.html',
  });
}

writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);

const backendPkg = JSON.parse(readFileSync(backendPkgPath, 'utf-8'));

const apiDependencies = {
  hono: backendPkg.dependencies.hono,
  '@hono/node-server': backendPkg.dependencies['@hono/node-server'],
  '@hono/zod-validator': backendPkg.dependencies['@hono/zod-validator'],
  mongoose: backendPkg.dependencies.mongoose,
  bcryptjs: backendPkg.dependencies.bcryptjs,
  jsonwebtoken: backendPkg.dependencies.jsonwebtoken,
  zod: backendPkg.dependencies.zod,
};

writeFileSync(
  apiFuncPkgPath,
  `${JSON.stringify({ type: 'module', dependencies: apiDependencies }, null, 2)}\n`,
);
