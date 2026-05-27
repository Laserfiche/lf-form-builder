import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import config from '../laserfiche.config.json' with { type: 'json' };

const args = process.argv.slice(2);
const mode = args[0] ?? 'development';
const watch = args.includes('--watch');
const formNames = Object.keys(config.forms?.js ?? {});

if (formNames.length === 0) {
  console.error('No forms found in laserfiche.config.json');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const vitePackageJson = require.resolve('vite/package.json');
const viteBin = path.resolve(path.dirname(vitePackageJson), 'bin', 'vite.js');

const spawnFormBuild = (formName) => spawn(
    process.execPath,
    [viteBin, 'build', '--mode', mode, ...(watch ? ['--watch'] : [])],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        FORM_ENTRY: formName,
      },
    },
  );

const runFormBuild = (formName) => new Promise((resolve, reject) => {
  const child = spawnFormBuild(formName);

  child.on('error', reject);
  child.on('exit', (code) => {
    if (code === 0 || (watch && code === null)) {
      resolve(child);
      return;
    }
    reject(new Error(`vite build failed for ${formName} with exit code ${code ?? 'unknown'}`));
  });
});

async function main() {
  if (watch) {
    const children = formNames.map((formName) => {
      console.log(`[examples] starting watch for ${formName}`);
      const child = spawnFormBuild(formName);
      child.on('error', (error) => {
        console.error(`[examples] watch failed for ${formName}:`, error);
        process.exitCode = 1;
      });
      child.on('exit', (code) => {
        if (code && code !== 0) {
          console.error(`[examples] watch exited for ${formName} with code ${code}`);
          process.exitCode = code;
        }
      });
      return child;
    });

    const stopChildren = () => {
      for (const child of children) {
        child.kill();
      }
    };

    process.on('SIGINT', () => {
      stopChildren();
      process.exit();
    });

    process.on('SIGTERM', () => {
      stopChildren();
      process.exit();
    });

    await new Promise(() => {
      // Keep the parent process alive while watchers run.
    });
    return;
  }

  for (const formName of formNames) {
    console.log(`[examples] building ${formName}`);
    await runFormBuild(formName);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});