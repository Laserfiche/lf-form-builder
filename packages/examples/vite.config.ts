import { defineConfig, ServerOptions } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';
import mkcert from 'vite-plugin-mkcert';
import config from './laserfiche.config.json';
import { compileLessToCss } from './scripts/compile-less-to-css.js';
// Import plugins from the core package build. Resolve the path to the
// core `dist/plugins` directory and require it at runtime so TypeScript
// doesn't try to include the external built JS under the examples
// project's `rootDir` during type-checking.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const corePluginsPath = path.resolve(__dirname, '..', 'core', 'dist', 'plugins');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { bundleLfless, disableSharedChunking, generateDirectoryHtml } = require(corePluginsPath);
import path from 'node:path';

const formsJS = config.forms.js;
const requestedFormEntry = process.env.FORM_ENTRY?.trim();

const input: Record<string, string> = {};

const formJSList = Object.entries(formsJS).filter(([name]) => (
  !requestedFormEntry || name === requestedFormEntry
));
if (formJSList.length === 0) {
  throw new Error(requestedFormEntry
    ? `Form entry "${requestedFormEntry}" was not found in laserfiche.config.json`
    : 'No forms found in config');
}
for (const [key, value] of formJSList) {
  input[key] = `${config.forms.rootDir}/${value}`;
}

const serverOptions: ServerOptions = {
  cors: true,
  headers: {
    'Access-Control-Allow-Private-Network': 'true',
  },
};

export default defineConfig(({ mode }) => {
  console.log(mode);
  return {
    // Use the monorepo root env file so examples and root scripts share one
    // local configuration source. Allow an override for ad hoc testing.
    envDir: process.env.VITE_ENV_DIR?.trim() || path.resolve(__dirname, '..', '..'),
    server: serverOptions,
    appType: 'custom',
    build: {
      minify: mode === 'development' ? false : true,
      sourcemap: mode === 'development' ? true : false,
      target: 'esnext',
      copyPublicDir: false,
      watch: mode === 'development'
        ? {
            exclude: [
              'dist/**',
              '../core/dist/**',
            ],
          }
        : undefined,
      rolldownOptions: {
        treeshake: mode === 'development' ? false : true,
        external: ['@laserfiche/lf-repository-api-client-v2'],
        input,
        output: {
          dir: 'dist',
          format: requestedFormEntry ? 'iife' : 'es',
          entryFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    plugins: [
      // Only enable mkcert when explicitly requested via env ENABLE_MKCERT=true
      // to avoid attempting to install root certificates automatically.
      ...(process.env.ENABLE_MKCERT === 'true' ? [mkcert()] : []),
      // Keep the default dev server on plain HTTP so watch-serve matches the
      // documented http://localhost:3000 workflow. Enable HTTPS explicitly.
      ...(process.env.ENABLE_BASIC_SSL === 'true' ? [basicSsl()] : []),
      disableSharedChunking(input),
      generateDirectoryHtml({
        templatePath: path.resolve(__dirname, 'public', 'index.html'),
      }),
      {
        name: 'copy-core-stripe-assets',
        configureServer: async () => {
          // Copy assets on dev server start so Stripe.js and its map are available
          try {
            const coreRoot = path.resolve(__dirname, '..', 'core');
            const coreStripeHtmlCandidates = [
              path.resolve(coreRoot, 'dist', 'plugins', 'Stripe', 'stripe.html'),
              path.resolve(coreRoot, 'src', 'plugins', 'Stripe', 'stripe.html'),
            ];
            const coreStripeJs = path.resolve(coreRoot, 'dist', 'Stripe.js');
            const destHtml = path.resolve(__dirname, 'dist', 'stripe.html');
            const destJs = path.resolve(__dirname, 'dist', 'Stripe.js');
            await mkdir(path.dirname(destHtml), { recursive: true });
            let coreStripeHtml: string | undefined;
            for (const candidate of coreStripeHtmlCandidates) {
              if (await asyncPathExists(candidate)) {
                coreStripeHtml = candidate;
                break;
              }
            }
            if (coreStripeHtml) {
              await copyFile(coreStripeHtml, destHtml);
            } else {
              console.warn('copy-core-stripe-assets: stripe.html is not available yet');
            }

            if (await asyncPathExists(coreStripeJs)) {
              await copyFile(coreStripeJs, destJs);
              // Also copy source map if present so dev tools can load it
              const coreStripeMap = `${coreStripeJs}.map`;
              const destMap = `${destJs}.map`;
              if (await asyncPathExists(coreStripeMap)) {
                await copyFile(coreStripeMap, destMap);
              }
            } else {
              console.warn('copy-core-stripe-assets: Stripe.js is not available yet');
            }
          } catch (e) {
            // best-effort copy; log error but don't fail dev server
            console.warn('copy-core-stripe-assets: failed to copy stripe assets from core dist', e);
          }
        },
        closeBundle: {
          sequential: true,
          async handler() {
            try {
              const coreRoot = path.resolve(__dirname, '..', 'core');
              const coreStripeHtmlCandidates = [
                path.resolve(coreRoot, 'dist', 'plugins', 'Stripe', 'stripe.html'),
                path.resolve(coreRoot, 'src', 'plugins', 'Stripe', 'stripe.html'),
              ];
              const coreStripeJs = path.resolve(coreRoot, 'dist', 'Stripe.js');
              const destHtml = path.resolve(__dirname, 'dist', 'stripe.html');
              const destJs = path.resolve(__dirname, 'dist', 'Stripe.js');
              await mkdir(path.dirname(destHtml), { recursive: true });
              let coreStripeHtml: string | undefined;
              for (const candidate of coreStripeHtmlCandidates) {
                if (await asyncPathExists(candidate)) {
                  coreStripeHtml = candidate;
                  break;
                }
              }
              if (coreStripeHtml) {
                await copyFile(coreStripeHtml, destHtml);
              } else {
                console.warn('copy-core-stripe-assets: stripe.html is not available yet');
              }

              if (await asyncPathExists(coreStripeJs)) {
                await copyFile(coreStripeJs, destJs);
                // Also copy source map if present so dev tools can load it
                const coreStripeMap = `${coreStripeJs}.map`;
                const destMap = `${destJs}.map`;
                if (await asyncPathExists(coreStripeMap)) {
                  await copyFile(coreStripeMap, destMap);
                }
              } else {
                console.warn('copy-core-stripe-assets: Stripe.js is not available yet');
              }
              // Stripe runtime is now bundled into core dist/Stripe.js,
              // so no separate helper file copy is needed.
            } catch (e) {
              // best-effort copy; log error but don't fail build
              console.warn('copy-core-stripe-assets: failed to copy stripe assets from core dist', e);
            }
          },
        },
      },
      {
        name: 'compile-less-to-css',
        closeBundle: {
          sequential: true,
          async handler() {
            await compileLessToCss(path.resolve(__dirname, 'dist'));
          },
        },
      },
      bundleLfless({
        validateSyntax: false,
      }),
    ],
  };
});
