import { createRequire } from 'node:module';

declare global {
  // Mongoose and some CJS deps call require() at runtime in Vercel's ESM functions.
  var require: NodeRequire;
}

if (typeof globalThis.require === 'undefined') {
  globalThis.require = createRequire(import.meta.url);
}
