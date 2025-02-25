/* eslint-disable no-undef, @typescript-eslint/no-floating-promises */
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { build } from 'esbuild';

(async function main() {
  console.log('🚀 Building HTTP Broker Worker...');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const nodeOutputPath = `${__dirname}/dist/index.nodejs.js`;
  const workerOutputPath = `${__dirname}/dist/index.worker.js`;

  await Promise.all([
    // Build for integration tests, and expect it to run on NodeJS
    build({
      entryPoints: [`${__dirname}/src/dev.ts`],
      bundle: true,
      platform: 'node',
      target: 'node18',
      minify: false,
      outfile: nodeOutputPath,
      treeShaking: true,
    }).then(result => {
      console.log(`✅ Built for NodeJS: "${nodeOutputPath}"`);
      return result;
    }),
    // Build for CloudFlare Worker environment
    build({
      entryPoints: [`${__dirname}/src/index.ts`],
      bundle: true,
      platform: 'browser',
      target: 'chrome95',
      minify: false,
      outfile: workerOutputPath,
      treeShaking: true,
    }).then(result => {
      console.log(`✅ Built for CloudFlare Worker: "${workerOutputPath}"`);
      return result;
    }),
  ]);
})();
