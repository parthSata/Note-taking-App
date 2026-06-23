import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, '../.vercel/output');
const configPath = path.join(outputDir, 'config.json');
const funcDir = path.join(outputDir, 'functions/api.func');
const indexPath = path.join(funcDir, 'index.js');
const appPath = path.join(funcDir, 'app.mjs');
const apiFuncPkgPath = path.join(funcDir, 'package.json');
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

// ESM hoists static imports, so mongoose loads before inline polyfills run.
// Bootstrap sets require polyfill first, then dynamically imports the app bundle.
const bundle = readFileSync(indexPath, 'utf-8').replace(
  /typeof globalThis\.require[^;]+;/g,
  '',
);

writeFileSync(appPath, bundle);

const bootstrap = `import { createRequire } from 'node:module';

if (typeof globalThis.require === 'undefined') {
  globalThis.require = createRequire(import.meta.url);
}

const { default: handler } = await import('./app.mjs');
export default handler;
`;

writeFileSync(indexPath, bootstrap);

// Install runtime deps into the function bundle so Vercel has mongoose etc. at cold start.
execSync('npm install --omit=dev --no-audit --no-fund', {
  cwd: funcDir,
  stdio: 'inherit',
});
